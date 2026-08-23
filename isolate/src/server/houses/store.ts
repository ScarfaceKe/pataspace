import type { RegisteredHouseFoundation } from '@/domain/house-registration';
import { readStore, writeStore } from '@/server/database/json-store';

export interface HouseStoreData {
  houses: RegisteredHouseFoundation[];
}

const EMPTY_STORE: HouseStoreData = { houses: [] };
const STORE_KEY = 'houses';

export async function readHouseStore(): Promise<HouseStoreData> {
  return readStore<HouseStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeHouseStore(data: HouseStoreData): Promise<void> {
  await writeStore<HouseStoreData>(STORE_KEY, data);
}
