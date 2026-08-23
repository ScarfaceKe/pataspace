import { randomUUID } from 'node:crypto';
import { buildSmartSearchRecoveryPrompt, type ActivePropertyAccessSummary, type RecentlyViewedPropertyRecord, type ViewingFeedbackAnswer, type ViewingFeedbackRecord } from '@/domain/customer-experience';
import { expireElapsedUnlockAccessRecords } from '@/server/unlock/service';
import { expireElapsedVerifiedAccessRecords } from '@/server/verified-access/service';
import { trackAnalyticsEvent } from '@/server/analytics/service';
import { readCustomerExperienceStore, writeCustomerExperienceStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

export async function addRecentlyViewed(input: Omit<RecentlyViewedPropertyRecord, 'id' | 'viewedAt' | 'customerAccessControlApplied'>): Promise<RecentlyViewedPropertyRecord> {
  const store = await readCustomerExperienceStore();
  const record: RecentlyViewedPropertyRecord = { ...input, id: randomUUID(), viewedAt: nowIso(), customerAccessControlApplied: true };
  store.recentlyViewed.push(record);
  await writeCustomerExperienceStore(store);
  await trackAnalyticsEvent({ eventType: 'property-search', actorUserId: input.customerId, actorRole: 'customer', propertyId: input.propertyId, propertyCategory: input.propertyCategory, metadata: { recentlyViewed: true, accessState: input.accessState } });
  return record;
}

export async function listRecentlyViewed(customerId: string): Promise<RecentlyViewedPropertyRecord[]> {
  return (await readCustomerExperienceStore()).recentlyViewed.filter((item) => item.customerId === customerId).sort((a,b)=>b.viewedAt.localeCompare(a.viewedAt));
}

export async function recordViewingFeedback(input: { customerId: string; viewingId: string; answer: ViewingFeedbackAnswer }): Promise<ViewingFeedbackRecord> {
  const store = await readCustomerExperienceStore();
  const record: ViewingFeedbackRecord = { id: randomUUID(), customerId: input.customerId, viewingId: input.viewingId, answer: input.answer, improvesMatchQuality: true, improvesPropertyQuality: true, improvesAiRecommendations: true, improvesPlatformAnalytics: true, createdAt: nowIso() };
  store.viewingFeedback.push(record);
  await writeCustomerExperienceStore(store);
  await trackAnalyticsEvent({ eventType: 'viewing-completed', actorUserId: input.customerId, actorRole: 'customer', metadata: { viewingFeedback: input.answer } });
  return record;
}

export async function getActivePropertyAccess(customerId: string): Promise<ActivePropertyAccessSummary> {
  const [unlocks, verifiedAccess] = await Promise.all([expireElapsedUnlockAccessRecords(), expireElapsedVerifiedAccessRecords()]);
  return { unlocks: unlocks.filter((item) => item.customerId === customerId), verifiedAccess: verifiedAccess.filter((item) => item.customerId === customerId), remainingTimeUpdatesAutomatically: true };
}

export async function getSmartSearchRecovery(customerId: string) { return buildSmartSearchRecoveryPrompt(customerId); }
