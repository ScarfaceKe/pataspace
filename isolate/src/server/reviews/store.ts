import type { PropertyReview } from '@/domain/reviews';
import { readStore, writeStore } from '@/server/database/json-store';

export interface ReviewStoreData { reviews: PropertyReview[] }

const EMPTY_STORE: ReviewStoreData = { reviews: [] };
const STORE_KEY = 'reviews';

export async function readReviewStore(): Promise<ReviewStoreData> {
  return readStore<ReviewStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeReviewStore(data: ReviewStoreData): Promise<void> {
  await writeStore<ReviewStoreData>(STORE_KEY, data);
}
