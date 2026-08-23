export type StorageBucketId = 'property-images' | 'profile-images';
export type StorageFileRole = 'property-cover-image' | 'property-gallery-image' | 'profile-image';

export const STORAGE_BUCKETS = {
  propertyImages: 'property-images' as const,
  profileImages: 'profile-images' as const
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const PROPERTY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export interface StoredFileMetadata {
  id: string;
  userId: string;
  propertyId?: string;
  bucketId: StorageBucketId;
  fileRole: StorageFileRole;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storagePath: string;
  originalStoragePath?: string;
  enhancedStoragePath?: string;
  enhancementApplied?: boolean;
  authenticityPolicyVersion?: string;
  uploadDate: string;
  signedUrl?: string;
  originalSignedUrl?: string;
}

export function validateImageFile(input: { fileName: string; mimeType: string; size: number; bucketId: StorageBucketId }): { valid: boolean; message?: string } {
  if (!input.fileName.trim()) return { valid: false, message: 'Choose an image file to upload.' };
  if (!ALLOWED_IMAGE_TYPES.includes(input.mimeType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { valid: false, message: 'Upload a JPG, PNG, or WebP image.' };
  }
  const maxSize = input.bucketId === 'property-images' ? PROPERTY_IMAGE_MAX_BYTES : PROFILE_IMAGE_MAX_BYTES;
  if (input.size <= 0) return { valid: false, message: 'Choose a valid image file.' };
  if (input.size > maxSize) {
    const mb = Math.floor(maxSize / (1024 * 1024));
    return { valid: false, message: `Image is too large. Maximum allowed size is ${mb}MB.` };
  }
  return { valid: true };
}

export function safeFileExtension(fileName: string, mimeType: string): 'jpg' | 'png' | 'webp' {
  const lower = fileName.toLowerCase();
  if (mimeType === 'image/png' || lower.endsWith('.png')) return 'png';
  if (mimeType === 'image/webp' || lower.endsWith('.webp')) return 'webp';
  return 'jpg';
}
