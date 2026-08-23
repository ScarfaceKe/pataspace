-- PataSpace production Supabase PostgreSQL schema
-- Generated for Master Production Implementation Phase 1.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists app_store_documents (
  store_key text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_app_store_documents_data_gin on app_store_documents using gin (data);

create table if not exists roles (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id text not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null unique,
  email citext not null unique,
  role_id text not null references roles(id),
  password_hash text not null,
  status text not null default 'active' check (status in ('active','pending-verification','suspended','closed')),
  failed_login_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_users_role_status on users(role_id, status);
create index if not exists idx_users_email on users(email);

create table if not exists user_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  profile_photo_url text,
  preferred_notification_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists idx_sessions_user_active on sessions(user_id, expires_at, revoked_at);

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists counties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists localities (
  id uuid primary key default gen_random_uuid(),
  county_id uuid references counties(id),
  parent_id uuid references localities(id),
  name text not null,
  locality_type text not null check (locality_type in ('sub-county','constituency','city','town','estate','neighbourhood','village','trading-centre','other-locality')),
  aliases text[] not null default '{}',
  validated boolean not null default false,
  source text not null default 'seeded' check (source in ('seeded','registration-learning','founder-managed')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (county_id, parent_id, name, locality_type)
);
create index if not exists idx_localities_county_type on localities(county_id, locality_type);
create index if not exists idx_localities_name_trgm_like on localities(lower(name));

create table if not exists property_categories (
  id text primary key check (id in ('houses','shops','offices','event-halls')),
  name text not null unique
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references property_categories(id),
  registered_by uuid references users(id),
  owner_user_id uuid references users(id),
  manager_user_id uuid references users(id),
  leasing_agent_user_id uuid references users(id),
  county_id uuid references counties(id),
  town_id uuid references localities(id),
  estate_id uuid references localities(id),
  street text,
  landmark text,
  description text,
  ownership_role text check (ownership_role in ('owner','property-manager','leasing-agent')),
  status text not null default 'draft' check (status in ('draft','active','waiting-for-verification','occupied')),
  verification_status text not null default 'waiting-for-verification' check (verification_status in ('pending-verification','verified','waiting-for-verification','verification-failed')),
  electricity jsonb,
  responsibility_links jsonb not null default '{}'::jsonb,
  review_flags text[] not null default '{}',
  duplicate_candidate_ids uuid[] not null default '{}',
  location_review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  deleted_at timestamptz
);
create index if not exists idx_properties_category_status on properties(category_id, status, verification_status);
create index if not exists idx_properties_location on properties(county_id, town_id, estate_id);
create index if not exists idx_properties_registered_by on properties(registered_by);

create table if not exists property_contacts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  user_id uuid references users(id),
  contact_role text not null check (contact_role in ('property-owner','property-manager','leasing-agent')),
  full_name text,
  phone_number text,
  email citext,
  created_at timestamptz not null default now(),
  unique(property_id, contact_role, user_id)
);

create table if not exists property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  media_type text not null check (media_type in ('image','video','document')),
  url text not null,
  file_name text,
  caption text,
  is_cover boolean not null default false,
  cover_order integer check (cover_order between 1 and 2),
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_property_media_property on property_media(property_id, media_type, is_cover);

create table if not exists residential_properties (
  property_id uuid primary key references properties(id) on delete cascade,
  residential_category text not null,
  property_name text,
  number_of_units integer check (number_of_units > 0),
  number_of_floors integer,
  vacant_unit_floor integer,
  monthly_rent numeric(12,2),
  deposit_amount numeric(12,2),
  deposit_structure text,
  water jsonb not null,
  nearby_places jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shop_properties (
  property_id uuid primary key references properties(id) on delete cascade,
  shop_type text not null,
  commercial_unit_type text not null,
  custom_commercial_unit_type text,
  pricing_category text not null check (pricing_category in ('small-shop','medium-shop','large-shop')),
  road_visibility text not null,
  shop_name text,
  number_of_shop_units integer check (number_of_shop_units > 0),
  number_of_floors integer,
  vacant_shop_floor integer,
  monthly_rent numeric(12,2),
  deposit_amount numeric(12,2),
  deposit_structure text,
  water jsonb not null,
  business_suitability text[] not null default '{}',
  nearby_places jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists office_properties (
  property_id uuid primary key references properties(id) on delete cascade,
  office_type text not null,
  road_visibility text not null,
  office_name text,
  number_of_office_units integer check (number_of_office_units > 0),
  number_of_floors integer,
  vacant_office_floor integer,
  monthly_rent numeric(12,2),
  deposit_amount numeric(12,2),
  deposit_structure text,
  water jsonb not null,
  nearby_places jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_hall_properties (
  property_id uuid primary key references properties(id) on delete cascade,
  hall_name text not null,
  hall_category text,
  road_visibility text not null,
  number_of_halls integer check (number_of_halls > 0),
  hall_capacity integer,
  is_available_for_bookings boolean not null default false,
  booking_price numeric(12,2),
  additional_pricing_arrangements text,
  nearby_places jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  unit_identifier text not null,
  unit_type text,
  monthly_rent numeric(12,2),
  deposit_amount numeric(12,2),
  quantity_available integer default 1,
  status text not null default 'available' check (status in ('available','occupied','unavailable','waiting-for-verification')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(property_id, unit_identifier)
);
create index if not exists idx_units_property_status on units(property_id, status);

create table if not exists verification_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  status text not null check (status in ('pending-verification','verified','waiting-for-verification','verification-failed')),
  queue_priority text default 'normal',
  pre_checks jsonb not null default '[]'::jsonb,
  correction_hints text[] not null default '{}',
  duplicate_candidate_ids uuid[] not null default '{}',
  public_badge_eligible boolean not null default false,
  official_badge_label text,
  automated_retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  failed_at timestamptz
);
create index if not exists idx_verification_property_status on verification_records(property_id, status);

create table if not exists vacancy_confirmations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  unit_id uuid references units(id) on delete cascade,
  unit_identifier text not null,
  status text not null check (status in ('confirmed-vacancy','grace-period','waiting-for-verification','occupied')),
  last_confirmed_at timestamptz not null,
  active_until timestamptz not null,
  grace_until timestamptz not null,
  reminder_due_at timestamptz not null,
  visible_in_customer_search boolean not null default true,
  unlock_available boolean not null default true,
  verified_access_available boolean not null default true,
  viewing_requests_available boolean not null default true,
  intelligence jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vacancy_confirmations_status on vacancy_confirmations(status, active_until, grace_until);

create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  category text not null,
  filters jsonb not null default '{}'::jsonb,
  ai_search_description jsonb not null default '{}'::jsonb,
  private_to_customer boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_saved_searches_customer on saved_searches(customer_id, category);

create table if not exists saved_properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  unit_id uuid references units(id),
  property_summary text,
  current_property_status text,
  cover_photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(customer_id, property_id, unit_id)
);

create table if not exists recently_viewed_properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  unit_id uuid references units(id),
  access_state text not null,
  viewed_at timestamptz not null default now()
);
create index if not exists idx_recently_viewed_customer on recently_viewed_properties(customer_id, viewed_at desc);

create table if not exists unlock_access (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  unit_identifier text not null,
  property_category text not null,
  pricing_category text not null,
  status text not null check (status in ('pending-payment','active','unavailable-after-purchase','expired')),
  amount numeric(12,2) not null,
  currency text not null default 'KES',
  unlocked_at timestamptz,
  expires_at timestamptz,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id, property_id, unit_identifier, payment_reference)
);
create index if not exists idx_unlock_access_customer_status on unlock_access(customer_id, status, expires_at);

create table if not exists verified_access (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete cascade,
  property_category text not null,
  pricing_category text not null,
  search_signature text not null,
  qualifying_targets jsonb not null default '[]'::jsonb,
  status text not null check (status in ('pending-payment','active','expired')),
  amount numeric(12,2) not null,
  currency text not null default 'KES',
  activated_at timestamptz,
  expires_at timestamptz,
  payment_reference text,
  created_at timestamptz not null default now(),
  unique(customer_id, property_category, search_signature, payment_reference)
);
create index if not exists idx_verified_access_customer_status on verified_access(customer_id, status, expires_at);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id),
  purchase_type text not null check (purchase_type in ('unlock-this-listing','verified-access')),
  property_id uuid references properties(id),
  unit_identifier text,
  property_category text,
  amount numeric(12,2) not null,
  currency text not null default 'KES',
  status text not null check (status in ('successful','failed','pending','cancelled','expired','incomplete')),
  transaction_reference text not null unique,
  provider text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_customer_status on payments(customer_id, status, created_at desc);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  customer_id uuid references users(id),
  transaction_reference text not null,
  receipt_url text,
  generated_at timestamptz not null default now(),
  downloadable boolean not null default true
);

create table if not exists viewing_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id),
  property_id uuid not null references properties(id),
  unit_identifier text not null,
  property_category text not null,
  access_source text not null check (access_source in ('unlock-this-listing','verified-access')),
  responsible_contact_role text,
  responsible_contact_id uuid references users(id),
  preferred_date date not null,
  preferred_time time not null,
  optional_message text,
  status text not null check (status in ('pending','accepted','rescheduled','declined','cancelled','completed')),
  customer_completion_response text,
  contact_completion_response text,
  review_preparation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_viewing_customer_status on viewing_requests(customer_id, status, preferred_date);
create index if not exists idx_viewing_contact_status on viewing_requests(responsible_contact_id, status, preferred_date);

create table if not exists viewing_history (
  id uuid primary key default gen_random_uuid(),
  viewing_id uuid not null references viewing_requests(id) on delete cascade,
  actor_id uuid,
  actor_role text,
  action text not null,
  previous_status text,
  next_status text,
  note text,
  proposed_date date,
  proposed_time time,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id),
  property_id uuid not null references properties(id),
  unit_identifier text not null,
  property_category text not null,
  viewing_id uuid references viewing_requests(id),
  verified_interaction boolean not null default true,
  rating integer not null check (rating between 1 and 5),
  category_ratings jsonb not null default '[]'::jsonb,
  written_review text,
  status text not null check (status in ('published','flagged-for-moderation','hidden-after-moderation')),
  moderation_flags jsonb not null default '[]'::jsonb,
  reports jsonb not null default '[]'::jsonb,
  official_response jsonb,
  edit_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id, property_id, unit_identifier)
);
create index if not exists idx_reviews_property_status on reviews(property_id, status);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references users(id) on delete cascade,
  recipient_role text,
  audience text,
  event_type text not null,
  event_key text not null,
  title text not null,
  short_description text not null,
  related jsonb not null default '{}'::jsonb,
  priority text not null default 'normal',
  status text not null default 'unread' check (status in ('unread','read')),
  centre_category text,
  channels text[] not null default '{in-app}',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  deleted_at timestamptz,
  unique(recipient_user_id, event_key)
);
create index if not exists idx_notifications_recipient_status on notifications(recipient_user_id, status, created_at desc);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_group text not null,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references users(id),
  actor_role text,
  property_id uuid references properties(id),
  property_category text,
  location jsonb,
  duration_ms integer,
  value numeric(14,2),
  metadata jsonb not null default '{}'::jsonb,
  privacy jsonb not null default '{}'::jsonb
);
create index if not exists idx_analytics_event_type_time on analytics_events(event_type, occurred_at desc);
create index if not exists idx_analytics_metadata_gin on analytics_events using gin(metadata);

create table if not exists business_opportunities (
  id uuid primary key default gen_random_uuid(),
  location_label text not null,
  property_category text not null,
  property_type text,
  price_range text,
  priority text not null,
  status text not null,
  customer_demand_summary text,
  supply_summary text,
  recommendation text,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  priority text not null,
  status text not null,
  title text not null,
  explanation text not null,
  reason text,
  suggested_action text,
  related jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists founder_business_goals (
  id uuid primary key default gen_random_uuid(),
  goal_name text not null,
  target integer not null check (target > 0),
  current_progress integer not null default 0,
  completion_percentage numeric(5,2) not null default 0,
  remaining_target integer not null,
  status text not null,
  approved_by uuid references users(id),
  approved_at timestamptz,
  source_recommendation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists executive_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  period text,
  report_data jsonb not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  action_type text not null,
  target_type text,
  target_id text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_actor_time on audit_logs(actor_user_id, created_at desc);

create table if not exists security_logs (
  id uuid primary key default gen_random_uuid(),
  severity text not null,
  event_type text not null,
  actor_user_id uuid references users(id),
  ip_address inet,
  user_agent text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_security_logs_type_time on security_logs(event_type, created_at desc);

create table if not exists fraud_cases (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  status text not null,
  accounts_involved uuid[] not null default '{}',
  property_id uuid references properties(id),
  ai_summary text,
  evidence jsonb not null default '[]'::jsonb,
  confidence text,
  severity text,
  recommended_action text,
  founder_decisions jsonb not null default '[]'::jsonb,
  containment_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into roles(id, name) values
  ('customer','Customer'),
  ('property-owner','Property Owner'),
  ('property-manager','Property Manager'),
  ('leasing-agent','Leasing Agent'),
  ('platform-admin','Platform Admin')
on conflict (id) do nothing;

insert into property_categories(id, name) values
  ('houses','Houses'),
  ('shops','Shops'),
  ('offices','Offices'),
  ('event-halls','Event Halls')
on conflict (id) do nothing;

insert into counties(name, code) values
('Baringo','030'),('Bomet','036'),('Bungoma','039'),('Busia','040'),('Elgeyo-Marakwet','028'),('Embu','014'),('Garissa','007'),('Homa Bay','043'),('Isiolo','011'),('Kajiado','034'),('Kakamega','037'),('Kericho','035'),('Kiambu','022'),('Kilifi','003'),('Kirinyaga','020'),('Kisii','045'),('Kisumu','042'),('Kitui','015'),('Kwale','002'),('Laikipia','031'),('Lamu','005'),('Machakos','016'),('Makueni','017'),('Mandera','009'),('Marsabit','010'),('Meru','012'),('Migori','044'),('Mombasa','001'),('Murang’a','021'),('Nairobi','047'),('Nakuru','032'),('Nandi','029'),('Narok','033'),('Nyamira','046'),('Nyandarua','018'),('Nyeri','019'),('Samburu','025'),('Siaya','041'),('Taita-Taveta','006'),('Tana River','004'),('Tharaka-Nithi','013'),('Trans Nzoia','026'),('Turkana','023'),('Uasin Gishu','027'),('Vihiga','038'),('Wajir','008'),('West Pokot','024')
on conflict (name) do nothing;

alter table users enable row level security;
alter table user_profiles enable row level security;
alter table properties enable row level security;
alter table property_media enable row level security;
alter table units enable row level security;
alter table notifications enable row level security;
alter table saved_searches enable row level security;
alter table saved_properties enable row level security;
alter table recently_viewed_properties enable row level security;
alter table unlock_access enable row level security;
alter table verified_access enable row level security;
alter table viewing_requests enable row level security;
alter table reviews enable row level security;

-- Service role policies. Application server uses secure service role/database credentials.
do $$
declare t text;
begin
  foreach t in array array['users','user_profiles','properties','property_media','units','notifications','saved_searches','saved_properties','recently_viewed_properties','unlock_access','verified_access','viewing_requests','reviews'] loop
    execute format('drop policy if exists service_role_all on %I', t);
    execute format('create policy service_role_all on %I for all using (auth.role() = ''service_role'') with check (auth.role() = ''service_role'')', t);
  end loop;
end $$;
