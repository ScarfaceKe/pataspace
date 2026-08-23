-- Mandatory property location verification support.
-- Stores precise GPS coordinates, accuracy, adjusted pin, and human-readable address on normalized properties.

alter table properties add column if not exists location_latitude double precision;
alter table properties add column if not exists location_longitude double precision;
alter table properties add column if not exists location_gps_accuracy_meters numeric(10,2);
alter table properties add column if not exists location_human_readable_address text;
alter table properties add column if not exists location_nearby_road text;
alter table properties add column if not exists location_pin_adjusted boolean not null default false;
alter table properties add column if not exists location_verified boolean not null default false;
alter table properties add column if not exists location_captured_at timestamptz;
alter table properties add column if not exists location_verification_mode text check (location_verification_mode in ('standing-at-property','current-location'));

create index if not exists idx_properties_location_coordinates on properties(location_latitude, location_longitude) where location_verified = true;
create index if not exists idx_properties_location_verified on properties(location_verified, location_captured_at desc);
