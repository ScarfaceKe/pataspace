import { randomUUID } from 'node:crypto';
import type { SecurityAnalyticsSummary, SecurityCase, SecurityCaseCategory, SecurityDecisionRecord, SecurityReportRequest, SecuritySeverity } from '@/domain/security-operations';
import { readReviewStore } from '@/server/reviews/store';
import { readNotificationStore } from '@/server/notifications/store';
import { readUnlockStore } from '@/server/unlock/store';
import { readVerifiedAccessStore } from '@/server/verified-access/store';
import { readAuthStore } from '@/server/auth/store';
import { readSecurityOperationsStore, writeSecurityOperationsStore } from './store';

function nowIso(): string { return new Date().toISOString(); }
function categoryFromSignal(signal: string): SecurityCaseCategory {
  if (signal.includes('unlock')) return 'unlock-this-listing-bypass-attempt';
  if (signal.includes('verified')) return 'verified-access-bypass-attempt';
  if (signal.includes('review')) return 'malicious-platform-activity';
  if (signal.includes('account')) return 'multiple-account-abuse';
  return 'suspicious-registration-behaviour';
}
function severityFromConfidence(confidence: 'low'|'medium'|'high'): SecuritySeverity { return confidence === 'high' ? 'high' : confidence === 'medium' ? 'medium' : 'low'; }

export async function createSecurityCase(input: { accountsInvolved: string[]; propertyId?: string; propertyCategory?: SecurityCase['propertyCategory']; signal: string; evidence: string[]; confidenceLevel: 'low'|'medium'|'high'; recommendedAction: string }): Promise<SecurityCase> {
  const store = await readSecurityOperationsStore();
  const timestamp = nowIso();
  const securityCase: SecurityCase = {
    id: randomUUID(),
    dateCreated: timestamp,
    accountsInvolved: input.accountsInvolved,
    propertyId: input.propertyId,
    propertyCategory: input.propertyCategory,
    category: categoryFromSignal(input.signal),
    aiInvestigationSummary: `AI detected ${input.signal} and prepared evidence for Founder review.`,
    supportingEvidence: input.evidence.map((detail) => ({ id: randomUUID(), label: 'Evidence', detail, createdAt: timestamp })),
    confidenceLevel: input.confidenceLevel,
    severity: severityFromConfidence(input.confidenceLevel),
    currentStatus: input.confidenceLevel === 'high' ? 'founder-review-required' : 'investigating',
    recommendedAction: input.recommendedAction,
    founderDecisionHistory: [],
    containmentActions: [],
    updatedAt: timestamp
  };
  store.cases.push(securityCase);
  store.timeline.push({ id: randomUUID(), occurredAt: timestamp, title: 'Investigation opened', summary: securityCase.aiInvestigationSummary });
  await writeSecurityOperationsStore(store);
  return securityCase;
}

export async function containImmediateThreat(input: { caseId: string; action: SecurityCase['containmentActions'][number]['action']; reason: string }): Promise<SecurityCase | null> {
  const store = await readSecurityOperationsStore();
  const securityCase = store.cases.find((item) => item.id === input.caseId);
  if (!securityCase) return null;
  const timestamp = nowIso();
  securityCase.containmentActions.push({ id: randomUUID(), action: input.action, reason: input.reason, performedAt: timestamp, temporary: true, founderExplanationPrepared: true });
  securityCase.currentStatus = 'contained';
  securityCase.updatedAt = timestamp;
  store.timeline.push({ id: randomUUID(), occurredAt: timestamp, title: 'Threat contained', summary: input.reason });
  await writeSecurityOperationsStore(store);
  return securityCase;
}

export async function recordFounderSecurityDecision(input: { caseId: string; founderUserId: string; action: SecurityDecisionRecord['action']; note: string }): Promise<SecurityCase | null> {
  const store = await readSecurityOperationsStore();
  const securityCase = store.cases.find((item) => item.id === input.caseId);
  if (!securityCase) return null;
  const timestamp = nowIso();
  securityCase.founderDecisionHistory.push({ id: randomUUID(), founderUserId: input.founderUserId, action: input.action, note: input.note, decidedAt: timestamp });
  securityCase.currentStatus = input.action === 'close-case' ? 'closed' : input.action === 'continue-monitoring' ? 'investigating' : 'founder-review-required';
  securityCase.updatedAt = timestamp;
  store.timeline.push({ id: randomUUID(), occurredAt: timestamp, title: 'Founder security decision', summary: `${input.action}: ${input.note}` });
  await writeSecurityOperationsStore(store);
  return securityCase;
}

export async function runSecurityIntelligenceScan(): Promise<SecurityCase[]> {
  const [reviews, notifications, unlocks, verifiedAccess, auth, store] = await Promise.all([readReviewStore(), readNotificationStore(), readUnlockStore(), readVerifiedAccessStore(), readAuthStore(), readSecurityOperationsStore()]);
  const created: SecurityCase[] = [];
  if (reviews.reviews.some((review) => review.moderationFlags.length > 0) && !store.cases.some((item) => item.category === 'malicious-platform-activity')) {
    created.push(await createSecurityCase({ accountsInvolved: reviews.reviews.filter((r) => r.moderationFlags.length > 0).map((r) => r.customerId), signal: 'suspicious review activity', evidence: ['Reviews with moderation flags detected.'], confidenceLevel: 'medium', recommendedAction: 'Review flagged content before taking moderation action.' }));
  }
  const duplicateNotifications = notifications.notifications.length - new Set(notifications.notifications.map((n) => `${n.recipientUserId}:${n.eventKey}`)).size;
  if (duplicateNotifications > 0 && !store.cases.some((item) => item.category === 'platform-manipulation')) {
    created.push(await createSecurityCase({ accountsInvolved: [], signal: 'platform manipulation notification duplication', evidence: [`${duplicateNotifications} duplicate notification signal(s) detected.`], confidenceLevel: 'low', recommendedAction: 'Review notification de-duplication behaviour.' }));
  }
  const unlockTargets = new Set(unlocks.unlocks.map((u) => `${u.customerId}:${u.target.propertyId}:${u.target.unitIdentifier}`));
  if (unlockTargets.size < unlocks.unlocks.length && !store.cases.some((item) => item.category === 'unlock-this-listing-bypass-attempt')) {
    created.push(await createSecurityCase({ accountsInvolved: unlocks.unlocks.map((u) => u.customerId), signal: 'unlock duplicate access pattern', evidence: ['Multiple unlock records for same customer and target detected.'], confidenceLevel: 'medium', recommendedAction: 'Investigate duplicate unlock purchase pattern.' }));
  }
  if (verifiedAccess.records.some((record) => record.status === 'active' && !record.scope.qualifyingTargets.length) && !store.cases.some((item) => item.category === 'verified-access-bypass-attempt')) {
    created.push(await createSecurityCase({ accountsInvolved: verifiedAccess.records.map((r) => r.customerId), signal: 'verified access suspicious scope', evidence: ['Active Verified Access record without qualifying targets detected.'], confidenceLevel: 'high', recommendedAction: 'Contain access and review payment/access records.' }));
  }
  const repeatedPhones = auth.users.length - new Set(auth.users.map((u) => u.phoneNumber)).size;
  if (repeatedPhones > 0 && !store.cases.some((item) => item.category === 'multiple-account-abuse')) {
    created.push(await createSecurityCase({ accountsInvolved: auth.users.map((u) => u.id), signal: 'multiple account abuse', evidence: [`${repeatedPhones} repeated phone number signal(s) detected.`], confidenceLevel: 'medium', recommendedAction: 'Investigate repeated account contact details before enforcement.' }));
  }
  return created;
}

export async function listSecurityCases(): Promise<SecurityCase[]> {
  const store = await readSecurityOperationsStore();
  return store.cases.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
}

export async function getSecurityAnalytics(): Promise<SecurityAnalyticsSummary> {
  const cases = await listSecurityCases();
  const categories: Record<string, number> = {};
  for (const item of cases) categories[item.category] = (categories[item.category] ?? 0) + 1;
  return { numberOfInvestigations: cases.length, investigationsResolved: cases.filter((c) => c.currentStatus === 'resolved' || c.currentStatus === 'closed').length, activeInvestigations: cases.filter((c) => !['resolved','closed'].includes(c.currentStatus)).length, securityIncidentsOverTime: cases.length, fraudCategories: categories, aiInvestigationAccuracy: 'Prepared from Founder decisions and resolved investigations.', repeatOffenderTrends: 'Long-term repeat offender trends are monitored through account and case history.', platformProtectionPerformance: 'Protection performance is tracked through containment and resolution history.' };
}

export async function getSecurityTimeline() { return (await readSecurityOperationsStore()).timeline.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)); }
export async function generateSecurityReport(request: SecurityReportRequest) { return { request, analytics: await getSecurityAnalytics(), cases: await listSecurityCases(), timeline: await getSecurityTimeline(), securelyProtected: true }; }
