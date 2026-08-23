import type { AiAdminMonitoringArea, AiAdminPriority } from './ai-admin-assistant';

export type AiDecisionLevel = 'level-1-silent-operations' | 'level-2-summary-recommendations' | 'level-3-critical-alerts';
export type AiConfidenceLevel = 'low' | 'medium' | 'high';
export type PlatformHealthStatus = 'healthy' | 'watch' | 'attention-needed' | 'critical';

export interface AiWorkspaceRecommendation {
  id: string;
  level: AiDecisionLevel;
  area: AiAdminMonitoringArea | 'security' | 'payment-system' | 'platform-health';
  priority: AiAdminPriority;
  confidenceLevel: AiConfidenceLevel;
  whatDetected: string;
  whyAttentionMayBeRequired: string;
  suggestedAction: string;
  administratorFinalDecisionRequired: boolean;
  createdAt: string;
}

export interface AiPlatformSummary {
  title: "Today's Platform Summary";
  possibleDuplicatePropertyRegistrations: number;
  suspiciousReviewPatterns: number;
  propertiesAwaitingVerification: number;
  paymentSuccessRate: string;
  notificationsAutomaticallyRecovered: number;
  repeatedVacancyStatusChanges: number;
  administratorDecidesWhetherActionRequired: true;
}

export interface AiCriticalAlert {
  id: string;
  alertType:
    | 'payment-fraud-attempt'
    | 'fake-payment-confirmation'
    | 'account-takeover-attempt'
    | 'mass-spam-attack'
    | 'database-integrity-issue'
    | 'critical-api-failure'
    | 'platform-outage'
    | 'security-breach'
    | 'verification-service-failure'
    | 'major-payment-system-failure';
  title: string;
  explanation: string;
  priority: 'urgent';
  createdAt: string;
}

export interface PlatformHealthOverview {
  activeProperties: number;
  activeCustomers: number;
  activePropertyOwners: number;
  activePropertyManagers: number;
  activeLeasingAgents: number;
  verificationQueue: number;
  paymentSuccessRate: string;
  notificationDeliveryRate: string;
  dailyVacancyConfirmationCompliance: string;
  platformHealthStatus: PlatformHealthStatus;
}

export const AI_ADMIN_WORKSPACE_FOUNDATION = {
  preservesInvisibleIntelligencePrinciple: true,
  customersCanSeeWorkspace: false,
  supportsAdministratorsNotReplaceThem: true,
  threeLevelDecisionFramework: {
    level1SilentOperations: [
      'Retrying failed notifications',
      'Removing duplicate notifications',
      'Receipt regeneration',
      'Background synchronisation',
      'Temporary communication retries',
      'Routine health checks',
      'Temporary cache issues',
      'Minor platform optimisations'
    ] as const,
    level2AiSummaryAndRecommendations: [
      'Possible duplicate properties',
      'Possible duplicate reviews',
      'Properties awaiting verification',
      'Long-pending verification requests',
      'Frequently changing vacancy status',
      'High customer interest properties',
      'Search behaviour trends',
      'Platform performance trends',
      'Payment success statistics',
      'Verification workload',
      'Review moderation trends'
    ] as const,
    level3ImmediateCriticalAlerts: [
      'Payment fraud attempts',
      'Fake payment confirmations',
      'Account takeover attempts',
      'Mass spam attacks',
      'Database integrity issues',
      'Critical API failures',
      'Platform outages',
      'Security breaches',
      'Verification service failures',
      'Major payment system failures'
    ] as const
  },
  duplicatePropertyIntelligence: {
    neverAssumeFromNameDescriptionOrPhotosAlone: true,
    analyseTogether: ['GPS location', 'Registered property location', 'Building identity', 'Unit identifiers', 'Registration information', 'Registered Property Owner', 'Registered Property Manager', 'Registered Leasing Agent'] as const,
    classification: 'Possible Duplicate Property',
    finalDecisionBelongsToAdministrator: true
  },
  reviewIntelligence: {
    detects: ['Repeated identical reviews', 'Spam content', 'Offensive language', 'Coordinated review behaviour', 'Unusual review activity'] as const,
    recommendsModeration: true,
    neverAutomaticallyRemovesLegitimateReviews: true
  },
  paymentIntelligence: ['Payment success rates', 'Failed transactions', 'Duplicate payment attempts', 'Missing receipts', 'Payment recovery events', 'Suspicious payment activity'] as const,
  verificationIntelligence: ['Missing registration information', 'Poor quality property photos', 'Unusual registration behaviour', 'Long-pending verification requests', 'Repeated verification failures'] as const,
  vacancyIntelligence: ['Daily Vacancy Confirmation compliance', 'Frequently changing vacancy status', 'Long-unconfirmed vacancies', 'Unusual vacancy patterns'] as const,
  learningPrinciple: {
    mayImproveRecommendationsOverTime: true,
    mustNeverModifyFounderApprovedPricing: true,
    mustNeverModifyUnlockThisListingRules: true,
    mustNeverModifyVerifiedAccessRules: true,
    mustNeverModifyMatchEngineRules: true,
    mustNeverModifyVerificationRules: true,
    mustNeverModifyCustomerAccessControlRules: true,
    mustNeverModifyViewingWorkflow: true,
    mustNeverModifyBusinessLogic: true,
    onlyFounderMayApproveBusinessRuleChanges: true
  },
  administratorControl: {
    finalDecisionAlwaysWithAdministrator: true,
    aiMayRecommendDetectPrioritiseSummariseExplain: true,
    aiMustNeverSilentlyApproveRejectDeleteOrModifyCriticalDecisions: true
  },
  security: {
    protectCustomerPrivacy: true,
    protectPropertyInformation: true,
    protectPaymentInformation: true,
    protectAdministratorActions: true,
    secureOperationalLogs: true,
    fullyAuditableAiActivities: true
  }
} as const;

export function createWorkspaceRecommendation(input: Omit<AiWorkspaceRecommendation, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): AiWorkspaceRecommendation {
  return {
    id: input.id ?? `ai-workspace-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
    level: input.level,
    area: input.area,
    priority: input.priority,
    confidenceLevel: input.confidenceLevel,
    whatDetected: input.whatDetected,
    whyAttentionMayBeRequired: input.whyAttentionMayBeRequired,
    suggestedAction: input.suggestedAction,
    administratorFinalDecisionRequired: input.administratorFinalDecisionRequired,
    createdAt: input.createdAt ?? new Date().toISOString()
  };
}
