import { query } from './client';

export async function readStore<T>(storeKey: string, emptyValue: T): Promise<T> {
  await ensureStoreTable();
  const result = await query<{ data: T }>('select data from app_store_documents where store_key = $1 and deleted_at is null', [storeKey]);
  return result.rows[0]?.data ?? structuredClone(emptyValue);
}

export async function writeStore<T>(storeKey: string, data: T): Promise<void> {
  await ensureStoreTable();
  await query(
    `insert into app_store_documents (store_key, data, created_at, updated_at)
     values ($1, $2::jsonb, now(), now())
     on conflict (store_key) do update set data = excluded.data, updated_at = now(), deleted_at = null`,
    [storeKey, JSON.stringify(data)]
  );
}

let ensured = false;
async function ensureStoreTable(): Promise<void> {
  if (ensured) return;
  await query(`
    create table if not exists app_store_documents (
      store_key text primary key,
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      deleted_at timestamptz
    );
    create index if not exists idx_app_store_documents_data_gin on app_store_documents using gin (data);
  `);
  ensured = true;
}
