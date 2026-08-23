import type { BusinessOpportunity, FounderHealthAlert } from '@/domain/platform-health';
import { readStore, writeStore } from '@/server/database/json-store';

export interface PlatformHealthStore { opportunities: BusinessOpportunity[]; alerts: FounderHealthAlert[] }

const EMPTY_STORE: PlatformHealthStore = { opportunities: [], alerts: [] };
const STORE_KEY = 'platform_health';

export async function readPlatformHealthStore(): Promise<PlatformHealthStore> {
  return readStore<PlatformHealthStore>(STORE_KEY, EMPTY_STORE);
}

export async function writePlatformHealthStore(data: PlatformHealthStore): Promise<void> {
  await writeStore<PlatformHealthStore>(STORE_KEY, data);
}
