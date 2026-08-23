-- Production authentication/profile hardening for PataSpace

create table if not exists account_types (
  id text primary key check (id in ('tenant','property-owner-landlord','property-agent','admin','super-admin')),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into account_types(id, name) values
  ('tenant','Tenant'),
  ('property-owner-landlord','Property Owner / Landlord'),
  ('property-agent','Property Agent'),
  ('admin','Admin'),
  ('super-admin','Super Admin')
on conflict (id) do nothing;

alter table users add column if not exists last_login_at timestamptz;
alter table users add column if not exists email_verified_at timestamptz;
alter table users add column if not exists last_login_ip inet;
alter table users add column if not exists last_user_agent text;

alter table user_profiles add column if not exists county_id uuid references counties(id);
alter table user_profiles add column if not exists county_name text;
alter table user_profiles add column if not exists account_type_id text references account_types(id);
alter table user_profiles add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

create index if not exists idx_user_profiles_county on user_profiles(county_id);
create index if not exists idx_user_profiles_account_type on user_profiles(account_type_id);
create index if not exists idx_users_last_login on users(last_login_at desc);

create table if not exists login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  login_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  success boolean not null,
  reason text
);
create index if not exists idx_login_history_user_time on login_history(user_id, login_at desc);

alter table login_history enable row level security;
drop policy if exists service_role_all on login_history;
create policy service_role_all on login_history for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
