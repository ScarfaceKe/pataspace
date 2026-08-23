import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const url = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('Set SUPABASE_DATABASE_URL or DATABASE_URL before running migrations.');
  process.exit(1);
}
const rejectUnauthorized = process.env.SUPABASE_DB_SSL_REJECT_UNAUTHORIZED !== 'false';
const pool = new pg.Pool({ connectionString: url, ssl: process.env.SUPABASE_DB_SSL === 'false' ? undefined : { rejectUnauthorized } });
try {
  await pool.query('create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())');
  const files = readdirSync('supabase/migrations').filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    const applied = await pool.query('select 1 from schema_migrations where version = $1', [file]);
    if (applied.rowCount) {
      console.log(`Skipping ${file}`);
      continue;
    }
    console.log(`Applying ${file}`);
    await pool.query('begin');
    try {
      await pool.query(readFileSync(join('supabase/migrations', file), 'utf8'));
      await pool.query('insert into schema_migrations(version) values($1)', [file]);
      await pool.query('commit');
    } catch (error) {
      await pool.query('rollback');
      throw error;
    }
  }
  console.log('Migrations applied successfully.');
} finally {
  await pool.end();
}
