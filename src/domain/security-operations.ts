import type { PropertyCategoryId, UserRoleId } from './types';

export type SecurityCaseCategory =
  | 'account-impersonation'
  | 'property-impersonation'
  | 'unlock-this-listing-bypass-attempt'
  | 'verified-access-bypass-attempt'
  | 'protected-information-access-attempt'
  | 'platform-manipulation'
  | 'multiple-account-abuse'
  | 'suspicious-registration-behaviour'
  | 'malicious-platform-activity'
  | 'security-attack';

export type SecurityCaseStatus = 'open' | 'investigating' | 'founder-review-required' | 'contained' | 'resolved' | 'closed';
export type SecurityConfidenceLevel = 'low' | 'medium' | 'high';
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';
export type EnforcementAction = 'approve-recommendation' | 'reject-recommendation' | 'request-additional-investigation' | 'continue-monitoring' | 'close-case' | 'temporary-containment';

export interface SecurityEvidenceItem {
  id: string;
  label: string;
  detail: string;
  createdAt: string;
}

export interface SecurityCase {
  id: string;
  dateCreated: string;
  accountsInvolved: string[];
  propertyId?: string;
  propertyCategory?: PropertyCategoryId;
  category: SecurityCaseCategory;
  aiInvestigationSummary: string;
  supportingEvidence: SecurityEvidenceItem[];
  confidenceLevel: SecurityConfidenceLevel;
  severity: SecuritySeverity;
  currentStatus: SecurityCaseStatus;
  recommendedAction: string;
  founderDecisionHistory: SecurityDecisionRecord[];
  containmentActions: SecurityContainmentAction[];
  updatedAt: string;
}

export interface SecurityDecisionRecord {
  id: string;
  founderUserId: string;
  action: EnforcementAction;
  note: string;
  decidedAt: string;
}

export interface SecurityContainmentAction {
  id: string;
  action:
    | 'block-malicious-requests'
    | 'prevent-unauthorised-access'
    | 'protect-customer-information'
    | 'protect-payment-services'
    | 'protect-platform-infrastructure';
  reason: string;
  performedAt: string;
  temporary: true;
  founderExplanationPrepared: true;
}

export interface SecurityAnalyticsSummary {
  numberOfInvestigations: number;
  investigationsResolved: number;
  activeInvestigations: number;
  securityIncidentsOverTime: number;
  fraudCategories: Record<string, number>;
  aiInvestigationAccuracy: string;
  repeatOffenderTrends: string;
  platformProtectionPerformance: string;
}

export interface SecurityTimelineEvent {
  id: string;
  occurredAt: string;
  title: string;
  summary: string;
}

export interface SecurityReportRequest {
  reportType:
    | 'security-summary'
    | 'fraud-investigation-report'
    | 'investigation-history'
    | 'repeat-offender-report'
    | 'platform-protection-report'
    | 'security-trend-report'
    | 'custom-date-range-report';
  customStartDate?: string;
  customEndDate?: string;
}

export const SECURITY_OPERATIONS_CENTRE = {
  invisibleToNormalUsers: true,
  protectsLegitimateUsers: true,
  investigateFirstRecommendSecond: true,
  interruptFounderOnlyWhenGenuinelyNecessary: true,
  dashboardDisplays: [
    'Active Security Status',
    'Active Investigations',
    'Critical Security Alerts',
    'Fraud Cases Awaiting Review',
    'AI Recommendations',
    'Repeat Offender Monitoring',
    'Security Trends',
    'Platform Protection Status'
  ] as const,
  fraudCategories: [
    'Account Impersonation',
    'Property Impersonation',
    'Unlock This Listing bypass attempts',
    'Verified Access bypass attempts',
    'Protected information access attempts',
    'Platform manipulation',
    'Multiple account abuse',
    'Suspicious registration behaviour',
    'Malicious platform activity',
    'Security attacks'
  ] as const,
  aiInvestigationWorkflow: [
    'Detect the activity',
    'Collect evidence',
    'Analyse behaviour',
    'Compare against historical activity',
    'Calculate confidence',
    'Recommend an action',
    'Explain reasoning'
  ] as const,
  founderDecisionCentreActions: ['Approve recommendation', 'Reject recommendation', 'Request additional investigation', 'Continue monitoring', 'Close case'] as const,
  automaticProtection: {
    immediateThreatContainmentAllowed: true,
    examples: ['Blocking malicious requests', 'Preventing unauthorised access', 'Protecting customer information', 'Protecting payment services', 'Protecting platform infrastructure'] as const,
    minimiseCustomerDisruption: true,
    founderReceivesExplanationAfterwards: true
  },
  repeatOffenderIntelligence: ['Repeated platform manipulation', 'Repeated impersonation', 'Repeated bypass attempts', 'Repeated malicious registrations', 'Repeated security violations'] as const,
  invisibleTrustIntelligence: {
    continuesLearningSilently: true,
    learnsAccountBehaviour: true,
    learnsPropertyBehaviour: true,
    learnsSecurityBehaviour: true,
    learnsVerificationBehaviour: true,
    learnsPaymentBehaviour: true,
    learnsReviewBehaviour: true,
    remainsCompletelyInvisible: true,
    usersIncludingFounderCannotSeeOrEditInternalTrustAssessment: true
  },
  propertyReputationIntelligence: {
    maintainsOperationalHistoryForEveryProperty: true,
    usedForFraudComplaintsVerificationSuspiciousBehaviourAndUnusualPatterns: true,
    improvesAiDecisionMakingWithoutUnfairlyAffectingLegitimateProperties: true
  },
  securityAnalytics: ['Number of investigations', 'Investigations resolved', 'Active investigations', 'Security incidents over time', 'Fraud categories', 'AI investigation accuracy', 'Repeat offender trends', 'Platform protection performance'] as const,
  enforcementPrinciples: [
    'Protect legitimate users',
    'Investigate before accusing',
    'Gather evidence before recommending action',
    'Minimise false positives',
    'Preserve Founder authority',
    'Maintain platform integrity'
  ] as const,
  permanentEnforcementNormallyRequiresFounderApproval: true,
  immediateContainmentAllowedForPlatformProtection: true,
  aiLearning: {
    learnsFromFounderDecisions: true,
    learnsFromResolvedInvestigations: true,
    learnsFromFalsePositives: true,
    learnsFromConfirmedFraudCases: true,
    learnsFromOperationalHistory: true,
    neverModifiesFounderApprovedBusinessRulesOrPolicies: true
  },
  reports: ['Security Summary', 'Fraud Investigation Report', 'Investigation History', 'Repeat Offender Report', 'Platform Protection Report', 'Security Trend Report', 'Custom Date Range Report'] as const,
  security: {
    reportsSecurelyProtected: true,
    timelineSearchable: true,
    fullyAuditable: true
  },
  integrations: ['Platform Security Foundation', 'AI Admin Assistant', 'Founder Dashboard', 'Authentication', 'Property Registration', 'Property Verification', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Unlock This Listing', 'Verified Access', 'Payment System', 'Viewing Workflow', 'Reviews & Ratings', 'Notifications', 'Platform Health Monitor', 'Platform Analytics'] as const
} as const;
