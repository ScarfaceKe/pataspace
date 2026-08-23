-- Phase 4 production Supabase Storage integration.
-- Creates only the Founder-approved storage buckets and normalized file metadata.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-images', 'property-images', false, 10485760, array['image/jpeg','image/png','image/webp']::text[]),
  ('profile-images', 'profile-images', false, 5242880, array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists storage_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  bucket_id text not null check (bucket_id in ('property-images','profile-images')),
  file_role text not null check (file_role in ('property-cover-image','property-gallery-image','profile-image')),
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  file_size_bytes bigint not null check (file_size_bytes > 0),
  storage_path text not null unique,
  upload_date timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint storage_files_property_required check (
    (bucket_id = 'property-images' and property_id is not null and file_role in ('property-cover-image','property-gallery-image'))
    or (bucket_id = 'profile-images' and property_id is null and file_role = 'profile-image')
  )
);

create index if not exists idx_storage_files_user on storage_files(user_id, upload_date desc) where deleted_at is null;
create index if not exists idx_storage_files_property on storage_files(property_id, file_role, upload_date desc) where deleted_at is null;
create index if not exists idx_storage_files_bucket_path on storage_files(bucket_id, storage_path) where deleted_at is null;

alter table storage_files enable row level security;
drop policy if exists service_role_all on storage_files;
create policy service_role_all on storage_files for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
