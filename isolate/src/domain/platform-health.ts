import type { PropertyCategoryId } from './types';

export type HealthComponentId =
  | 'server-health'
  | 'database-health'
  | 'payment-system-health'
  | 'match-engine-health'
  | 'search-performance'
  | 'property-verification-health'
  | 'daily-vacancy-confirmation-health'
  | 'notification-delivery-health'
  | 'ai-operations-health'
  | 'api-integration-health';

export type OpportunityStatus = 'open' | 'improving' | 'solved' | 'unresolved';
export type OpportunityPriority = 'critical-opportunity' | 'growing-opportunity' | 'emerging-opportunity';

export interface HealthScore {
  component: HealthComponentId | 'overall-platform-health';
  percentage: number;
  explanation: string;
}

export interface FounderHealthAlert {
  id: string;
  title: string;
  explanation: string;
  channels: readonly ['founder-dashboard', 'whatsapp'];
  critical: true;
  createdAt: string;
}

export interface SearchOpportunitySignal {
  propertyCategory: PropertyCategoryId;
  propertyType?: string;
  county?: string;
  town?: string;
  estateOrNeighbourhood?: string;
  priceRange?: string;
  searchFrequency: number;
  matchingPropertiesAvailable: number;
  verifiedPropertiesAvailable: number;
  failedSearchCount: number;
}

export interface BusinessOpportunity {
  id: string;
  locationLabel: string;
  propertyCategory: PropertyCategoryId;
  propertyType?: string;
  priceRange?: string;
  priority: OpportunityPriority;
  status: OpportunityStatus;
  customerDemandSummary: string;
  supplySummary: string;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
  history: BusinessOpportunityHistoryEntry[];
}

export interface BusinessOpportunityHistoryEntry {
  at: string;
  status: OpportunityStatus;
  note: string;
}

export interface HealthReportSummary {
  platformHealth: HealthScore;
  operationalHealth: HealthScore[];
  aiPerformance: string;
  paymentHealth: string;
  searchHealth: string;
  verificationHealth: string;
  notificationHealth: string;
  opportunityQueue: BusinessOpportunity[];
  opportunityProgress: string;
}

export const PLATFORM_HEALTH_MONITOR_FOUNDATION = {
  invisibleToCustomers: true,
  objective: 'Continuously evaluate platform health, operational performance, customer demand, unmet market opportunities, and AI self-healing.',
  philosophy: [
    'Keep the platform stable',
    'Detect operational issues early',
    'Recover from minor failures automatically',
    'Protect customer experience',
    'Support Founder decision-making'
  ] as const,
  overallHealthScore: true,
  individualHealthScores: [
    'Server Health',
    'Database Health',
    'Payment System Health',
    'Match Engine Health',
    'Search Performance',
    'Property Verification Health',
    'Daily Vacancy Confirmation Health',
    'Notification Delivery Health',
    'AI Operations Health',
    'API & Integration Health'
  ] as const,
  aiSelfHealing: [
    'Failed notification delivery',
    'Background job failures',
    'Temporary synchronisation problems',
    'Receipt regeneration',
    'Cache refresh',
    'Search indexing delays',
    'Temporary API interruptions',
    'Minor AI processing failures'
  ] as const,
  founderAlerts: {
    onlyGenuinelyImportantIssues: true,
    examples: ['Platform outage', 'Payment gateway failure', 'Security breach', 'Critical database failure', 'AI unable to recover an important service', 'Customer-impacting operational failures'] as const,
    channels: ['Founder Dashboard', 'WhatsApp'] as const,
    routineOperationalIssuesInterruptFounder: false
  },
  searchOpportunityIntelligence: {
    objectiveIsUnmetDemandNotPopularity: true,
    analyses: ['Property Category', 'Property Type', 'County', 'Town', 'Estate or Neighbourhood', 'Price Range', 'Search Frequency', 'Matching Properties Available', 'Verified Properties Available', 'Failed Search Count'] as const
  },
  opportunityRanking: {
    critical: 'High customer demand and very low supply',
    growing: 'Demand increasing faster than supply',
    emerging: 'Demand beginning to increase while supply remains limited'
  },
  aiBusinessIntelligence: ['Market demand', 'Property supply', 'Customer behaviour', 'Geographic trends', 'Vacancy trends', 'Registration growth', 'Verification trends', 'Platform performance'] as const,
  recommendationsNeverModifyFounderRules: true,
  healthReporting: ['Platform Health', 'Operational Health', 'AI Performance', 'Payment Health', 'Search Health', 'Verification Health', 'Notification Health', 'Opportunity Queue', 'Opportunity Progress'] as const,
  security: {
    neverExposeCustomerInformationUnnecessarily: true,
    founderAdministrationOnly: true,
    monitoringDataSecurelyProtected: true
  },
  integrations: ['AI Admin Assistant', 'Founder Dashboard', 'Platform Analytics', 'Revenue Intelligence', 'Authentication', 'Property Registration', 'Property Verification', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Unlock This Listing', 'Verified Access', 'Payment System', 'Viewing Workflow', 'Reviews & Ratings', 'Notifications'] as const
} as const;
