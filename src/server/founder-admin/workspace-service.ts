import { FOUNDER_MANAGEMENT_WORKSPACE, type FounderWorkspaceSnapshot, type FounderWorkspaceSummary } from '@/domain/founder-workspace';
import { buildAiPlatformSummary, buildPlatformHealthOverview } from '@/server/ai-admin-workspace/service';
import { getFounderApprovalCases, getFounderAuditTrail, founderQuickSearch } from './service';

export async function buildFounderWorkspaceSummary(): Promise<FounderWorkspaceSummary> {
  const [summary, health] = await Promise.all([buildAiPlatformSummary(), buildPlatformHealthOverview()]);
  return {
    platformPerformance: `Platform health is ${health.platformHealthStatus}.`,
    verificationProgress: `${summary.propertiesAwaitingVerification} properties are awaiting verification.`,
    customerActivity: `${health.activeCustomers} active customers currently recorded.`,
    propertyGrowth: `${health.activeProperties} active properties currently recorded.`,
    paymentPerformance: `Payment success rate: ${summary.paymentSuccessRate}.`,
    vacancyConfirmationCompliance: `Daily Vacancy Confirmation compliance: ${health.dailyVacancyConfirmationCompliance}.`,
    reviewTrends: `${summary.suspiciousReviewPatterns} suspicious review patterns detected.`,
    securityObservations: 'Critical security alerts are reserved for Founder attention only.',
    operationalRecommendations: [
      `${summary.possibleDuplicatePropertyRegistrations} possible duplicate property registrations detected.`,
      `${summary.notificationsAutomaticallyRecovered} notifications were automatically recovered.`,
      `${summary.repeatedVacancyStatusChanges} properties experienced repeated vacancy status changes.`
    ]
  };
}

export async function getFounderWorkspaceSnapshot(query?: string): Promise<FounderWorkspaceSnapshot> {
  const [aiSummary, approvalCentre, auditLogs, quickSearchResults] = await Promise.all([
    buildFounderWorkspaceSummary(),
    getFounderApprovalCases(),
    getFounderAuditTrail(),
    query ? founderQuickSearch(query) : Promise.resolve(undefined)
  ]);
  return {
    sections: FOUNDER_MANAGEMENT_WORKSPACE.navigationSections,
    aiSummary,
    approvalCentre,
    operationalSearchPrepared: true,
    auditLogs,
    quickSearchResults
  };
}
