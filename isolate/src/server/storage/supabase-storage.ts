import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { PROPERTY_IMAGE_AUTHENTICITY_POLICY } from '@/domain/image-authenticity';
import { safeFileExtension, STORAGE_BUCKETS, validateImageFile, type StorageBucketId, type StorageFileRole, type StoredFileMetadata } from '@/domain/storage';
import { query, transaction } from '@/server/database/client';
import { readPropertyStore } from '@/server/properties/store';

function getSupabaseStorageConfig(): { url: string; secretKey: string; publishableKey?: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error('Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment.');
  }
  return { url: url.replace(/\/$/, ''), secretKey, publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
}

function storageHeaders(contentType?: string): HeadersInit {
  const config = getSupabaseStorageConfig();
  return {
    apikey: config.publishableKey || config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    ...(contentType ? { 'Content-Type': contentType } : {})
  };
}

function sanitizeFileName(fileName: string): string {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 120) || 'image';
}

function buildStoragePath(input: { userId: string; propertyId?: string; bucketId: StorageBucketId; fileName: string; mimeType: string }): string {
  const extension = safeFileExtension(input.fileName, input.mimeType);
  const safeName = sanitizeFileName(input.fileName).replace(/\.[^.]+$/, '');
  if (input.bucketId === STORAGE_BUCKETS.propertyImages) {
    return `properties/${input.propertyId}/${input.userId}/${Date.now()}-${randomUUID()}-${safeName}.${extension}`;
  }
  return `profiles/${input.userId}/${Date.now()}-${randomUUID()}-${safeName}.${extension}`;
}

async function uploadObject(input: { bucketId: StorageBucketId; storagePath: string; body: Buffer; contentType: string }): Promise<void> {
  const config = getSupabaseStorageConfig();
  const uploadUrl = `${config.url}/storage/v1/object/${input.bucketId}/${input.storagePath}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { ...storageHeaders(input.contentType), 'x-upsert': 'true', 'cache-control': '3600' },
    body: input.body as unknown as BodyInit
  });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Supabase Storage upload failed: ${message || response.status}`);
  }
}

async function deleteObject(bucketId: StorageBucketId, storagePath: string): Promise<void> {
  const config = getSupabaseStorageConfig();
  const response = await fetch(`${config.url}/storage/v1/object/${bucketId}`, {
    method: 'DELETE',
    headers: storageHeaders('application/json'),
    body: JSON.stringify({ prefixes: [storagePath] })
  });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Supabase Storage delete failed: ${message || response.status}`);
  }
}

async function createSignedUrl(bucketId: StorageBucketId, storagePath: string): Promise<string | undefined> {
  try {
    const config = getSupabaseStorageConfig();
    const response = await fetch(`${config.url}/storage/v1/object/sign/${bucketId}/${storagePath}`, {
      method: 'POST',
      headers: storageHeaders('application/json'),
      body: JSON.stringify({ expiresIn: 60 * 60 })
    });
    if (!response.ok) return undefined;
    const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
    const signedPath = payload.signedURL ?? payload.signedUrl;
    if (!signedPath) return undefined;
    return signedPath.startsWith('http') ? signedPath : `${config.url}/storage/v1${signedPath}`;
  } catch {
    return undefined;
  }
}

export async function evaluateAndMaybeEnhancePropertyImage(input: { buffer: Buffer; mimeType: string }): Promise<{ buffer: Buffer; applied: boolean; notes: string[]; decision: 'no-processing-needed' | 'minimal-technical-correction-needed' }> {
  const notes: string[] = [PROPERTY_IMAGE_AUTHENTICITY_POLICY.goal];
  try {
    const source = sharp(input.buffer, { failOn: 'none' }).rotate();
    const metadata = await source.metadata();
    const stats = await source.clone().resize({ width: 320, withoutEnlargement: true }).greyscale().stats();
    const mean = stats.channels[0]?.mean ?? 128;
    const stdev = stats.channels[0]?.stdev ?? 40;

    const isTooDark = mean < 72;
    const isTooBright = mean > 225;
    const isLowContrast = stdev < 22;
    const isVerySmall = Boolean(metadata.width && metadata.width < 900);
    const needsOrientationOnly = Boolean(metadata.orientation && metadata.orientation !== 1);
    const needsTechnicalCorrection = isTooDark || isTooBright || isLowContrast || isVerySmall || needsOrientationOnly;

    notes.push(`Quality check: brightness=${Math.round(mean)}, contrast=${Math.round(stdev)}, width=${metadata.width ?? 'unknown'}.`);

    if (!needsTechnicalCorrection) {
      notes.push('NO PROCESSING NEEDED: photograph is sufficiently bright, naturally balanced, and technically usable. Original image is used as the listing image.');
      return { buffer: input.buffer, applied: false, notes, decision: 'no-processing-needed' };
    }

    let pipeline = sharp(input.buffer, { failOn: 'none' }).rotate();
    if (isVerySmall && metadata.width) {
      pipeline = pipeline.resize({ width: Math.min(1200, Math.round(metadata.width * 1.25)), withoutEnlargement: false, fit: 'inside' });
      notes.push('Applied conservative resolution improvement because source image was small; no new property details are generated.');
    }

    if (isTooDark) {
      pipeline = pipeline.modulate({ brightness: 1.10, saturation: 1.0 }).linear(1.04, 1);
      notes.push('Applied conservative exposure correction because the photograph was too dark.');
    } else if (isTooBright) {
      pipeline = pipeline.modulate({ brightness: 0.97, saturation: 1.0 });
      notes.push('Applied conservative exposure reduction because the photograph was over-bright.');
    }

    if (isLowContrast) {
      pipeline = pipeline.linear(1.05, -3);
      notes.push('Applied mild contrast correction because visibility was low.');
    }

    if (isTooDark || isLowContrast || isVerySmall) {
      pipeline = pipeline.sharpen({ sigma: 0.45, m1: 0.25, m2: 0.55 });
      notes.push('Applied very mild sharpening only to improve camera clarity without inventing details.');
    }

    const output = await pipeline.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    notes.push('No generative edits, beautification, defect removal, furnishing, room enlargement, artificial lighting, or property redesign are permitted.');
    return { buffer: output, applied: true, notes, decision: 'minimal-technical-correction-needed' };
  } catch {
    notes.push('Enhancement skipped because safe processing was not possible; original photograph remains preserved and displayed.');
    return { buffer: input.buffer, applied: false, notes, decision: 'no-processing-needed' };
  }
}

function toMetadata(row: any): StoredFileMetadata {
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id ?? undefined,
    bucketId: row.bucket_id,
    fileRole: row.file_role,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSizeBytes: Number(row.file_size_bytes),
    storagePath: row.storage_path,
    originalStoragePath: row.original_storage_path ?? undefined,
    enhancedStoragePath: row.enhanced_storage_path ?? undefined,
    enhancementApplied: row.enhancement_applied ?? false,
    authenticityPolicyVersion: row.authenticity_policy_version ?? undefined,
    uploadDate: row.upload_date instanceof Date ? row.upload_date.toISOString() : row.upload_date
  };
}

async function assertCanManagePropertyImages(userId: string, propertyId: string): Promise<void> {
  const store = await readPropertyStore();
  const property = store.properties.find((item) => item.id === propertyId || (item as { propertyFoundationId?: string }).propertyFoundationId === propertyId);
  if (!property || property.registeredByUserId !== userId) throw new Error('You are not authorized to manage images for this property.');
}

export async function uploadPropertyImage(input: { userId: string; propertyId: string; file: File; role: 'property-cover-image' | 'property-gallery-image' }): Promise<StoredFileMetadata> {
  await assertCanManagePropertyImages(input.userId, input.propertyId);
  const validation = validateImageFile({ fileName: input.file.name, mimeType: input.file.type, size: input.file.size, bucketId: STORAGE_BUCKETS.propertyImages });
  if (!validation.valid) throw new Error(validation.message);
  const safeName = sanitizeFileName(input.file.name).replace(/\.[^.]+$/, '');
  const originalExtension = safeFileExtension(input.file.name, input.file.type);
  const imageGroup = input.role === 'property-cover-image' ? 'cover' : 'gallery';
  const basePath = `properties/${input.propertyId}/${imageGroup}/${input.userId}/${Date.now()}-${randomUUID()}-${safeName}`;
  const originalStoragePath = `${basePath}-original.${originalExtension}`;
  const enhancedStoragePath = `${basePath}-display.jpg`;
  const originalBuffer = Buffer.from(await input.file.arrayBuffer());
  const enhanced = await evaluateAndMaybeEnhancePropertyImage({ buffer: originalBuffer, mimeType: input.file.type });
  await uploadObject({ bucketId: STORAGE_BUCKETS.propertyImages, storagePath: originalStoragePath, body: originalBuffer, contentType: input.file.type });
  if (enhanced.applied) {
    await uploadObject({ bucketId: STORAGE_BUCKETS.propertyImages, storagePath: enhancedStoragePath, body: enhanced.buffer, contentType: 'image/jpeg' });
  }
  const displayPath = enhanced.applied ? enhancedStoragePath : originalStoragePath;
  const storedEnhancedPath = enhanced.applied ? enhancedStoragePath : originalStoragePath;
  const result = await transaction(async (client) => {
    const meta = await client.query(
      `insert into storage_files (user_id, property_id, bucket_id, file_role, file_name, mime_type, file_size_bytes, storage_path, original_storage_path, enhanced_storage_path, enhancement_applied, processing_status, enhancement_mode, authenticity_policy_version, enhancement_notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'technical-quality-only','property-image-authenticity-v1',$13) returning *`,
      [input.userId, input.propertyId, STORAGE_BUCKETS.propertyImages, input.role, input.file.name, input.file.type, input.file.size, displayPath, originalStoragePath, storedEnhancedPath, enhanced.applied, enhanced.decision, enhanced.notes]
    );
    await client.query(
      `insert into property_media (property_id, media_type, url, original_url, enhanced_url, file_name, is_cover, cover_order, uploaded_by, enhancement_applied, processing_status, authenticity_policy_version)
       values ($1,'image',$2,$3,$4,$5,$6,$7,$8,$9,$10,'property-image-authenticity-v1')`,
      [input.propertyId, displayPath, originalStoragePath, storedEnhancedPath, input.file.name, input.role === 'property-cover-image', input.role === 'property-cover-image' ? 1 : null, input.userId, enhanced.applied, enhanced.decision]
    );
    return meta.rows[0];
  });
  const metadata = toMetadata(result);
  metadata.signedUrl = await createSignedUrl(metadata.bucketId, metadata.storagePath);
  if (metadata.originalStoragePath) metadata.originalSignedUrl = await createSignedUrl(metadata.bucketId, metadata.originalStoragePath);
  return metadata;
}

export async function uploadProfileImage(input: { userId: string; file: File }): Promise<StoredFileMetadata> {
  const validation = validateImageFile({ fileName: input.file.name, mimeType: input.file.type, size: input.file.size, bucketId: STORAGE_BUCKETS.profileImages });
  if (!validation.valid) throw new Error(validation.message);
  const storagePath = buildStoragePath({ userId: input.userId, bucketId: STORAGE_BUCKETS.profileImages, fileName: input.file.name, mimeType: input.file.type });
  await uploadObject({ bucketId: STORAGE_BUCKETS.profileImages, storagePath, body: Buffer.from(await input.file.arrayBuffer()), contentType: input.file.type });
  const result = await transaction(async (client) => {
    await client.query(`update storage_files set deleted_at=now(), updated_at=now() where user_id=$1 and bucket_id=$2 and file_role='profile-image' and deleted_at is null`, [input.userId, STORAGE_BUCKETS.profileImages]);
    const meta = await client.query(
      `insert into storage_files (user_id, bucket_id, file_role, file_name, mime_type, file_size_bytes, storage_path)
       values ($1,$2,'profile-image',$3,$4,$5,$6) returning *`,
      [input.userId, STORAGE_BUCKETS.profileImages, input.file.name, input.file.type, input.file.size, storagePath]
    );
    await client.query(`update user_profiles set profile_photo_url=$1, updated_at=now() where user_id=$2`, [storagePath, input.userId]);
    return meta.rows[0];
  });
  const metadata = toMetadata(result);
  metadata.signedUrl = await createSignedUrl(metadata.bucketId, metadata.storagePath);
  return metadata;
}

export async function listPropertyImages(input: { userId: string; propertyId: string }): Promise<StoredFileMetadata[]> {
  await assertCanManagePropertyImages(input.userId, input.propertyId);
  const result = await query(
    `select * from storage_files where property_id::text=$1 and bucket_id=$2 and deleted_at is null order by upload_date desc`,
    [input.propertyId, STORAGE_BUCKETS.propertyImages]
  );
  return Promise.all(result.rows.map(async (row) => {
    const metadata = toMetadata(row);
    metadata.signedUrl = await createSignedUrl(metadata.bucketId, metadata.storagePath);
    if (metadata.originalStoragePath) metadata.originalSignedUrl = await createSignedUrl(metadata.bucketId, metadata.originalStoragePath);
    return metadata;
  }));
}

export async function getCurrentProfileImage(userId: string): Promise<StoredFileMetadata | null> {
  const result = await query(
    `select * from storage_files where user_id=$1 and bucket_id=$2 and file_role='profile-image' and deleted_at is null order by upload_date desc limit 1`,
    [userId, STORAGE_BUCKETS.profileImages]
  );
  if (!result.rows[0]) return null;
  const metadata = toMetadata(result.rows[0]);
  metadata.signedUrl = await createSignedUrl(metadata.bucketId, metadata.storagePath);
  return metadata;
}

export async function deleteStoredFile(input: { userId: string; fileId: string }): Promise<{ deleted: true }> {
  const result = await query(`select * from storage_files where id::text=$1 and user_id=$2 and deleted_at is null limit 1`, [input.fileId, input.userId]);
  const row = result.rows[0];
  if (!row) throw new Error('File was not found or you are not allowed to delete it.');
  await deleteObject(row.bucket_id, row.storage_path);
  if (row.original_storage_path && row.original_storage_path !== row.storage_path) await deleteObject(row.bucket_id, row.original_storage_path);
  if (row.enhanced_storage_path && row.enhanced_storage_path !== row.storage_path && row.enhanced_storage_path !== row.original_storage_path) await deleteObject(row.bucket_id, row.enhanced_storage_path);
  await transaction(async (client) => {
    await client.query(`update storage_files set deleted_at=now(), updated_at=now() where id=$1`, [row.id]);
    if (row.file_role === 'profile-image') {
      await client.query(`update user_profiles set profile_photo_url=null, updated_at=now() where user_id=$1 and profile_photo_url=$2`, [input.userId, row.storage_path]);
    }
    if (row.bucket_id === STORAGE_BUCKETS.propertyImages) {
      await client.query(`update property_media set deleted_at=now() where uploaded_by=$1 and (url=$2 or original_url=$2 or enhanced_url=$2) and deleted_at is null`, [input.userId, row.storage_path]);
    }
  });
  return { deleted: true };
}
