-- Property image authenticity and technical-quality-only enhancement metadata.
-- Preserves original uploads separately from conservative enhanced display versions.

alter table storage_files add column if not exists original_storage_path text;
alter table storage_files add column if not exists enhanced_storage_path text;
alter table storage_files add column if not exists enhancement_applied boolean not null default false;
alter table storage_files add column if not exists processing_status text not null default 'no-processing-needed' check (processing_status in ('no-processing-needed','minimal-technical-correction-needed','processing-skipped'));
alter table storage_files add column if not exists enhancement_mode text check (enhancement_mode in ('technical-quality-only'));
alter table storage_files add column if not exists authenticity_policy_version text not null default 'property-image-authenticity-v1';
alter table storage_files add column if not exists enhancement_notes jsonb not null default '[]'::jsonb;

alter table property_media add column if not exists original_url text;
alter table property_media add column if not exists enhanced_url text;
alter table property_media add column if not exists enhancement_applied boolean not null default false;
alter table property_media add column if not exists processing_status text not null default 'no-processing-needed' check (processing_status in ('no-processing-needed','minimal-technical-correction-needed','processing-skipped'));
alter table property_media add column if not exists authenticity_policy_version text not null default 'property-image-authenticity-v1';

create index if not exists idx_storage_files_original_path on storage_files(original_storage_path) where deleted_at is null;
create index if not exists idx_property_media_original_enhanced on property_media(original_url, enhanced_url) where deleted_at is null;
