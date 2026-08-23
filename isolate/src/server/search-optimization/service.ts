import { randomUUID } from 'node:crypto';
import { extractSearchPreferences, getFiltersForCategory, type MatchSearchCategory, type SavedSearchRecord } from '@/domain/search-optimization';
import { createNotification } from '@/server/notifications/service';
import { trackAnalyticsEvent } from '@/server/analytics/service';
import { readSearchOptimisationStore, writeSearchOptimisationStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

export async function saveCustomerSearch(input: { customerId: string; category: MatchSearchCategory; selectedFilters: Record<string, unknown>; aiSearchDescriptionText: string }): Promise<SavedSearchRecord> {
  const data = await readSearchOptimisationStore();
  const record: SavedSearchRecord = {
    id: randomUUID(),
    customerId: input.customerId,
    category: input.category,
    selectedFilters: input.selectedFilters,
    aiSearchDescription: extractSearchPreferences(input.aiSearchDescriptionText),
    privateToCustomer: true,
    customerAccessControlEnforced: true,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  data.savedSearches.push(record);
  await writeSearchOptimisationStore(data);
  await trackAnalyticsEvent({ eventType: 'saved-property', actorUserId: input.customerId, actorRole: 'customer', metadata: { savedSearch: true, category: input.category } });
  return record;
}

export async function listSavedSearches(customerId: string): Promise<SavedSearchRecord[]> {
  return (await readSearchOptimisationStore()).savedSearches.filter((search) => search.customerId === customerId);
}

export async function getSearchFilters(category: MatchSearchCategory) {
  return getFiltersForCategory(category);
}

export async function notifyMeaningfulSavedSearchMatch(input: { customerId: string; savedSearchId: string; groupedMessage?: boolean; locationLabel: string }): Promise<void> {
  await createNotification({
    recipientUserId: input.customerId,
    recipientRole: 'customer',
    audience: 'customer',
    eventType: 'property-availability-change',
    eventKey: `saved-search-match:${input.savedSearchId}:${input.locationLabel}:${new Date().toISOString().slice(0, 10)}`,
    title: input.groupedMessage ? 'Several new properties match your saved search.' : 'A new property matches your saved search.',
    shortDescription: input.groupedMessage ? `Several newly verified properties now match your saved search in ${input.locationLabel}.` : `A strong new match is available in ${input.locationLabel}.`
  });
}
