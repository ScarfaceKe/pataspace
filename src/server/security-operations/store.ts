import type { SecurityCase, SecurityTimelineEvent } from '@/domain/security-operations';
import { readStore, writeStore } from '@/server/database/json-store';

export interface SecurityOperationsStore { cases: SecurityCase[]; timeline: SecurityTimelineEvent[] }

const EMPTY_STORE: SecurityOperationsStore = { cases: [], timeline: [] };
const STORE_KEY = 'security_operations';

export async function readSecurityOperationsStore(): Promise<SecurityOperationsStore> {
  return readStore<SecurityOperationsStore>(STORE_KEY, EMPTY_STORE);
}

export async function writeSecurityOperationsStore(data: SecurityOperationsStore): Promise<void> {
  await writeStore<SecurityOperationsStore>(STORE_KEY, data);
}
