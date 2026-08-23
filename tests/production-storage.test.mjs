import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/storage.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/storage/supabase-storage.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/0006_supabase_storage_files.sql', import.meta.url), 'utf8');
const propertyRoute = readFileSync(new URL('../app/api/storage/property-images/route.ts', import.meta.url), 'utf8');
const profileRoute = readFileSync(new URL('../app/api/storage/profile-image/route.ts', import.meta.url), 'utf8');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');

for (const envName of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY']) {
  assert.ok(envExample.includes(`${envName}=`), `Missing Supabase Storage env var ${envName}`);
}
for (const bucket of ['property-images', 'profile-images']) assert.ok(migration.includes(bucket), `Missing storage bucket ${bucket}`);
assert.ok(migration.includes('insert into storage.buckets'), 'Migration must create Supabase Storage buckets');
assert.ok(migration.includes('create table if not exists storage_files'), 'Migration must create storage_files metadata table');
for (const column of ['user_id', 'property_id', 'file_name', 'storage_path', 'upload_date']) assert.ok(migration.includes(column), `Missing storage metadata column ${column}`);
for (const mime of ['image/jpeg', 'image/png', 'image/webp']) assert.ok(domain.includes(mime) && migration.includes(mime), `Missing image type ${mime}`);
assert.ok(domain.includes('PROPERTY_IMAGE_MAX_BYTES') && domain.includes('PROFILE_IMAGE_MAX_BYTES'), 'Storage file size limits must be defined');
assert.ok(service.includes('/storage/v1/object/'), 'Supabase Storage object API must be used');
assert.ok(service.includes('/storage/v1/object/sign/'), 'Supabase Storage signed retrieval must be implemented');
assert.ok(service.includes("method: 'DELETE'"), 'Supabase Storage deletion must be implemented');
assert.ok(service.includes('property_media'), 'Property image uploads must integrate existing property media metadata');
assert.ok(service.includes('user_profiles'), 'Profile image uploads must integrate existing user profile metadata');
assert.ok(propertyRoute.includes('requireApiUser') && profileRoute.includes('requireApiUser'), 'Storage upload routes must require authentication');
assert.ok(!service.includes('writeFile') && !service.includes('createWriteStream') && !service.includes('node:fs'), 'Production storage service must not use local filesystem storage');
console.log('PataSpace production Supabase Storage checks passed.');
