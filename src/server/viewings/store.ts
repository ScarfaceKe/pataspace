import type { ViewingRequestRecord } from '@/domain/viewing';
import { readStore, writeStore } from '@/server/database/json-store';

export interface ViewingStoreData { viewings: ViewingRequestRecord[] }

const EMPTY_STORE: ViewingStoreData = { viewings: [] };
const STORE_KEY = 'viewings';

export async function readViewingStore(): Promise<ViewingStoreData> {
  return readStore<ViewingStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeViewingStore(data: ViewingStoreData): Promise<void> {
  await writeStore<ViewingStoreData>(STORE_KEY, data);
}
