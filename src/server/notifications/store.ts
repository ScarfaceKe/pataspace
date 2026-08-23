import type { PataSpaceNotification } from '@/domain/notifications';
import { readStore, writeStore } from '@/server/database/json-store';

export interface NotificationStoreData { notifications: PataSpaceNotification[] }

const EMPTY_STORE: NotificationStoreData = { notifications: [] };
const STORE_KEY = 'notifications';

export async function readNotificationStore(): Promise<NotificationStoreData> {
  return readStore<NotificationStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeNotificationStore(data: NotificationStoreData): Promise<void> {
  await writeStore<NotificationStoreData>(STORE_KEY, data);
}
