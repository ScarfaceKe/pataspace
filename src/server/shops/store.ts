import type { RegisteredShopFoundation } from '@/domain/shop-registration';
import { readStore, writeStore } from '@/server/database/json-store';

export interface ShopStoreData {
  shops: RegisteredShopFoundation[];
}

const EMPTY_STORE: ShopStoreData = { shops: [] };
const STORE_KEY = 'shops';

export async function readShopStore(): Promise<ShopStoreData> {
  return readStore<ShopStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeShopStore(data: ShopStoreData): Promise<void> {
  await writeStore<ShopStoreData>(STORE_KEY, data);
}
