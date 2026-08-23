import { randomUUID } from 'node:crypto';
import type { FounderApprovalCase, FounderApprovalDecision, FounderAuditTrailEntry, FounderDashboardOverview, FounderQuickSearchResult } from '@/domain/founder-admin';
import { readAiAdminStore } from '@/server/ai-admin/store';
import { buildAiPlatformSummary, buildAiWorkspaceRecommendations, buildPlatformHealthOverview } from '@/server/ai-admin-workspace/service';
import { readAuthStore } from '@/server/auth/store';
import { readCustomerDashboardStore } from '@/server/customer-dashboard/store';
import { readNotificationStore } from '@/server/notifications/store';
import { readPropertyStore } from '@/server/properties/store';
import { readReviewStore } from '@/server/reviews/store';
import { readUnlockStore } from '@/server/unlock/store';
import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { getVerificationQueue } from '@/server/verification/service';
import { readVerifiedAccessStore } from '@/server/verified-access/store';
import { readViewingStore } from '@/server/viewings/store';
import { readFounderAdminStore, writeFounderAdminStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

export async function getFounderDashboardOverview(): Promise<FounderDashboardOverview> {
  const [auth, properties, verification, unlocks, verifiedAccess, viewings, reviews, vacancies, health] = await Promise.all([
    readAuthStore(), readPropertyStore(), getVerificationQueue(), readUnlockStore(), readVerifiedAccessStore(), readViewingStore(), readReviewStore(), getAllVacancyConfirmationRecords(), buildPlatformHealthOverview()
  ]);
  const activeUsers = auth.users.filter((user) => user.status === 'active');
  const confirmedVacancies = vacancies.filter((record) => record.status === 'confirmed-vacancy').length;
  return {
    activeCustomers: activeUsers.filter((user) => user.role === 'customer').length,
    activePropertyOwners: activeUsers.filter((user) => user.role === 'property-owner').length,
    activePropertyManagers: activeUsers.filter((user) => user.role === 'property-manager').length,
    activeLeasingAgents: activeUsers.filter((user) => user.role === 'leasing-agent').length,
    registeredProperties: properties.properties.length,
    verifiedProperties: verification.filter((record) => record.status === 'verified').length,
    pendingVerifications: verification.filter((record) => record.status === 'pending-verification' || record.status === 'waiting-for-verification').length,
    activeUnlockThisListingPurchases: unlocks.unlocks.filter((unlock) => unlock.status === 'active').length,
    activeVerifiedAccessPurchases: verifiedAccess.records.filter((access) => access.status === 'active').length,
    viewingRequests: viewings.viewings.length,
    reviewsAwaitingAttention: reviews.reviews.filter((review) => review.status === 'flagged-for-moderation').length,
    dailyVacancyConfirmationCompliance: vacancies.length ? `${Math.round((confirmedVacancies / vacancies.length) * 1000) / 10}%` : 'No vacancy records yet',
    platformHealthStatus: health.platformHealthStatus
  };
}

export async function getFounderAiSummary() {
  return buildAiPlatformSummary();
}

export async function getFounderApprovalCases(): Promise<FounderApprovalCase[]> {
  const recommendations = await buildAiWorkspaceRecommendations();
  const aiStore = await readAiAdminStore();
  return [...recommendations, ...aiStore.recommendations].map((item) => ({
    id: item.id,
    caseType: item.area === 'review-moderation-assistance' ? 'reported-review' : item.area === 'payment-anomaly-detection' ? 'suspicious-payment-investigation' : item.area === 'suspicious-account-activity' ? 'potential-fraudulent-account' : item.area === 'property-verification' ? 'property-verification-recommendation' : 'platform-security-alert',
    caseSummary: 'whatDetected' in item ? item.whatDetected : item.title,
    supportingEvidence: ['reason' in item ? item.reason : item.whyAttentionMayBeRequired, 'clearExplanation' in item ? item.clearExplanation : item.suggestedAction].filter(Boolean),
    aiConfidenceLevel: 'confidenceLevel' in item ? item.confidenceLevel : 'medium',
    recommendedAction: item.suggestedAction,
    priority: item.priority
  }));
}

export async function recordFounderAuditAction(input: Omit<FounderAuditTrailEntry, 'id' | 'createdAt'>): Promise<FounderAuditTrailEntry> {
  const data = await readFounderAdminStore();
  const entry: FounderAuditTrailEntry = { ...input, id: randomUUID(), createdAt: nowIso() };
  data.auditTrail.push(entry);
  await writeFounderAdminStore(data);
  return entry;
}

export async function decideFounderApproval(input: { founderUserId: string; caseId: string; decision: FounderApprovalDecision; summary: string }): Promise<FounderAuditTrailEntry> {
  return recordFounderAuditAction({
    founderUserId: input.founderUserId,
    actionType: input.decision === 'approve' ? 'approval' : input.decision === 'reject' ? 'rejection' : 'request-further-review',
    targetType: 'ai-recommendation-case',
    targetId: input.caseId,
    summary: input.summary,
    aiRecommendationId: input.caseId
  });
}

export async function getFounderAuditTrail(): Promise<FounderAuditTrailEntry[]> {
  return (await readFounderAdminStore()).auditTrail.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function founderQuickSearch(query: string): Promise<FounderQuickSearchResult[]> {
  const [auth, properties, dashboard, viewings, reviews, notifications] = await Promise.all([
    readAuthStore(), readPropertyStore(), readCustomerDashboardStore(), readViewingStore(), readReviewStore(), readNotificationStore()
  ]);
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: FounderQuickSearchResult[] = [];
  for (const user of auth.users) {
    if (user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.phoneNumber.includes(q)) {
      results.push({ id: user.id, type: user.role === 'customer' ? 'customer' : user.role, label: `${user.fullName} · ${user.role}`, managementPath: `/admin/users/${user.id}` });
    }
  }
  for (const property of properties.properties) {
    if (property.id.toLowerCase().includes(q) || property.description.toLowerCase().includes(q) || property.location.townOrCity.toLowerCase().includes(q)) results.push({ id: property.id, type: 'property', label: `${property.category} · ${property.location.townOrCity}`, managementPath: `/admin/properties/${property.id}` });
  }
  for (const payment of dashboard.payments) if (payment.transactionReference.toLowerCase().includes(q)) results.push({ id: payment.id, type: 'payment', label: `${payment.purchaseType} · ${payment.transactionReference}`, managementPath: `/admin/payments/${payment.id}` });
  for (const viewing of viewings.viewings) if (viewing.propertyOrUnitIdentifier.toLowerCase().includes(q)) results.push({ id: viewing.id, type: 'viewing-request', label: `${viewing.propertyOrUnitIdentifier} · ${viewing.status}`, managementPath: `/admin/viewings/${viewing.id}` });
  for (const review of reviews.reviews) if (review.unitIdentifier.toLowerCase().includes(q)) results.push({ id: review.id, type: 'review', label: `${review.unitIdentifier} · ${review.status}`, managementPath: `/admin/reviews/${review.id}` });
  for (const notification of notifications.notifications) if (notification.title.toLowerCase().includes(q)) results.push({ id: notification.id, type: 'notification', label: notification.title, managementPath: `/admin/notifications/${notification.id}` });
  return results.slice(0, 50);
}
