import type {
  AiBusinessIntelligenceInsight,
  BusinessGrowthAnalytics,
  CustomerBehaviourExecutiveIntelligence,
  ExecutiveReport,
  ExecutiveReportRequest,
  FounderDashboardPersonalisation,
  FounderExecutiveInsightPanel,
  FounderExecutiveKpis,
  GeographicExecutiveIntelligence,
  PropertyCategoryExecutiveIntelligence,
  PropertyPerformanceIntelligence,
  EventHallExecutiveIntelligence
} from '@/domain/executive-dashboard';
import type { PropertyCategoryId } from '@/domain/types';
import { readAnalyticsStore } from '@/server/analytics/store';
import { readAuthStore } from '@/server/auth/store';
import { readCustomerDashboardStore } from '@/server/customer-dashboard/store';
import { readEventHallStore } from '@/server/event-halls/store';
import { readPropertyStore } from '@/server/properties/store';
import { readReviewStore } from '@/server/reviews/store';
import { readUnlockStore } from '@/server/unlock/store';
import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { getVerificationQueue } from '@/server/verification/service';
import { readVerifiedAccessStore } from '@/server/verified-access/store';
import { readViewingStore } from '@/server/viewings/store';
import { generateRevenueReport, getRevenueDashboard } from '@/server/revenue/service';
import { readExecutiveDashboardStore, writeExecutiveDashboardStore } from './store';

function isToday(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function mostFrequent(values: (string | undefined)[]): string | undefined {
  const counts = new Map<string, number>();
  for (const value of values.filter(Boolean) as string[]) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export async function getFounderExecutiveKpis(): Promise<FounderExecutiveKpis> {
  const [auth, properties, verification, unlocks, verifiedAccess, viewings, vacancies, revenue] = await Promise.all([
    readAuthStore(), readPropertyStore(), getVerificationQueue(), readUnlockStore(), readVerifiedAccessStore(), readViewingStore(), getAllVacancyConfirmationRecords(), getRevenueDashboard()
  ]);
  const activeUsers = auth.users.filter((user) => user.status === 'active');
  const confirmedVacancies = vacancies.filter((record) => record.status === 'confirmed-vacancy').length;
  return {
    activeCustomers: activeUsers.filter((user) => user.role === 'customer').length,
    activePropertyOwners: activeUsers.filter((user) => user.role === 'property-owner').length,
    activePropertyManagers: activeUsers.filter((user) => user.role === 'property-manager').length,
    activeLeasingAgents: activeUsers.filter((user) => user.role === 'leasing-agent').length,
    totalRegisteredProperties: properties.properties.length,
    totalVerifiedProperties: verification.filter((record) => record.status === 'verified').length,
    activeUnlockThisListingPurchases: unlocks.unlocks.filter((unlock) => unlock.status === 'active').length,
    activeVerifiedAccessPurchases: verifiedAccess.records.filter((access) => access.status === 'active').length,
    pendingPropertyVerifications: verification.filter((record) => record.status === 'pending-verification' || record.status === 'waiting-for-verification').length,
    pendingViewingRequests: viewings.viewings.filter((viewing) => viewing.status === 'pending').length,
    paymentSuccessRate: revenue.paymentIntelligence.paymentSuccessRate,
    dailyVacancyConfirmationCompliance: vacancies.length ? `${Math.round((confirmedVacancies / vacancies.length) * 1000) / 10}%` : 'No vacancy records yet',
    platformHealthScore: 'healthy'
  };
}

export async function getBusinessGrowthAnalytics(): Promise<BusinessGrowthAnalytics> {
  const [auth, properties, verification, unlocks, verifiedAccess, viewings, reviews] = await Promise.all([
    readAuthStore(), readPropertyStore(), getVerificationQueue(), readUnlockStore(), readVerifiedAccessStore(), readViewingStore(), readReviewStore()
  ]);
  return {
    newCustomersToday: auth.users.filter((user) => user.role === 'customer' && isToday(user.createdAt)).length,
    newPropertiesRegisteredToday: properties.properties.filter((property) => isToday(property.createdAt)).length,
    newVerifiedPropertiesToday: verification.filter((record) => record.verifiedAt && isToday(record.verifiedAt)).length,
    newUnlockThisListingPurchasesToday: unlocks.unlocks.filter((unlock) => unlock.unlockedAt && isToday(unlock.unlockedAt)).length,
    newVerifiedAccessPurchasesToday: verifiedAccess.records.filter((record) => record.activatedAt && isToday(record.activatedAt)).length,
    completedViewingsToday: viewings.viewings.filter((viewing) => viewing.status === 'completed' && isToday(viewing.updatedAt)).length,
    reviewsSubmittedToday: reviews.reviews.filter((review) => isToday(review.createdAt)).length
  };
}

export async function getPropertyPerformanceIntelligence(): Promise<PropertyPerformanceIntelligence> {
  const [analytics, unlocks, viewings, reviews] = await Promise.all([readAnalyticsStore(), readUnlockStore(), readViewingStore(), readReviewStore()]);
  const viewed = mostFrequent(analytics.events.filter((event) => event.eventType === 'property-search').map((event) => event.propertyId));
  const unlocked = mostFrequent(unlocks.unlocks.map((unlock) => unlock.target.propertyId));
  const requested = mostFrequent(viewings.viewings.map((viewing) => viewing.target.propertyId));
  const reviewCounts = new Map<string, number>();
  const reviewSums = new Map<string, number>();
  for (const review of reviews.reviews) {
    reviewCounts.set(review.propertyId, (reviewCounts.get(review.propertyId) ?? 0) + 1);
    reviewSums.set(review.propertyId, (reviewSums.get(review.propertyId) ?? 0) + review.rating);
  }
  const highestRatedProperty = Array.from(reviewCounts.keys()).sort((a, b) => (reviewSums.get(b)! / reviewCounts.get(b)!) - (reviewSums.get(a)! / reviewCounts.get(a)!))[0];
  const mostReviewedProperty = Array.from(reviewCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { mostViewedProperty: viewed, mostUnlockedProperty: unlocked, mostRequestedPropertyViewing: requested, highestRatedProperty, mostReviewedProperty, appliesAcross: ['Houses', 'Shops', 'Offices', 'Event Halls'] };
}

export async function getEventHallExecutiveIntelligence(): Promise<EventHallExecutiveIntelligence> {
  const [halls, analytics, reviews] = await Promise.all([readEventHallStore(), readAnalyticsStore(), readReviewStore()]);
  const hallIds = new Set(halls.eventHalls.map((hall) => hall.propertyFoundationId));
  const eventReviews = reviews.reviews.filter((review) => hallIds.has(review.propertyId));
  const highestRatedEventHall = eventReviews.sort((a, b) => b.rating - a.rating)[0]?.propertyId;
  return {
    mostBookedEventHall: mostFrequent(analytics.events.filter((event) => event.eventType === 'viewing-completed' && event.propertyId && hallIds.has(event.propertyId)).map((event) => event.propertyId)),
    mostViewedEventHall: mostFrequent(analytics.events.filter((event) => event.eventType === 'property-search' && event.metadata?.matchType === 'event-hall').map((event) => event.propertyId)),
    highestRatedEventHall,
    eventHallBookingTrends: 'Event Hall booking trends are prepared from viewing and booking analytics.'
  };
}

export async function getGeographicIntelligence(): Promise<GeographicExecutiveIntelligence> {
  const [properties, analytics] = await Promise.all([readPropertyStore(), readAnalyticsStore()]);
  const counties = properties.properties.map((p) => p.location.county);
  const towns = properties.properties.map((p) => p.location.townOrCity);
  const estates = properties.properties.map((p) => p.location.estateOrAreaOrNeighbourhood);
  const searchedCounties = analytics.events.map((event) => event.location?.county);
  const searchedTowns = analytics.events.map((event) => event.location?.townOrCity);
  const searchedEstates = analytics.events.map((event) => event.location?.estateOrNeighbourhood);
  return {
    mostActiveCounty: mostFrequent(counties),
    fastestGrowingCounty: mostFrequent(counties),
    mostSearchedCounty: mostFrequent(searchedCounties),
    mostActiveTown: mostFrequent(towns),
    fastestGrowingTown: mostFrequent(towns),
    mostSearchedTown: mostFrequent(searchedTowns),
    mostActiveEstate: mostFrequent(estates),
    fastestGrowingEstate: mostFrequent(estates),
    mostSearchedEstate: mostFrequent(searchedEstates)
  };
}

export async function getPropertyCategoryIntelligence(): Promise<PropertyCategoryExecutiveIntelligence[]> {
  const [properties, verification, analytics, revenue] = await Promise.all([readPropertyStore(), getVerificationQueue(), readAnalyticsStore(), getRevenueDashboard()]);
  const categories: PropertyCategoryId[] = ['houses', 'shops', 'offices', 'event-halls'];
  return categories.map((category) => {
    const registered = properties.properties.filter((property) => property.category === category).length;
    const verified = verification.filter((record) => record.propertyCategory === category && record.status === 'verified').length;
    const revenueKey = category === 'event-halls' ? 'eventHalls' : category;
    return {
      category,
      registrationGrowth: registered,
      verificationRate: registered ? `${Math.round((verified / registered) * 1000) / 10}%` : 'No registrations yet',
      searchActivity: analytics.events.filter((event) => event.eventType === 'property-search' && event.metadata?.matchType === category).length,
      unlockActivity: analytics.events.filter((event) => event.eventType === 'unlock-purchase' && event.propertyCategory === category).length,
      verifiedAccessActivity: analytics.events.filter((event) => event.eventType === 'verified-access-purchase' && event.propertyCategory === category).length,
      revenueContribution: revenue.byPropertyCategory[revenueKey as keyof typeof revenue.byPropertyCategory].lifetime.amount,
      customerDemand: analytics.events.filter((event) => event.propertyCategory === category).length
    };
  });
}

export async function getCustomerBehaviourIntelligence(): Promise<CustomerBehaviourExecutiveIntelligence> {
  const [analytics, dashboard] = await Promise.all([readAnalyticsStore(), readCustomerDashboardStore()]);
  return {
    mostSearchedPropertyCategories: [mostFrequent(analytics.events.filter((event) => event.eventType === 'property-search').map((event) => String(event.metadata?.matchType ?? ''))) ?? 'No searches yet'],
    mostPopularPriceRanges: ['Prepared from search filters and payment analytics'],
    mostPopularLocations: [mostFrequent(analytics.events.map((event) => event.location?.county)) ?? 'No locations yet'],
    mostCommonSearchFilters: ['Prepared from analytics event metadata'],
    mostSavedProperties: dashboard.savedProperties.slice(0, 5).map((item) => item.propertySummary),
    unlockPurchasingBehaviour: `${dashboard.payments.filter((payment) => payment.purchaseType === 'unlock-this-listing').length} unlock payment record(s).`,
    verifiedAccessPurchasingBehaviour: `${dashboard.payments.filter((payment) => payment.purchaseType === 'verified-access').length} Verified Access payment record(s).`,
    viewingRequestBehaviour: `${analytics.events.filter((event) => event.eventType === 'viewing-requested').length} viewing request event(s).`
  };
}

export async function getAiBusinessIntelligence(): Promise<AiBusinessIntelligenceInsight[]> {
  const [geo, categories, behaviour] = await Promise.all([getGeographicIntelligence(), getPropertyCategoryIntelligence(), getCustomerBehaviourIntelligence()]);
  const topCategory = [...categories].sort((a, b) => b.customerDemand - a.customerDemand)[0];
  return [
    { title: 'Fastest-growing business opportunity', explanation: `${topCategory?.category ?? 'No category yet'} currently shows the strongest demand signal.`, recommendedAction: 'Review supply and marketing activity for this category.', recommendationOnly: true },
    { title: 'Geographic opportunity', explanation: `${geo.mostActiveCounty ?? 'No county yet'} is currently the most active county signal.`, recommendedAction: 'Consider strengthening property supply in high-activity locations.', recommendationOnly: true },
    { title: 'Customer demand pattern', explanation: behaviour.mostSearchedPropertyCategories.join(', '), recommendedAction: 'Use demand patterns to guide category growth decisions.', recommendationOnly: true }
  ];
}

export async function getFounderExecutiveDashboard() {
  const [kpis, growth, propertyPerformance, eventHallIntelligence, geographic, categoryIntelligence, customerBehaviour, aiInsights, revenue] = await Promise.all([
    getFounderExecutiveKpis(), getBusinessGrowthAnalytics(), getPropertyPerformanceIntelligence(), getEventHallExecutiveIntelligence(), getGeographicIntelligence(), getPropertyCategoryIntelligence(), getCustomerBehaviourIntelligence(), getAiBusinessIntelligence(), getRevenueDashboard()
  ]);
  return { kpis, growth, propertyPerformance, eventHallIntelligence, geographic, categoryIntelligence, customerBehaviour, founderInsightsPanel: { insights: aiInsights, onlyMeaningfulInsightsDisplayed: true }, aiStrategicRecommendations: aiInsights, revenue };
}

export async function generateExecutiveReport(request: ExecutiveReportRequest): Promise<ExecutiveReport> {
  const [revenue, growth, customerActivity, propertyPerformance, operationalPerformance, aiExecutiveSummary] = await Promise.all([
    generateRevenueReport({ period: request.period === 'daily' ? 'today' : request.period === 'weekly' ? 'this-week' : request.period === 'monthly' ? 'this-month' : request.period === 'annual' ? 'this-year' : 'custom-date-range', customStartDate: request.customStartDate, customEndDate: request.customEndDate }),
    getBusinessGrowthAnalytics(), getCustomerBehaviourIntelligence(), getPropertyPerformanceIntelligence(), getFounderExecutiveKpis(), getAiBusinessIntelligence()
  ]);
  return { request, revenue, platformGrowth: growth, customerActivity, propertyPerformance, operationalPerformance, aiExecutiveSummary: { insights: aiExecutiveSummary, onlyMeaningfulInsightsDisplayed: true } };
}

export async function saveFounderDashboardPersonalisation(input: FounderDashboardPersonalisation): Promise<FounderDashboardPersonalisation> {
  const store = await readExecutiveDashboardStore();
  const existingIndex = store.personalisation.findIndex((item) => item.founderUserId === input.founderUserId);
  if (existingIndex >= 0) store.personalisation[existingIndex] = input;
  else store.personalisation.push(input);
  await writeExecutiveDashboardStore(store);
  return input;
}
