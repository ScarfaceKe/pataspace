import type { RegisteredEventHallFoundation } from '@/domain/event-hall-registration';
import { readStore, writeStore } from '@/server/database/json-store';

export interface EventHallStoreData { eventHalls: RegisteredEventHallFoundation[] }

const EMPTY_STORE: EventHallStoreData = { eventHalls: [] };
const STORE_KEY = 'event_halls';

export async function readEventHallStore(): Promise<EventHallStoreData> {
  return readStore<EventHallStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeEventHallStore(data: EventHallStoreData): Promise<void> {
  await writeStore<EventHallStoreData>(STORE_KEY, data);
}
