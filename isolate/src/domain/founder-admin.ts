import type { AiAdminPriority } from './ai-admin-assistant';

export type FounderActionType =
  | 'approval'
  | 'rejection'
  | 'request-further-review'
  | 'pricing-change'
  | 'business-rule-change'
  | 'security-action'
  | 'manual-override'
  | 'platform-policy-change'
  | 'system-wide-setting-change';

export type FounderApprovalDecision = 'approve' | 'reject' | 'request-further-review';

export interface FounderAuditTrailEntry {
  id: string;
  founderUserId: string;
  actionType: FounderActionType;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
  aiRecommendationId?: string;
}

export interface FounderApprovalCase {
  id: string;
  caseType:
    | 'property-verification-recommendation'
    | 'suspicious-payment-investigation'
    | 'reported-review'
    | 'potential-fraudulent-account'
    | 'platform-security-alert'
    | 'exceptional-customer-dispute';
  caseSummary: string;
  supportingEvidence: string[];
  aiConfidenceLevel: 'low' | 'medium' | 'high';
  recommendedAction: string;
  priority: AiAdminPriority;
}

export interface FounderDashboardOverview {
  activeCustomers: number;
  activePropertyOwners: number;
  activePropertyManagers: number;
  activeLeasingAgents: number;
  registeredProperties: number;
  verifiedProperties: number;
  pendingVerifications: number;
  activeUnlockThisListingPurchases: number;
  activeVerifiedAccessPurchases: number;
  viewingRequests: number;
  reviewsAwaitingAttention: number;
  dailyVacancyConfirmationCompliance: string;
  platformHealthStatus: string;
}

export interface FounderQuickSearchResult {
  id: string;
  type: 'customer' | 'property-owner' | 'property-manager' | 'leasing-agent' | 'platform-admin' | 'property' | 'payment' | 'viewing-request' | 'review' | 'notification';
  label: string;
  managementPath: string;
}

export const FOUNDER_ADMIN_DASHBOARD = {
  founderIsHighestAuthority: true,
  onlyFounderMay: [
    'Change business rules',
    'Change Unlock This Listing pricing',
    'Change Verified Access pricing',
    'Change AI operational behaviour',
    'Change platform policies',
    'Manage administrator permissions',
    'Override AI recommendations',
    'Approve critical platform decisions',
    'View complete platform analytics',
    'Configure system-wide settings'
  ] as const,
  aiOperationsOfficer: {
    label: 'AI Operations Officer',
    actsAsOperationalTeam: true,
    covers: ['Verification Officer', 'Customer Support Officer', 'Finance Officer', 'Content Moderator'] as const,
    alwaysUnderFounderSupervision: true,
    neverBypassesFounderPermissions: true
  },
  aiAuthorityLevels: {
    level1AiActsAutomatically: [
      'Notification retries',
      'Receipt regeneration',
      'Routine monitoring',
      'Spam filtering',
      'Minor customer support',
      'Background platform optimisation',
      'Routine operational health checks'
    ] as const,
    level2AiInvestigatesAndRecommends: [
      'Property verification decisions',
      'Suspicious payment activity',
      'Reported reviews',
      'Potential fraudulent accounts',
      'Disputed viewing requests',
      'Verification inconsistencies'
    ] as const,
    level3FounderExclusiveDecisions: [
      'Business rules',
      'Platform pricing',
      'Founder-approved workflows',
      'Platform policies',
      'AI operational rules',
      'Security permissions',
      'Permanent account bans',
      'Platform-wide configuration',
      'Founder Blueprint decisions'
    ] as const
  },
  dashboardPrinciples: ['Clarity', 'Speed', 'Intelligent recommendations over complexity'] as const,
  auditTrailRequiredFor: ['Approvals', 'Rejections', 'Pricing changes', 'Business rule changes', 'Security actions', 'Manual overrides'] as const,
  security: {
    highestLevelPlatformSecurity: true,
    founderExclusiveControlsOnlyForFounder: true,
    sensitiveAdministrativeActionsSecurelyLogged: true,
    aiOperationsOfficerCannotOverrideFounderAuthority: true
  },
  integrations: [
    'AI Admin Assistant',
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
    'Reviews & Ratings',
    'Notifications',
    'Customer Dashboard',
    'Platform Health Monitor'
  ] as const
} as const;
