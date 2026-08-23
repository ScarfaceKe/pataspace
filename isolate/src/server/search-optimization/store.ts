import type { SavedSearchRecord } from '@/domain/search-optimization';
import { readStore, writeStore } from '@/server/database/json-store';

export interface SearchOptimisationStore { savedSearches: SavedSearchRecord[] }

const EMPTY_STORE: SearchOptimisationStore = { savedSearches: [] };
const STORE_KEY = 'search_optimization';

export async function readSearchOptimisationStore(): Promise<SearchOptimisationStore> {
  return readStore<SearchOptimisationStore>(STORE_KEY, EMPTY_STORE);
}

export async function writeSearchOptimisationStore(data: SearchOptimisationStore): Promise<void> {
  await writeStore<SearchOptimisationStore>(STORE_KEY, data);
}
