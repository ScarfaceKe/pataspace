import type { PropertyVerificationRecord } from '@/domain/verification';
import { readStore, writeStore } from '@/server/database/json-store';

export interface VerificationStoreData {
  records: PropertyVerificationRecord[];
}

const EMPTY_STORE: VerificationStoreData = { records: [] };
const STORE_KEY = 'verification';

export async function readVerificationStore(): Promise<VerificationStoreData> {
  return readStore<VerificationStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeVerificationStore(data: VerificationStoreData): Promise<void> {
  await writeStore<VerificationStoreData>(STORE_KEY, data);
}
