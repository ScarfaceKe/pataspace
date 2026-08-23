import type { RegisteredMixedUseBuilding } from '@/domain/mixed-use-building-registration';
import { readStore, writeStore } from '@/server/database/json-store';

export interface MixedUseBuildingStoreData {
  buildings: RegisteredMixedUseBuilding[];
}

const EMPTY_STORE: MixedUseBuildingStoreData = { buildings: [] };
const STORE_KEY = 'mixed-use-buildings';

export async function readMixedUseBuildingStore(): Promise<MixedUseBuildingStoreData> {
  return readStore<MixedUseBuildingStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeMixedUseBuildingStore(data: MixedUseBuildingStoreData): Promise<void> {
  await writeStore<MixedUseBuildingStoreData>(STORE_KEY, data);
}
