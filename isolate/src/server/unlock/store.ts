import type { UnlockAccessRecord } from '@/domain/unlock';
import { readStore, writeStore } from '@/server/database/json-store';

export interface UnlockStoreData {
  unlocks: UnlockAccessRecord[];
}

const EMPTY_STORE: UnlockStoreData = { unlocks: [] };
const STORE_KEY = 'unlock';

export async function readUnlockStore(): Promise<UnlockStoreData> {
  return readStore<UnlockStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeUnlockStore(data: UnlockStoreData): Promise<void> {
  await writeStore<UnlockStoreData>(STORE_KEY, data);
}
