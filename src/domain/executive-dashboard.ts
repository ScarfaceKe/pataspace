import type { PropertyCategoryId } from './types';

export type ExecutiveReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom-date-range';

export interface FounderExecutiveKpis {
  activeCustomers: number;
  activePropertyOwners: number;
  activePropertyManagers: number;
  activeLeasingAgents: number;
  totalRegisteredProperties: number;
  totalVerifiedProperties: number;
  activeUnlockThisListingPurchases: number;
  activeVerifiedAccessPurchases: number;
  pendingPropertyVerifications: number;
  pendingViewingRequests: number;
  paymentSuccessRate: string;
  dailyVacancyConfirmationCompliance: string;
  platformHealthScore: string;
}

export interface BusinessGrowthAnalytics {
  newCustomersToday: number;
  newPropertiesRegisteredToday: number;
  newVerifiedPropertiesToday: number;
  newUnlockThisListingPurchasesToday: number;
  newVerifiedAccessPurchasesToday: number;
  completedViewingsToday: number;
  reviewsSubmittedToday: number;
}

export interface PropertyPerformanceIntelligence {
  mostViewedProperty?: string;
  mostUnlockedProperty?: string;
  mostRequestedPropertyViewing?: string;
  highestRatedProperty?: string;
  mostReviewedProperty?: string;
  appliesAcross: readonly ['Houses', 'Shops', 'Offices', 'Event Halls'];
}

export interface EventHallExecutiveIntelligence {
  mostBookedEventHall?: string;
  mostViewedEventHall?: string;
  highestRatedEventHall?: string;
  eventHallBookingTrends: string;
}

export interface GeographicExecutiveIntelligence {
  mostActiveCounty?: string;
  fastestGrowingCounty?: string;
  mostSearchedCounty?: string;
  mostActiveTown?: string;
  fastestGrowingTown?: string;
  mostSearchedTown?: string;
  mostActiveEstate?: string;
  fastestGrowingEstate?: string;
  mostSearchedEstate?: string;
}

export interface PropertyCategoryExecutiveIntelligence {
  category: PropertyCategoryId;
  registrationGrowth: number;
  verificationRate: string;
  searchActivity: number;
  unlockActivity: number;
  verifiedAccessActivity: number;
  revenueContribution: number;
  customerDemand: number;
}

export interface CustomerBehaviourExecutiveIntelligence {
  mostSearchedPropertyCategories: string[];
  mostPopularPriceRanges: string[];
  mostPopularLocations: string[];
  mostCommonSearchFilters: string[];
  mostSavedProperties: string[];
  unlockPurchasingBehaviour: string;
  verifiedAccessPurchasingBehaviour: string;
  viewingRequestBehaviour: string;
}

export interface AiBusinessIntelligenceInsight {
  title: string;
  explanation: string;
  recommendedAction: string;
  recommendationOnly: true;
}

export interface FounderExecutiveInsightPanel {
  insights: AiBusinessIntelligenceInsight[];
  onlyMeaningfulInsightsDisplayed: true;
}

export interface ExecutiveReportRequest {
  period: ExecutiveReportPeriod;
  customStartDate?: string;
  customEndDate?: string;
}

export interface ExecutiveReport {
  request: ExecutiveReportRequest;
  revenue: unknown;
  platformGrowth: BusinessGrowthAnalytics;
  customerActivity: CustomerBehaviourExecutiveIntelligence;
  propertyPerformance: PropertyPerformanceIntelligence;
  operationalPerformance: FounderExecutiveKpis;
  aiExecutiveSummary: FounderExecutiveInsightPanel;
}

export interface FounderDashboardPersonalisation {
  founderUserId: string;
  preferredKpiOrder: string[];
  favouriteDashboardWidgets: string[];
  defaultReportingPeriod: ExecutiveReportPeriod;
  preferredLandingDashboard: string;
  affectsOnlyFounderDashboard: true;
  altersBusinessLogic: false;
}

export const FOUNDER_EXECUTIVE_DASHBOARD = {
  purpose: 'Founder executive command centre for platform health, growth, performance, future direction, and strategic decision support.',
  onlyFounderMayAccess: true,
  aiRecommendationsOnly: true,
  founderRetainsFinalAuthority: true,
  executiveKpis: [
    'Active Customers',
    'Active Property Owners',
    'Active Property Managers',
    'Active Leasing Agents',
    'Total Registered Properties',
    'Total Verified Properties',
    'Active Unlock This Listing Purchases',
    'Active Verified Access Purchases',
    'Pending Property Verifications',
    'Pending Viewing Requests',
    'Payment Success Rate',
    'Daily Vacancy Confirmation Compliance',
    'Platform Health Score'
  ] as const,
  businessGrowthAnalytics: [
    'New Customers Today',
    'New Properties Registered Today',
    'New Verified Properties Today',
    'New Unlock This Listing Purchases Today',
    'New Verified Access Purchases Today',
    'Completed Viewings Today',
    'Reviews Submitted Today'
  ] as const,
  propertyPerformanceIntelligence: ['Most Viewed Property', 'Most Unlocked Property', 'Most Requested Property Viewing', 'Highest Rated Property', 'Most Reviewed Property'] as const,
  eventHallIntelligence: ['Most Booked Event Hall', 'Most Viewed Event Hall', 'Highest Rated Event Hall', 'Event Hall Booking Trends'] as const,
  geographicIntelligence: ['Most Active County', 'Fastest Growing County', 'Most Searched County', 'Most Active Town', 'Fastest Growing Town', 'Most Searched Town', 'Most Active Estate', 'Fastest Growing Estate', 'Most Searched Estate'] as const,
  propertyCategoryIntelligence: ['Registration Growth', 'Verification Rate', 'Search Activity', 'Unlock Activity', 'Verified Access Activity', 'Revenue Contribution', 'Customer Demand'] as const,
  customerBehaviourIntelligence: ['Most searched property categories', 'Most popular price ranges', 'Most popular locations', 'Most common search filters', 'Most saved properties', 'Unlock purchasing behaviour', 'Verified Access purchasing behaviour', 'Viewing request behaviour'] as const,
  aiBusinessIntelligence: ['Fastest-growing business opportunities', 'Slower-performing areas', 'Emerging customer trends', 'Seasonal demand', 'Geographic opportunities', 'Property supply gaps', 'Customer demand patterns'] as const,
  aiStrategicRecommendations: ['Counties needing additional property supply', 'Property categories experiencing high demand', 'Operational improvements', 'Revenue growth opportunities', 'Platform optimisation opportunities', 'Customer experience improvements'] as const,
  executiveReports: ['Daily Performance', 'Weekly Performance', 'Monthly Performance', 'Quarterly Performance', 'Annual Performance', 'Custom Date Range'] as const,
  dashboardPersonalisation: ['Preferred KPI order', 'Favourite dashboard widgets', 'Default reporting period', 'Preferred landing dashboard'] as const,
  personalisationAffectsOnlyFounderDashboard: true,
  personalisationAltersBusinessLogic: false,
  security: {
    executiveAnalyticsProtected: true,
    inaccessibleToOtherUsersUnlessFounderAuthorisesInFuture: true
  },
  integrations: ['Platform Analytics Foundation','Revenue Intelligence','AI Admin Assistant','Founder Dashboard','Authentication','Property Registration','Property Verification','House Match','Shop Match','Office Match','Event Hall Match','Unlock This Listing','Verified Access','Payment System','Viewing Workflow','Reviews & Ratings','Notifications','Platform Health Monitor'] as const
} as const;
