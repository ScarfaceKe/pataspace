import type { RegisteredOfficeFoundation } from '@/domain/office-registration';
import { readStore, writeStore } from '@/server/database/json-store';

export interface OfficeStoreData { offices: RegisteredOfficeFoundation[] }

const EMPTY_STORE: OfficeStoreData = { offices: [] };
const STORE_KEY = 'offices';

export async function readOfficeStore(): Promise<OfficeStoreData> {
  return readStore<OfficeStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeOfficeStore(data: OfficeStoreData): Promise<void> {
  await writeStore<OfficeStoreData>(STORE_KEY, data);
}
