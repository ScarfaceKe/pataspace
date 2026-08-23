import type { PropertyCategoryId, UserRoleId } from './types';

export type AnalyticsEventGroup = 'customer' | 'property' | 'payment' | 'viewing' | 'review' | 'performance' | 'operational' | 'ai' | 'founder';
export type AnalyticsEventType =
  | 'account-registration' | 'login' | 'property-search' | 'saved-property' | 'unlock-purchase' | 'verified-access-purchase' | 'viewing-request' | 'review-submitted'
  | 'property-registration' | 'property-verification' | 'vacancy-publication' | 'vacancy-update' | 'vacancy-confirmation' | 'property-availability-change'
  | 'payment-initiated' | 'payment-completed' | 'payment-failed' | 'payment-recovery' | 'receipt-generation'
  | 'viewing-requested' | 'viewing-accepted' | 'viewing-rescheduled' | 'viewing-cancelled' | 'viewing-completed'
  | 'review-edited' | 'review-reported' | 'review-response-added'
  | 'platform-response-time' | 'search-performance' | 'match-engine-performance' | 'verification-performance' | 'payment-performance' | 'notification-delivery' | 'viewing-workflow-performance'
  | 'ai-recommendation' | 'founder-dashboard-view';

export interface AnalyticsLocationScope { county?: string; townOrCity?: string; estateOrNeighbourhood?: string }
export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  group: AnalyticsEventGroup;
  occurredAt: string;
  actorUserId?: string;
  actorRole?: UserRoleId;
  propertyId?: string;
  propertyCategory?: PropertyCategoryId;
  location?: AnalyticsLocationScope;
  durationMs?: number;
  value?: number;
  metadata?: Record<string, string | number | boolean | null>;
  privacy: { personalInformationRedactedByDefault: true; authorisedAdminUseOnly: boolean };
}

export interface AnalyticsSummary {
  totalEvents: number;
  propertyRegistrations: number;
  searches: number;
  unlockPurchases: number;
  verifiedAccessPurchases: number;
  viewingRequests: number;
  reviewsSubmitted: number;
  paymentsCompleted: number;
  paymentsFailed: number;
  averagePerformanceMs: number;
}

export const ANALYTICS_FOUNDATION = {
  centralizedAnalyticsEngine: true,
  operatesQuietlyInBackground: true,
  doesNotAffectCustomerExperience: true,
  collectsMeaningfulDataOnly: true,
  duplicateOrUnnecessaryAnalyticsNeverCollected: true,
  supportsFounderUnderstanding: ['Platform growth','Customer behaviour','Property performance','Revenue performance','Operational efficiency','Market trends'] as const,
  platformCoverage: ['Authentication','Property Registration','Property Verification','House Match','Shop Match','Office Match','Event Hall Match','Unlock This Listing','Verified Access','Payment System','Viewing Workflow','Reviews & Ratings','Notifications','Customer Dashboard','AI Admin Assistant','Founder Dashboard'] as const,
  eventTracking: {
    customerEvents: ['Account registration','Login','Property searches','Saved properties','Unlock purchases','Verified Access purchases','Viewing requests','Reviews submitted'] as const,
    propertyEvents: ['Property registration','Verification','Vacancy publication','Vacancy updates','Vacancy confirmations','Property availability changes'] as const,
    paymentEvents: ['Payment initiated','Payment completed','Payment failed','Payment recovery','Receipt generation'] as const,
    viewingEvents: ['Viewing requested','Viewing accepted','Viewing rescheduled','Viewing cancelled','Viewing completed'] as const,
    reviewEvents: ['Review submitted','Review edited','Review reported','Review response added'] as const
  },
  performanceMetrics: ['Platform response times','Search performance','Match Engine performance','Verification performance','Payment performance','Notification delivery','Viewing workflow performance'] as const,
  propertyAnalytics: ['Registration growth','Verification rates','Vacancy trends','Occupancy trends','Property availability','Property popularity'] as const,
  customerBehaviourAnalytics: ['Search frequency','Favourite property categories','Viewing request activity','Unlock purchasing behaviour','Verified Access usage','Review participation'] as const,
  geographicAnalytics: ['Counties','Towns','Estates','Neighbourhoods'] as const,
  operationalAnalytics: ['Verification workload','Daily Vacancy Confirmation compliance','Customer support workload','AI Operations workload','Payment reliability','Notification reliability'] as const,
  aiAnalyticsSupport: ['Trends','Operational bottlenecks','Unusual behaviour','Growth opportunities','Areas requiring Founder attention'] as const,
  dataQuality: { accurateDataCollection: true, duplicatePrevention: true, consistentReporting: true, reliableCalculations: true, secureStorage: true, neverCompromisePlatformPerformance: true },
  privacy: { respectsCustomerPrivacy: true, personalInformationNotExposedByDefault: true, authorisedAdministrativePurposeRequired: true, compliesWithPlatformSecurityPolicies: true }
} as const;
