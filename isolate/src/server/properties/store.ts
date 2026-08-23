import type { RegisteredPropertyFoundation } from '@/domain/property-registration';
import { readStore, writeStore } from '@/server/database/json-store';

export interface PropertyStoreData {
  properties: RegisteredPropertyFoundation[];
}

const EMPTY_STORE: PropertyStoreData = { properties: [] };
const STORE_KEY = 'properties';

export async function readPropertyStore(): Promise<PropertyStoreData> {
  return readStore<PropertyStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writePropertyStore(data: PropertyStoreData): Promise<void> {
  await writeStore<PropertyStoreData>(STORE_KEY, data);
}
