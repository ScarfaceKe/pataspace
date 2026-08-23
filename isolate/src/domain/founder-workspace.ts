import type { FounderApprovalCase, FounderAuditTrailEntry, FounderQuickSearchResult } from './founder-admin';

export type FounderWorkspaceSection =
  | 'dashboard'
  | 'ai-summary'
  | 'approval-centre'
  | 'properties'
  | 'users'
  | 'verification'
  | 'payments'
  | 'viewings'
  | 'reviews'
  | 'notifications'
  | 'reports'
  | 'platform-health'
  | 'settings'
  | 'audit-logs';

export interface FounderWorkspaceSummary {
  platformPerformance: string;
  verificationProgress: string;
  customerActivity: string;
  propertyGrowth: string;
  paymentPerformance: string;
  vacancyConfirmationCompliance: string;
  reviewTrends: string;
  securityObservations: string;
  operationalRecommendations: string[];
}

export interface FounderWorkspaceSnapshot {
  sections: readonly FounderWorkspaceSection[];
  aiSummary: FounderWorkspaceSummary;
  approvalCentre: FounderApprovalCase[];
  operationalSearchPrepared: true;
  auditLogs: FounderAuditTrailEntry[];
  quickSearchResults?: FounderQuickSearchResult[];
}

export const FOUNDER_MANAGEMENT_WORKSPACE = {
  purpose: 'Founder operational headquarters for monitoring, investigation, approval, and management.',
  reducesAdministrativeWorkload: true,
  navigationSections: [
    'dashboard',
    'ai-summary',
    'approval-centre',
    'properties',
    'users',
    'verification',
    'payments',
    'viewings',
    'reviews',
    'notifications',
    'reports',
    'platform-health',
    'settings',
    'audit-logs'
  ] as const,
  aiSummaryWorkspace: {
    highlightsMeaningfulInsightsOnly: true,
    avoidsRawDataOverload: true,
    includes: [
      'Platform performance',
      'Verification progress',
      'Customer activity',
      'Property growth',
      'Payment performance',
      'Vacancy confirmation compliance',
      'Review trends',
      'Security observations',
      'Operational recommendations'
    ] as const
  },
  approvalCentre: {
    onlyCasesRequiringFounderApproval: true,
    examples: [
      'Property verification recommendations',
      'Suspicious payment investigations',
      'Reported reviews requiring intervention',
      'Suspected fraudulent accounts',
      'Security incidents',
      'Exceptional customer disputes',
      'Manual override requests'
    ] as const,
    caseFields: ['Case summary', 'Timeline', 'Supporting evidence', 'AI recommendation', 'Confidence level', 'Recommended action'] as const,
    founderActions: ['Approve', 'Reject', 'Request further investigation'] as const
  },
  propertyManagement: ['Search properties', 'View property details', 'View verification history', 'View vacancy history', 'View viewing history', 'View review history', 'View registration history', 'Monitor property performance'] as const,
  userManagement: {
    manages: ['Customers', 'Property Owners', 'Property Managers', 'Leasing Agents'] as const,
    displays: ['Registration information', 'Verification status', 'Activity history', 'Property associations', 'Payment history', 'Support history', 'Security history'] as const,
    respectsEstablishedPlatformRules: true
  },
  verificationWorkspace: ['Pending verifications', 'AI verification recommendations', 'Verification history', 'Verification workload', 'Verification performance'] as const,
  paymentWorkspace: ['Successful payments', 'Failed payments', 'Payment recovery events', 'Transaction history', 'Revenue summaries', 'Payment anomalies detected by AI'] as const,
  customerSupportWorkspace: {
    aiResolvesRoutineWhenAppropriate: true,
    founderSeesOnlyComplexOrSensitiveCases: true,
    escalatedCaseFields: ['Customer request', 'AI actions already taken', 'Current status', 'Recommended next step'] as const
  },
  moderationWorkspace: ['Reported reviews', 'Suspicious content', 'Fraud investigations', 'Abuse reports'] as const,
  operationalSearch: ['Properties', 'Users', 'Payments', 'Reviews', 'Viewing requests', 'Notifications', 'Verification cases', 'AI recommendations'] as const,
  founderNotifications: ['Critical security events', 'Approval requests', 'Platform outages', 'Payment anomalies', 'Major operational issues', 'AI summaries'] as const,
  routineWorkRemainsWithAiOperationsOfficer: true,
  auditLogs: {
    records: ['Founder approvals', 'Founder rejections', 'Manual overrides', 'Security actions', 'AI recommendations', 'System changes'] as const,
    searchable: true,
    protectedFromModification: true
  },
  security: {
    highestLevelPlatformSecurity: true,
    founderExclusiveToolsOnlyForFounder: true,
    aiOperationsOfficerMustNotExceedAuthorityFromPrompt22A: true
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
    'Platform Health Monitor',
    'Audit Logs'
  ] as const
} as const;
