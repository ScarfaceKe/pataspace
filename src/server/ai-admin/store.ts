import type { AiAdminRecommendation } from '@/domain/ai-admin-assistant';
import { readStore, writeStore } from '@/server/database/json-store';

export interface AiAdminStoreData { recommendations: AiAdminRecommendation[] }

const EMPTY_STORE: AiAdminStoreData = { recommendations: [] };
const STORE_KEY = 'ai_admin';

export async function readAiAdminStore(): Promise<AiAdminStoreData> {
  return readStore<AiAdminStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeAiAdminStore(data: AiAdminStoreData): Promise<void> {
  await writeStore<AiAdminStoreData>(STORE_KEY, data);
}
