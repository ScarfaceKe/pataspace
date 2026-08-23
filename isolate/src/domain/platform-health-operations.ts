import type { HealthComponentId, BusinessOpportunity } from './platform-health';

export type PlatformServiceId =
  | 'authentication-service'
  | 'property-registration-service'
  | 'property-verification-service'
  | 'house-match-engine'
  | 'shop-match-engine'
  | 'office-match-engine'
  | 'event-hall-match-engine'
  | 'payment-service'
  | 'unlock-this-listing-service'
  | 'verified-access-service'
  | 'viewing-workflow'
  | 'reviews-ratings'
  | 'notification-service'
  | 'ai-admin-assistant'
  | 'platform-analytics'
  | 'revenue-intelligence';

export type ServiceStatus = 'operational' | 'degraded' | 'recovery-in-progress' | 'offline';
export type IncidentSeverity = 'minor-incident' | 'moderate-incident' | 'critical-incident';
export type IncidentStatus = 'detected' | 'recovering' | 'resolved' | 'founder-action-required';
export type RecoveryStatus = 'queued' | 'in-progress' | 'completed' | 'failed';

export interface ServiceHealthState {
  service: PlatformServiceId;
  currentStatus: ServiceStatus;
  healthPercentage: number;
  lastIncident?: string;
  currentRecoveryStatus?: RecoveryStatus;
}

export interface PlatformIncident {
  id: string;
  severity: IncidentSeverity;
  timeDetected: string;
  serviceAffected: PlatformServiceId;
  rootCause?: string;
  aiRecoveryActions: string[];
  currentStatus: IncidentStatus;
  finalResolution?: string;
  founderNotificationRequired: boolean;
}

export interface AiRecoveryActionRecord {
  id: string;
  incidentId?: string;
  service: PlatformServiceId;
  action:
    | 'notification-service-restarted'
    | 'failed-receipts-regenerated'
    | 'background-jobs-restarted'
    | 'search-index-refreshed'
    | 'payment-callback-queue-recovered'
    | 'temporary-api-connection-restored'
    | 'database-optimisation-completed'
    | 'routine-health-check-completed';
  status: RecoveryStatus;
  startedAt: string;
  completedAt?: string;
  founderInterventionRequired: boolean;
  aiConfidence: 'low' | 'medium' | 'high';
}

export interface RecoveryHistoryRecord {
  id: string;
  incident: PlatformIncident;
  recoveryActions: AiRecoveryActionRecord[];
  recoveryTimeMinutes?: number;
  resolutionStatus: IncidentStatus;
  aiConfidence: 'low' | 'medium' | 'high';
  founderInterventionRequired: boolean;
}

export interface ReliabilityAnalytics {
  systemUptime: string;
  recoverySuccessRate: string;
  averageRecoveryTime: string;
  incidentFrequency: number;
  serviceReliability: string;
  aiRecoveryEffectiveness: string;
  platformStabilityTrend: 'improving' | 'stable' | 'watch' | 'declining';
}

export interface FounderHealthTimelineEvent {
  id: string;
  occurredAt: string;
  eventType:
    | 'critical-incident'
    | 'successful-recovery'
    | 'platform-improvement'
    | 'major-verification-milestone'
    | 'payment-service-event'
    | 'significant-growth-event'
    | 'business-opportunity-milestone';
  title: string;
  summary: string;
}

export interface AiDiagnosticReport {
  id: string;
  generatedAt: string;
  slowPerformingServices: PlatformServiceId[];
  frequentlyFailingProcesses: string[];
  improvingServices: PlatformServiceId[];
  servicesRequiringOptimisation: PlatformServiceId[];
  operationalBottlenecks: string[];
  platformStabilityRecommendations: string[];
  nonTechnicalExplanation: string;
}

export interface OperationalTrendInsight {
  label: string;
  direction: 'improving' | 'stable' | 'watch';
  explanation: string;
}

export interface BusinessOpportunityProgressSummary {
  opportunitiesCreated: number;
  opportunitiesCurrentlyActive: number;
  opportunitiesSolved: number;
  opportunitiesImproving: number;
  opportunitiesRequiringFounderAttention: number;
  opportunities: BusinessOpportunity[];
}

export interface PlatformHealthOperationsSnapshot {
  overallPlatformHealthScore: number;
  individualHealthScores: { component: HealthComponentId | 'overall-platform-health'; percentage: number; explanation: string }[];
  currentPlatformStatus: 'operational' | 'degraded' | 'critical';
  activeAiRecoveryTasks: AiRecoveryActionRecord[];
  activeCriticalIncidents: PlatformIncident[];
  openBusinessOpportunities: BusinessOpportunity[];
  systemPerformanceSummary: ReliabilityAnalytics;
  aiOperationalSummary: string;
  serviceMonitoring: ServiceHealthState[];
  recoveryHistory: RecoveryHistoryRecord[];
  founderHealthTimeline: FounderHealthTimelineEvent[];
  aiDiagnosticReports: AiDiagnosticReport[];
  operationalTrends: OperationalTrendInsight[];
  businessOpportunityProgress: BusinessOpportunityProgressSummary;
}

export const PLATFORM_HEALTH_OPERATIONS_CENTRE = {
  invisibleToCustomers: true,
  objective: 'Continuously monitor, diagnose, recover, and improve platform health while giving the Founder visibility into reliability and operational excellence.',
  dashboardDisplays: [
    'Overall Platform Health Score',
    'Individual Health Scores',
    'Current Platform Status',
    'Active AI Recovery Tasks',
    'Active Critical Incidents',
    'Open Business Opportunities',
    'System Performance Summary',
    'AI Operational Summary'
  ] as const,
  liveServiceMonitoring: [
    'Authentication Service',
    'Property Registration Service',
    'Property Verification Service',
    'House Match Engine',
    'Shop Match Engine',
    'Office Match Engine',
    'Event Hall Match Engine',
    'Payment Service',
    'Unlock This Listing Service',
    'Verified Access Service',
    'Viewing Workflow',
    'Reviews & Ratings',
    'Notification Service',
    'AI Admin Assistant',
    'Platform Analytics',
    'Revenue Intelligence'
  ] as const,
  incidentSeverity: {
    minor: 'Routine operational issue recovered automatically',
    moderate: 'Requires monitoring while recovery is in progress',
    critical: 'Customer experience affected and immediate Founder notification required'
  },
  aiRecoveryCentreExamples: [
    'Notification service restarted',
    'Failed receipts regenerated',
    'Background jobs restarted',
    'Search index refreshed',
    'Payment callback queue recovered',
    'Temporary API connection restored',
    'Database optimisation completed'
  ] as const,
  reliabilityAnalytics: [
    'System uptime',
    'Recovery success rate',
    'Average recovery time',
    'Incident frequency',
    'Service reliability',
    'AI recovery effectiveness',
    'Platform stability trends'
  ] as const,
  founderHealthTimelineEvents: [
    'Critical incidents',
    'Successful recoveries',
    'Platform improvements',
    'Major verification milestones',
    'Payment service events',
    'Significant growth events',
    'Business Opportunity milestones'
  ] as const,
  aiDiagnosticReports: [
    'Slow-performing services',
    'Frequently failing processes',
    'Improving services',
    'Services requiring optimisation',
    'Operational bottlenecks',
    'Platform stability recommendations'
  ] as const,
  operationalTrends: [
    'Verification becoming faster',
    'Payment failures decreasing',
    'Notification reliability improving',
    'Search performance improving',
    'Match accuracy increasing',
    'Vacancy confirmations becoming more consistent'
  ] as const,
  founderNotifications: {
    onlySignificantOperationalIssues: true,
    routineRecoveriesRemainInvisible: true,
    criticalChannels: ['Founder Dashboard', 'WhatsApp'] as const,
    unnecessaryInterruptionsAvoided: true
  },
  continuousImprovement: {
    reduceFutureIncidents: true,
    shortenRecoveryTime: true,
    improveReliability: true,
    improveCustomerExperience: true,
    improveOperationalEfficiency: true,
    neverAlterFounderApprovedBusinessRules: true
  },
  security: {
    founderAdministrationOnly: true,
    recoveryLogsProtected: true,
    diagnosticsProtected: true,
    healthReportsProtected: true,
    incidentHistoryProtected: true,
    allOperationalActionsAuditable: true
  },
  integrations: [
    'Platform Health Monitor Foundation',
    'AI Admin Assistant',
    'Founder Dashboard',
    'Platform Analytics',
    'Revenue Intelligence',
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
    'Notifications'
  ] as const
} as const;
