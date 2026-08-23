import type { RecentlyViewedPropertyRecord, ViewingFeedbackRecord } from '@/domain/customer-experience';
import { readStore, writeStore } from '@/server/database/json-store';

export interface CustomerExperienceStore { recentlyViewed: RecentlyViewedPropertyRecord[]; viewingFeedback: ViewingFeedbackRecord[] }

const EMPTY_STORE: CustomerExperienceStore = { recentlyViewed: [], viewingFeedback: [] };
const STORE_KEY = 'customer_experience';

export async function readCustomerExperienceStore(): Promise<CustomerExperienceStore> {
  return readStore<CustomerExperienceStore>(STORE_KEY, EMPTY_STORE);
}

export async function writeCustomerExperienceStore(data: CustomerExperienceStore): Promise<void> {
  await writeStore<CustomerExperienceStore>(STORE_KEY, data);
}
