import type { VerifiedAccessRecord } from '@/domain/verified-access';
import { readStore, writeStore } from '@/server/database/json-store';

export interface VerifiedAccessStoreData {
  records: VerifiedAccessRecord[];
}

const EMPTY_STORE: VerifiedAccessStoreData = { records: [] };
const STORE_KEY = 'verified_access';

export async function readVerifiedAccessStore(): Promise<VerifiedAccessStoreData> {
  return readStore<VerifiedAccessStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeVerifiedAccessStore(data: VerifiedAccessStoreData): Promise<void> {
  await writeStore<VerifiedAccessStoreData>(STORE_KEY, data);
}
