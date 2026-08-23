-- Production WhatsApp Business API notification infrastructure.
-- Adds user WhatsApp metadata, notification preferences, delivery logs, webhook logs, and retry queue.

alter table user_profiles add column if not exists whatsapp_phone_number text;
alter table user_profiles add column if not exists whatsapp_same_as_primary boolean not null default true;
alter table user_profiles add column if not exists in_app_notifications_enabled boolean not null default true;
alter table user_profiles add column if not exists whatsapp_notifications_enabled boolean not null default true;

create table if not exists whatsapp_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid,
  recipient_user_id uuid not null references users(id) on delete cascade,
  recipient_role text not null,
  event_type text not null,
  destination_phone_number text not null,
  template_name text,
  message_body text not null,
  provider_message_id text,
  status text not null check (status in ('queued','configuration-pending','sent','delivered','read','failed','retry-scheduled','duplicate','cancelled')),
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  next_retry_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  idempotency_key text not null unique,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_whatsapp_deliveries_user_status on whatsapp_notification_deliveries(recipient_user_id, status, created_at desc);
create index if not exists idx_whatsapp_deliveries_retry on whatsapp_notification_deliveries(status, next_retry_at) where status = 'retry-scheduled';
create index if not exists idx_whatsapp_deliveries_provider_message on whatsapp_notification_deliveries(provider_message_id) where provider_message_id is not null;

create table if not exists whatsapp_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text,
  provider_message_id text,
  event_type text,
  payload_hash text not null unique,
  signature_valid boolean,
  raw_payload jsonb not null default '{}'::jsonb,
  processing_status text not null check (processing_status in ('received','processed','duplicate','failed','ignored')),
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists idx_whatsapp_webhooks_provider_message on whatsapp_webhook_events(provider_message_id, received_at desc);
create index if not exists idx_whatsapp_webhooks_status on whatsapp_webhook_events(processing_status, received_at desc);

alter table whatsapp_notification_deliveries enable row level security;
alter table whatsapp_webhook_events enable row level security;

do $$
declare t text;
begin
  foreach t in array array['whatsapp_notification_deliveries','whatsapp_webhook_events'] loop
    execute format('drop policy if exists service_role_all on %I', t);
    execute format('create policy service_role_all on %I for all using (auth.role() = ''service_role'') with check (auth.role() = ''service_role'')', t);
  end loop;
end $$;
