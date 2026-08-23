-- Phase 3 production MegaPay / M-Pesa payment infrastructure.
-- Extends existing payment foundation without changing Founder-approved pricing/workflows.

alter table payments add column if not exists idempotency_key text;
alter table payments add column if not exists phone_number text;
alter table payments add column if not exists checkout_request_id text;
alter table payments add column if not exists merchant_request_id text;
alter table payments add column if not exists provider_payment_id text;
alter table payments add column if not exists provider_status text;
alter table payments add column if not exists receipt_number text;
alter table payments add column if not exists failure_reason text;
alter table payments add column if not exists purchase_payload jsonb not null default '{}'::jsonb;
alter table payments add column if not exists initiated_at timestamptz not null default now();
alter table payments add column if not exists confirmed_at timestamptz;
alter table payments add column if not exists expires_at timestamptz;
alter table payments add column if not exists callback_attempts integer not null default 0;
alter table payments add column if not exists callback_last_received_at timestamptz;

create unique index if not exists idx_payments_idempotency_key_unique on payments(idempotency_key) where idempotency_key is not null;
create unique index if not exists idx_payments_checkout_request_unique on payments(checkout_request_id) where checkout_request_id is not null;
create unique index if not exists idx_payments_provider_payment_unique on payments(provider_payment_id) where provider_payment_id is not null;
create index if not exists idx_payments_status_expires on payments(status, expires_at);
create index if not exists idx_payments_reference_status on payments(transaction_reference, status);

create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  transaction_reference text not null,
  provider text not null default 'megapay-mpesa',
  provider_transaction_id text,
  checkout_request_id text,
  merchant_request_id text,
  amount numeric(12,2) not null,
  currency text not null default 'KES',
  phone_number text,
  status text not null check (status in ('initiated','pending','successful','failed','cancelled','expired','reversed','duplicate')),
  provider_status text,
  provider_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(provider, provider_transaction_id),
  unique(provider, checkout_request_id, status)
);
create index if not exists idx_payment_transactions_payment_time on payment_transactions(payment_id, created_at desc);
create index if not exists idx_payment_transactions_reference on payment_transactions(transaction_reference);
create index if not exists idx_payment_transactions_status_time on payment_transactions(status, occurred_at desc);

create table if not exists payment_callbacks (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'megapay-mpesa',
  payment_id uuid references payments(id) on delete set null,
  callback_reference text,
  checkout_request_id text,
  merchant_request_id text,
  signature_header text,
  signature_valid boolean,
  payload_hash text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  processing_status text not null check (processing_status in ('received','processed','duplicate','failed','ignored')),
  processing_error text,
  retry_count integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, payload_hash)
);
create index if not exists idx_payment_callbacks_payment_time on payment_callbacks(payment_id, received_at desc);
create index if not exists idx_payment_callbacks_checkout on payment_callbacks(provider, checkout_request_id);
create index if not exists idx_payment_callbacks_status_time on payment_callbacks(processing_status, received_at desc);

alter table receipts add column if not exists receipt_number text;
alter table receipts add column if not exists amount numeric(12,2);
alter table receipts add column if not exists currency text not null default 'KES';
alter table receipts add column if not exists receipt_data jsonb not null default '{}'::jsonb;
alter table receipts add column if not exists storage_key text;
create unique index if not exists idx_receipts_receipt_number_unique on receipts(receipt_number) where receipt_number is not null;
create index if not exists idx_receipts_payment_customer on receipts(payment_id, customer_id);

create table if not exists refund_requests (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  customer_id uuid references users(id),
  amount numeric(12,2) not null,
  currency text not null default 'KES',
  reason text not null,
  status text not null check (status in ('draft','pending-founder-review','approved','rejected','queued','processed','failed','cancelled')),
  provider_refund_id text,
  requested_by uuid references users(id),
  reviewed_by uuid references users(id),
  review_note text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_refund_requests_payment_status on refund_requests(payment_id, status, created_at desc);
create index if not exists idx_refund_requests_customer_status on refund_requests(customer_id, status, created_at desc);

create table if not exists payment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete set null,
  actor_user_id uuid references users(id),
  event_type text not null,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payment_audit_payment_time on payment_audit_logs(payment_id, created_at desc);
create index if not exists idx_payment_audit_event_time on payment_audit_logs(event_type, created_at desc);

alter table payments enable row level security;
alter table receipts enable row level security;
alter table payment_transactions enable row level security;
alter table payment_callbacks enable row level security;
alter table refund_requests enable row level security;
alter table payment_audit_logs enable row level security;

do $$
declare t text;
begin
  foreach t in array array['payments','receipts','payment_transactions','payment_callbacks','refund_requests','payment_audit_logs'] loop
    execute format('drop policy if exists service_role_all on %I', t);
    execute format('create policy service_role_all on %I for all using (auth.role() = ''service_role'') with check (auth.role() = ''service_role'')', t);
  end loop;
end $$;
