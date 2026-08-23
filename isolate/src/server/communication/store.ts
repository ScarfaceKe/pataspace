import type { CustomerNotificationPreferences } from '@/domain/communication';
import { readStore, writeStore } from '@/server/database/json-store';

export interface CommunicationStoreData { customerPreferences: CustomerNotificationPreferences[] }

const EMPTY_STORE: CommunicationStoreData = { customerPreferences: [] };
const STORE_KEY = 'communication';

export async function readCommunicationStore(): Promise<CommunicationStoreData> {
  return readStore<CommunicationStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeCommunicationStore(data: CommunicationStoreData): Promise<void> {
  await writeStore<CommunicationStoreData>(STORE_KEY, data);
}
