-- Production support ticket foundation.
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references users(id) on delete set null,
  subject text not null,
  short_summary text not null,
  detailed_description text not null,
  ai_acknowledgement text not null,
  status text not null default 'open' check (status in ('open','in-review','awaiting-user','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  founder_reply text,
  assigned_to uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists idx_support_tickets_status_time on support_tickets(status, created_at desc);
create index if not exists idx_support_tickets_submitter_time on support_tickets(submitted_by, created_at desc);
alter table support_tickets enable row level security;
drop policy if exists service_role_all on support_tickets;
create policy service_role_all on support_tickets for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
