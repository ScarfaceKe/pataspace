-- Additional auth indexes and uniqueness for production auth hardening
create unique index if not exists idx_password_resets_token_hash_unique on password_resets(token_hash);
create index if not exists idx_password_resets_user_active on password_resets(user_id, expires_at, used_at);
create index if not exists idx_login_history_success_time on login_history(success, login_at desc);
