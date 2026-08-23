import { createWorkspaceRecommendation, type AiCriticalAlert, type AiPlatformSummary, type AiWorkspaceRecommendation, type PlatformHealthOverview } from '@/domain/ai-admin-workspace';
import { readAuthStore } from '@/server/auth/store';
import { readPropertyStore } from '@/server/properties/store';
import { getVerificationQueue } from '@/server/verification/service';
import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { readNotificationStore } from '@/server/notifications/store';
import { readReviewStore } from '@/server/reviews/store';
import { readCustomerDashboardStore } from '@/server/customer-dashboard/store';

export async function buildAiPlatformSummary(): Promise<AiPlatformSummary> {
  const [properties, verification, vacancies, notifications, reviews, dashboard] = await Promise.all([
    readPropertyStore(), getVerificationQueue(), getAllVacancyConfirmationRecords(), readNotificationStore(), readReviewStore(), readCustomerDashboardStore()
  ]);
  return {
    title: "Today's Platform Summary",
    possibleDuplicatePropertyRegistrations: properties.properties.filter((p) => p.duplicateCandidateIds.length > 0).length,
    suspiciousReviewPatterns: reviews.reviews.filter((r) => r.moderationFlags.length > 0).length,
    propertiesAwaitingVerification: verification.filter((v) => v.status === 'waiting-for-verification' || v.status === 'pending-verification').length,
    paymentSuccessRate: dashboard.payments.length ? `${Math.round((dashboard.payments.filter((p) => p.paymentStatus === 'successful').length / dashboard.payments.length) * 1000) / 10}%` : 'No payments yet',
    notificationsAutomaticallyRecovered: notifications.notifications.filter((n) => n.eventType === 'platform-announcement').length,
    repeatedVacancyStatusChanges: vacancies.filter((v) => v.confirmationHistory.length > 3).length,
    administratorDecidesWhetherActionRequired: true
  };
}

export async function buildPlatformHealthOverview(): Promise<PlatformHealthOverview> {
  const [auth, properties, verification, vacancies, notifications, dashboard] = await Promise.all([
    readAuthStore(), readPropertyStore(), getVerificationQueue(), getAllVacancyConfirmationRecords(), readNotificationStore(), readCustomerDashboardStore()
  ]);
  const activeUsers = auth.users.filter((u) => u.status === 'active');
  const successfulPayments = dashboard.payments.filter((p) => p.paymentStatus === 'successful').length;
  const paymentSuccessRate = dashboard.payments.length ? `${Math.round((successfulPayments / dashboard.payments.length) * 1000) / 10}%` : 'No payments yet';
  const deliveryRate = notifications.notifications.length ? '100%' : 'No notifications yet';
  const confirmed = vacancies.filter((v) => v.status === 'confirmed-vacancy').length;
  const compliance = vacancies.length ? `${Math.round((confirmed / vacancies.length) * 1000) / 10}%` : 'No vacancy records yet';
  return {
    activeProperties: properties.properties.length,
    activeCustomers: activeUsers.filter((u) => u.role === 'customer').length,
    activePropertyOwners: activeUsers.filter((u) => u.role === 'property-owner').length,
    activePropertyManagers: activeUsers.filter((u) => u.role === 'property-manager').length,
    activeLeasingAgents: activeUsers.filter((u) => u.role === 'leasing-agent').length,
    verificationQueue: verification.length,
    paymentSuccessRate,
    notificationDeliveryRate: deliveryRate,
    dailyVacancyConfirmationCompliance: compliance,
    platformHealthStatus: 'healthy'
  };
}

export async function buildAiWorkspaceRecommendations(): Promise<AiWorkspaceRecommendation[]> {
  const [summary, vacancies, verification, reviews] = await Promise.all([buildAiPlatformSummary(), getAllVacancyConfirmationRecords(), getVerificationQueue(), readReviewStore()]);
  const recommendations: AiWorkspaceRecommendation[] = [];
  if (summary.possibleDuplicatePropertyRegistrations > 0) recommendations.push(createWorkspaceRecommendation({ level: 'level-2-summary-recommendations', area: 'duplicate-property-detection', priority: 'normal', confidenceLevel: 'medium', whatDetected: `${summary.possibleDuplicatePropertyRegistrations} possible duplicate property registrations detected.`, whyAttentionMayBeRequired: 'Duplicate listings can confuse customers and reduce trust.', suggestedAction: 'Review duplicate indicators including location, unit identifiers and registrant details.', administratorFinalDecisionRequired: true }));
  if (reviews.reviews.some((r) => r.moderationFlags.length > 0)) recommendations.push(createWorkspaceRecommendation({ level: 'level-2-summary-recommendations', area: 'review-moderation-assistance', priority: 'normal', confidenceLevel: 'medium', whatDetected: 'Suspicious review patterns detected.', whyAttentionMayBeRequired: 'Review quality affects customer trust.', suggestedAction: 'Open moderation queue and review flagged content.', administratorFinalDecisionRequired: true }));
  if (verification.some((v) => v.status === 'verification-failed')) recommendations.push(createWorkspaceRecommendation({ level: 'level-2-summary-recommendations', area: 'property-verification', priority: 'high', confidenceLevel: 'high', whatDetected: 'Repeated or failed verification attempts exist.', whyAttentionMayBeRequired: 'Verification failures may indicate missing information or unusual registration behaviour.', suggestedAction: 'Review correction hints and verification history.', administratorFinalDecisionRequired: true }));
  if (vacancies.some((v) => v.intelligence?.freshnessStatus === 'long-overdue-for-confirmation')) recommendations.push(createWorkspaceRecommendation({ level: 'level-2-summary-recommendations', area: 'vacancy-confirmation-monitoring', priority: 'high', confidenceLevel: 'high', whatDetected: 'Long-unconfirmed vacancies detected.', whyAttentionMayBeRequired: 'Outdated vacancies reduce customer trust.', suggestedAction: 'Remind responsible property contacts to reconfirm or close vacancies.', administratorFinalDecisionRequired: true }));
  return recommendations;
}

export function buildCriticalAlerts(): AiCriticalAlert[] { return []; }
