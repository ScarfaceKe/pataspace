import type { PropertyCategoryId, UserRoleId } from './types';

export type AiAdminMonitoringArea =
  | 'property-verification'
  | 'duplicate-property-detection'
  | 'duplicate-vacancy-detection'
  | 'missing-registration-information'
  | 'suspicious-account-activity'
  | 'vacancy-confirmation-monitoring'
  | 'review-moderation-assistance'
  | 'notification-delivery-monitoring'
  | 'payment-anomaly-detection'
  | 'platform-health-monitoring'
  | 'match-engine-monitoring';

export type AiAdminPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AiAdminRecommendationStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface AiAdminRecommendation {
  id: string;
  area: AiAdminMonitoringArea;
  priority: AiAdminPriority;
  status: AiAdminRecommendationStatus;
  title: string;
  clearExplanation: string;
  reason: string;
  suggestedAction: string;
  relatedPropertyId?: string;
  relatedPropertyCategory?: PropertyCategoryId;
  relatedUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiAdminAssistantScope {
  allowedDataAccess: readonly string[];
  restrictedDataAccess: readonly string[];
  customerPrivacyPreserved: true;
  platformSecurityPreserved: true;
}

export const AI_ADMIN_ASSISTANT_FOUNDATION = {
  internalOnly: true,
  isChatbot: false,
  visibleToCustomers: false,
  operatesInBackground: true,
  customersInteractWithAi: false,
  customersAskAiQuestions: false,
  customersKnowAiIsOperating: false,
  customersTriggerAiManually: false,
  purpose: 'Quietly supports administrators and improves operational efficiency without replacing human decision-making.',
  invisibleIntelligenceOutcomes: ['Faster', 'Smarter', 'More accurate', 'More reliable', 'Easier to manage'] as const,
  administrativeSupport: [
    'Property verification',
    'Duplicate property detection',
    'Duplicate vacancy detection',
    'Missing registration information',
    'Suspicious account activity',
    'Vacancy confirmation monitoring',
    'Review moderation assistance',
    'Notification delivery monitoring',
    'Payment anomaly detection',
    'Platform health monitoring'
  ] as const,
  propertyVerificationAssistance: [
    'Missing information',
    'Inconsistent information',
    'Possible duplicate registrations',
    'Unusual registration behaviour',
    'Incomplete photo uploads',
    'Verification anomalies'
  ] as const,
  matchEngineMonitoring: {
    monitors: ['House Match', 'Shop Match', 'Office Match', 'Event Hall Match'] as const,
    detects: ['Matching failures', 'Poor search results', 'Duplicate search results', 'Ranking inconsistencies'] as const,
    changesFounderApprovedMatchRules: false
  },
  paymentMonitoring: ['Failed payments', 'Duplicate payment attempts', 'Payment recovery events', 'Missing receipts', 'Payment processing failures'] as const,
  reviewMonitoring: ['Spam', 'Offensive reviews', 'Duplicate reviews', 'Suspicious review activity', 'Potential fake reviews'] as const,
  notificationMonitoring: ['Failed notifications', 'Duplicate notifications', 'Delayed notifications', 'Delivery failures'] as const,
  vacancyMonitoring: ['Daily Vacancy Confirmation compliance', 'Long-unconfirmed vacancies', 'Frequently changing vacancy status', 'Unusual vacancy patterns'] as const,
  recommendationFields: ['Clear explanation', 'Reason for the recommendation', 'Suggested action', 'Priority level'] as const,
  finalDecision: {
    administratorAlwaysMakesFinalDecision: true,
    aiDoesNotOverrideFounderApprovedWorkflows: true,
    aiDoesNotAutomaticallyRemoveLegitimateReviews: true
  },
  learningPrinciple: {
    mayImproveRecommendationsFromPlatformActivity: true,
    mustNeverChangeFounderApprovedPricing: true,
    mustNeverChangeAccessRules: true,
    mustNeverChangeVerificationRules: true,
    mustNeverChangeMatchEngineRules: true,
    mustNeverChangeCustomerAccessControlRules: true,
    onlyFounderCanApproveBusinessRuleChanges: true
  },
  security: {
    accessOnlyRequiredInformation: true,
    customerPrivacyAlwaysPreserved: true,
    platformSecurityAlwaysPreserved: true
  },
  integrations: [
    'Authentication',
    'Property Registration',
    'Property Verification',
    'House Match',
    'Shop Match',
    'Office Match',
    'Event Hall Match',
    'Unlock This Listing',
    'Verified Access',
    'Payment System',
    'Viewing Workflow',
    'Reviews',
    'Notifications',
    'Customer Dashboard',
    'Platform Health Monitor'
  ] as const
} as const;

export const AI_ADMIN_ASSISTANT_SCOPE: AiAdminAssistantScope = {
  allowedDataAccess: [
    'Operational metadata required for verification support',
    'Property registration quality signals',
    'Vacancy confirmation status signals',
    'Review moderation signals',
    'Notification delivery status signals',
    'Payment anomaly signals',
    'Match engine result health signals'
  ],
  restrictedDataAccess: [
    'Unnecessary private customer data',
    'Secrets and credentials',
    'Data unrelated to administrative responsibilities'
  ],
  customerPrivacyPreserved: true,
  platformSecurityPreserved: true
} as const;

export function createAiAdminRecommendation(input: Omit<AiAdminRecommendation, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { id?: string; now?: string }): AiAdminRecommendation {
  const timestamp = input.now ?? new Date().toISOString();
  return {
    id: input.id ?? `ai-rec-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
    area: input.area,
    priority: input.priority,
    status: 'open',
    title: input.title,
    clearExplanation: input.clearExplanation,
    reason: input.reason,
    suggestedAction: input.suggestedAction,
    relatedPropertyId: input.relatedPropertyId,
    relatedPropertyCategory: input.relatedPropertyCategory,
    relatedUserId: input.relatedUserId,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function aiAdminCanAccessRole(role: UserRoleId): boolean {
  return role === 'platform-admin';
}
