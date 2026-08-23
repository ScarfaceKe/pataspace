import type { AnalyticsEvent } from '@/domain/analytics';
import { readStore, writeStore } from '@/server/database/json-store';

export interface AnalyticsStoreData { events: AnalyticsEvent[] }

const EMPTY_STORE: AnalyticsStoreData = { events: [] };
const STORE_KEY = 'analytics';

export async function readAnalyticsStore(): Promise<AnalyticsStoreData> {
  return readStore<AnalyticsStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeAnalyticsStore(data: AnalyticsStoreData): Promise<void> {
  await writeStore<AnalyticsStoreData>(STORE_KEY, data);
}
