import type { FounderAuditTrailEntry } from '@/domain/founder-admin';
import { readStore, writeStore } from '@/server/database/json-store';

export interface FounderAdminStoreData { auditTrail: FounderAuditTrailEntry[] }

const EMPTY_STORE: FounderAdminStoreData = { auditTrail: [] };
const STORE_KEY = 'founder_admin';

export async function readFounderAdminStore(): Promise<FounderAdminStoreData> {
  return readStore<FounderAdminStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeFounderAdminStore(data: FounderAdminStoreData): Promise<void> {
  await writeStore<FounderAdminStoreData>(STORE_KEY, data);
}
