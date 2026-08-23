import { randomUUID } from 'node:crypto';
import type { AnalyticsEvent, AnalyticsEventGroup, AnalyticsEventType, AnalyticsSummary } from '@/domain/analytics';
import { readAnalyticsStore, writeAnalyticsStore } from './store';

export function getAnalyticsGroup(eventType: AnalyticsEventType): AnalyticsEventGroup {
  if (['account-registration','login','property-search','saved-property','unlock-purchase','verified-access-purchase'].includes(eventType)) return 'customer';
  if (eventType.startsWith('property') || eventType.startsWith('vacancy')) return 'property';
  if (eventType.startsWith('payment') || eventType === 'receipt-generation') return 'payment';
  if (eventType.startsWith('viewing')) return 'viewing';
  if (eventType.startsWith('review')) return 'review';
  if (eventType.includes('performance') || eventType.includes('delivery') || eventType.includes('response-time')) return 'performance';
  if (eventType.startsWith('ai')) return 'ai';
  if (eventType.startsWith('founder')) return 'founder';
  return 'operational';
}

export async function trackAnalyticsEvent(input: Omit<AnalyticsEvent, 'id' | 'group' | 'occurredAt' | 'privacy'> & { occurredAt?: string }): Promise<AnalyticsEvent> {
  const data = await readAnalyticsStore();
  const eventKey = JSON.stringify({ eventType: input.eventType, actorUserId: input.actorUserId, propertyId: input.propertyId, metadata: input.metadata, occurredAt: input.occurredAt?.slice(0, 16) });
  const duplicate = data.events.find((event) => JSON.stringify({ eventType: event.eventType, actorUserId: event.actorUserId, propertyId: event.propertyId, metadata: event.metadata, occurredAt: event.occurredAt.slice(0, 16) }) === eventKey);
  if (duplicate) return duplicate;
  const event: AnalyticsEvent = { ...input, id: randomUUID(), group: getAnalyticsGroup(input.eventType), occurredAt: input.occurredAt ?? new Date().toISOString(), privacy: { personalInformationRedactedByDefault: true, authorisedAdminUseOnly: Boolean(input.actorUserId) } };
  data.events.push(event);
  await writeAnalyticsStore(data);
  return event;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = (await readAnalyticsStore()).events;
  const perf = events.filter((event) => typeof event.durationMs === 'number');
  return {
    totalEvents: events.length,
    propertyRegistrations: events.filter((e) => e.eventType === 'property-registration').length,
    searches: events.filter((e) => e.eventType === 'property-search').length,
    unlockPurchases: events.filter((e) => e.eventType === 'unlock-purchase').length,
    verifiedAccessPurchases: events.filter((e) => e.eventType === 'verified-access-purchase').length,
    viewingRequests: events.filter((e) => e.eventType === 'viewing-requested' || e.eventType === 'viewing-request').length,
    reviewsSubmitted: events.filter((e) => e.eventType === 'review-submitted').length,
    paymentsCompleted: events.filter((e) => e.eventType === 'payment-completed').length,
    paymentsFailed: events.filter((e) => e.eventType === 'payment-failed').length,
    averagePerformanceMs: perf.length ? Math.round(perf.reduce((sum, e) => sum + (e.durationMs ?? 0), 0) / perf.length) : 0
  };
}

export async function listAnalyticsEvents(): Promise<AnalyticsEvent[]> { return (await readAnalyticsStore()).events.sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)); }
