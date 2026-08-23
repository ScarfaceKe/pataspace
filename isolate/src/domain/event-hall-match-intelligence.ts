import { buildCustomerAccessControlPreparation, type CustomerAccessControlPreparation } from './customer-access-control';
import type { EventHallMatchPreparedResult, EventHallMatchSearchCriteria } from './event-hall-match';
import { getEventHallUnlockPrice, resolveEventHallPricingCategory } from './unlock';

export type EventHallMatchRankingSignal =
  | 'booking-availability'
  | 'verification-status'
  | 'freshness-of-availability-confirmation'
  | 'customer-preference-match-quality'
  | 'hall-capacity'
  | 'previously-approved-search-priority-rules';

export interface WhyThisHallMatchesItem {
  id: string;
  label: string;
}

export interface EventHallMatchSummary {
  label: 'Summary';
  text: string;
  usesOnlyListingInformation: true;
  inventedOrAssumedInformationAllowed: false;
}

export interface EventHallMatchUnlockPreparation {
  available: true;
  pricingKey: string;
  price: { currency: 'KES'; amount: number };
  pricingSource: 'official-pataspace-event-hall-unlock-pricing-structure';
  manualPriceEntryAllowed: false;
  expiryRulesInherited: true;
}

export interface EventHallMatchVerifiedAccessRecommendation {
  eligible: true;
  recommended: boolean;
  reason: 'one-or-two-suitable-halls-prioritize-unlock' | 'several-suitable-halls-recommend-verified-access';
  customerStillCanUnlockIndividualHalls: true;
  pricingKey: string;
  verifiedAccess72HourPrice: { currency: 'KES'; amount: number };
}

export interface EventHallMatchPropertyCard {
  result: EventHallMatchPreparedResult;
  rank: number;
  rankingSignals: readonly EventHallMatchRankingSignal[];
  whyThisHallMatches: WhyThisHallMatchesItem[];
  summary: EventHallMatchSummary;
  propertyCardPreparation: {
    twoCoverPhotosOnlyBeforeAccess: true;
    propertySummary: true;
    summary: true;
    whyThisHallMatches: true;
    unlockThisListing: true;
    verifiedAccess: true;
    requestViewingLockedUntilAccess: true;
    callPropertyManagerOrLeasingAgentLockedUntilAccess: true;
    whatsappPropertyManagerOrLeasingAgentLockedUntilAccess: true;
    additionalPhotosLockedUntilAccess: true;
  };
  customerAccessControl: CustomerAccessControlPreparation;
  unlockThisListing: EventHallMatchUnlockPreparation;
  verifiedAccess: EventHallMatchVerifiedAccessRecommendation;
  reviewPreparation: {
    availableAfterEventHasTakenPlace: true;
    oneMonthDelayRuleApplies: false;
    exclusiveToEventHalls: true;
  };
}

export interface EventHallMatchIntelligenceResponse {
  criteria: EventHallMatchSearchCriteria;
  cards: EventHallMatchPropertyCard[];
  limitedBatch: {
    applied: true;
    limit: number;
    totalQualifiedMatches: number;
    customerOverwhelmPrevented: true;
  };
  smartRotation: {
    prepared: true;
    applied: boolean;
    maintainsFairness: true;
    givesVisibilityToDifferentQualifiedHalls: true;
    respectsSearchPriority: true;
    invisibleToCustomer: true;
    remainingQualifiedHallsEligibleForFutureRotation: number;
  };
  noResultsBehaviour: {
    avoidsUnnecessaryNoResults: true;
    betterFewRelevantThanNone: true;
    exactMatchesFound: boolean;
  };
  exclusions: {
    waterInformationExcluded: true;
    electricityInformationExcluded: true;
    dailyVacancyConfirmationExcluded: true;
  };
}

export const EVENT_HALL_MATCH_INTELLIGENCE = {
  rankingSignals: [
    'booking-availability',
    'verification-status',
    'freshness-of-availability-confirmation',
    'customer-preference-match-quality',
    'hall-capacity',
    'previously-approved-search-priority-rules'
  ] as const,
  limitedResultBatch: {
    approvedBatchSize: 20,
    neverOverwhelmCustomersWithLongLists: true
  },
  smartRotation: {
    maintainFairness: true,
    giveVisibilityToDifferentQualifiedHalls: true,
    neverIgnoreSearchPriorityRules: true,
    customerShouldNotNotice: true
  },
  summaryRules: {
    label: 'Summary',
    clearlyLabelled: true,
    usesOnlyAvailableListingInformation: true,
    neverInventsOrAssumesInformation: true
  },
  customerAccessControl: {
    beforeAccessContactLocked: true,
    beforeAccessViewingLocked: true,
    beforeAccessAdditionalPhotosLocked: true,
    unlockOrVerifiedAccessRequired: true
  },
  verifiedAccessLogic: {
    oneOrTwoSuitableHallsPrioritizeUnlock: true,
    severalSuitableHallsRecommendVerifiedAccess: true,
    customerAlwaysRetainsBothOptions: true
  },
  reviewPreparation: {
    reviewInvitationAfterEventHasTakenPlace: true,
    oneMonthDelayRuleApplies: false,
    exclusiveToEventHalls: true
  },
  exclusions: {
    waterInformationExcluded: true,
    electricityInformationExcluded: true,
    dailyVacancyConfirmationExcluded: true
  }
} as const;

export function getEventHallMatchScore(result: EventHallMatchPreparedResult, criteria: EventHallMatchSearchCriteria): number {
  let score = 0;
  if (result.bookingAvailability === 'available-for-bookings') score += 40;
  if (result.verificationStatus === 'verified') score += 30;
  if (criteria.minimumCapacity && result.hallCapacity !== null && result.hallCapacity !== undefined && result.hallCapacity >= criteria.minimumCapacity) score += 25;
  if (criteria.hallCategory?.length && result.hallCategory && criteria.hallCategory.includes(result.hallCategory)) score += 15;
  if (criteria.roadVisibility?.length && criteria.roadVisibility.includes(result.roadVisibility)) score += 10;
  if (criteria.county && result.location.county.toLowerCase().includes(criteria.county.toLowerCase())) score += 10;
  if (criteria.townOrCity && result.location.townOrCity.toLowerCase().includes(criteria.townOrCity.toLowerCase())) score += 10;
  if (criteria.estateOrArea && result.location.estateOrAreaOrNeighbourhood.toLowerCase().includes(criteria.estateOrArea.toLowerCase())) score += 10;
  if (criteria.maximumBookingPrice && result.bookingPrice !== null && result.bookingPrice !== undefined && result.bookingPrice <= criteria.maximumBookingPrice) score += 10;
  return score;
}

export function buildWhyThisHallMatches(result: EventHallMatchPreparedResult, criteria: EventHallMatchSearchCriteria): WhyThisHallMatchesItem[] {
  const reasons: WhyThisHallMatchesItem[] = [];
  if (result.location.county || result.location.townOrCity || result.location.estateOrAreaOrNeighbourhood) reasons.push({ id: 'location', label: 'Matches your selected location.' });
  if (criteria.minimumCapacity && result.hallCapacity !== null && result.hallCapacity !== undefined && result.hallCapacity >= criteria.minimumCapacity) reasons.push({ id: 'capacity', label: 'Matches your preferred hall capacity.' });
  if (criteria.maximumBookingPrice && result.bookingPrice !== null && result.bookingPrice !== undefined && result.bookingPrice <= criteria.maximumBookingPrice) reasons.push({ id: 'budget', label: 'Matches your booking budget.' });
  if (criteria.nearbyPlaces?.length) reasons.push({ id: 'nearby', label: 'Matches your preferred nearby places.' });
  if (result.bookingAvailability === 'available-for-bookings') reasons.push({ id: 'availability', label: 'Available for your booking requirements.' });
  return reasons;
}

export function buildEventHallSummary(result: EventHallMatchPreparedResult): EventHallMatchSummary {
  const parts = [
    `${result.hallName} in ${result.location.estateOrAreaOrNeighbourhood || result.location.townOrCity}`,
    result.hallCapacity ? `capacity ${result.hallCapacity}` : undefined,
    result.bookingPrice !== null && result.bookingPrice !== undefined ? `booking price KSh ${result.bookingPrice}` : undefined,
    result.verificationStatus === 'verified' ? 'verified property' : undefined,
    result.bookingAvailability.replaceAll('-', ' ')
  ].filter(Boolean);
  return {
    label: 'Summary',
    text: parts.join(' · '),
    usesOnlyListingInformation: true,
    inventedOrAssumedInformationAllowed: false
  };
}

export function buildEventHallUnlockPreparation(result: EventHallMatchPreparedResult): EventHallMatchUnlockPreparation {
  return {
    available: true,
    pricingKey: `event-hall-unlock:${resolveEventHallPricingCategory({ hallCategory: result.hallCategory, hallCapacity: result.hallCapacity })}`,
    price: getEventHallUnlockPrice(resolveEventHallPricingCategory({ hallCategory: result.hallCategory, hallCapacity: result.hallCapacity }), 'unlock-this-listing'),
    pricingSource: 'official-pataspace-event-hall-unlock-pricing-structure',
    manualPriceEntryAllowed: false,
    expiryRulesInherited: true
  };
}

export function buildEventHallVerifiedAccessRecommendation(result: EventHallMatchPreparedResult, batchSize: number): EventHallMatchVerifiedAccessRecommendation {
  const recommended = batchSize > 2;
  return {
    eligible: true,
    recommended,
    reason: recommended ? 'several-suitable-halls-recommend-verified-access' : 'one-or-two-suitable-halls-prioritize-unlock',
    customerStillCanUnlockIndividualHalls: true,
    pricingKey: `event-hall-verified-access:${resolveEventHallPricingCategory({ hallCategory: result.hallCategory, hallCapacity: result.hallCapacity })}`,
    verifiedAccess72HourPrice: getEventHallUnlockPrice(resolveEventHallPricingCategory({ hallCategory: result.hallCategory, hallCapacity: result.hallCapacity }), 'verified-access')
  };
}

export { buildCustomerAccessControlPreparation };
