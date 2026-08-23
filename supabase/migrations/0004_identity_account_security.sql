-- Phase 2 identity/account-security completion hardening.
-- Expands account-type support without removing legacy Phase 2 ids already deployed.

alter table account_types drop constraint if exists account_types_id_check;
alter table account_types add constraint account_types_id_check check (
  id in (
    'customer-tenant',
    'property-owner',
    'property-manager',
    'leasing-agent',
    'administrator',
    'founder',
    'tenant',
    'property-owner-landlord',
    'property-agent',
    'admin',
    'super-admin'
  )
);

insert into account_types(id, name) values
  ('customer-tenant','Customer (Tenant)'),
  ('property-owner','Property Owner'),
  ('property-manager','Property Manager'),
  ('leasing-agent','Leasing Agent'),
  ('administrator','Administrator'),
  ('founder','Founder')
on conflict (id) do update set name = excluded.name;

create table if not exists email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create unique index if not exists idx_email_verifications_token_hash_unique on email_verifications(token_hash);
create index if not exists idx_email_verifications_user_active on email_verifications(user_id, expires_at, used_at);
create index if not exists idx_sessions_token_active on sessions(token_hash, expires_at, revoked_at);

alter table email_verifications enable row level security;
drop policy if exists service_role_all on email_verifications;
create policy service_role_all on email_verifications for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
