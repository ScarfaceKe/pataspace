import { buildCustomerAccessControlPreparation, type CustomerAccessControlPreparation } from './customer-access-control';
import type { HouseMatchPreparedResult, HouseMatchSearchCriteria } from './house-match';
import { getResidentialUnlockPrice } from './unlock';

export type HouseMatchRankingSignal =
  | 'active-vacancy-confirmation'
  | 'verification-status'
  | 'freshness-of-vacancy-confirmation'
  | 'customer-preference-match-quality'
  | 'previously-approved-search-priority-rules';

export interface WhyThisHomeMatchesItem {
  id: string;
  label: string;
}

export interface HouseMatchAiSummary {
  label: 'AI Summary';
  text: string;
  usesOnlyListingInformation: true;
  inventedInformationAllowed: false;
}

export interface HouseMatchUnlockPreparation {
  available: true;
  pricingKey: string;
  price: { currency: 'KES'; amount: number };
  pricingSource: 'official-pataspace-residential-unlock-pricing-model';
  manualPriceEntryAllowed: false;
  expiryRulesInherited: true;
}

export interface HouseMatchVerifiedAccessRecommendation {
  eligible: true;
  recommended: boolean;
  reason: 'few-suitable-homes-emphasize-unlock' | 'several-suitable-homes-recommend-verified-access';
  customerStillCanUnlockIndividualListings: true;
  pricingKey: string;
  verifiedAccess72HourPrice: { currency: 'KES'; amount: number };
}

export interface HouseMatchPropertyCard {
  result: HouseMatchPreparedResult;
  rank: number;
  rankingSignals: readonly HouseMatchRankingSignal[];
  whyThisHomeMatches: WhyThisHomeMatchesItem[];
  aiSummary: HouseMatchAiSummary;
  propertyCardPreparation: {
    twoCoverPhotosOnlyBeforeAccess: true;
    propertySummary: true;
    aiSummary: true;
    whyThisHomeMatches: true;
    unlockThisListing: true;
    verifiedAccess: true;
    requestViewingLockedUntilAccess: true;
    callPropertyManagerLockedUntilAccess: true;
    whatsappPropertyManagerLockedUntilAccess: true;
  };
  customerAccessControl: CustomerAccessControlPreparation;
  unlockThisListing: HouseMatchUnlockPreparation;
  verifiedAccess: HouseMatchVerifiedAccessRecommendation;
}

export interface HouseMatchIntelligenceResponse {
  criteria: HouseMatchSearchCriteria;
  cards: HouseMatchPropertyCard[];
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
    respectsSearchPriority: true;
    invisibleToCustomer: true;
    remainingQualifiedPropertiesEligibleForFutureRotation: number;
  };
  noResultsBehaviour: {
    avoidsUnnecessaryNoResults: true;
    betterFewRelevantThanNone: true;
    exactMatchesFound: boolean;
  };
}

export const HOUSE_MATCH_INTELLIGENCE = {
  rankingSignals: [
    'active-vacancy-confirmation',
    'verification-status',
    'freshness-of-vacancy-confirmation',
    'customer-preference-match-quality',
    'previously-approved-search-priority-rules'
  ] as const,
  limitedResultBatch: {
    approvedBatchSize: 20,
    neverOverwhelmCustomersWithLongLists: true
  },
  smartRotation: {
    maintainFairness: true,
    giveVisibilityToDifferentQualifiedListings: true,
    neverIgnoreSearchPriorityRules: true,
    customerShouldNotNotice: true
  },
  aiSummaryRules: {
    label: 'AI Summary',
    clearlyLabelled: true,
    usesOnlyAvailableListingInformation: true,
    neverInventsInformation: true
  },
  verifiedAccessLogic: {
    oneOrTwoSuitableHomesEmphasizeUnlock: true,
    severalSuitableHomesRecommendVerifiedAccess: true,
    customerAlwaysRetainsBothOptions: true
  }
} as const;

export function getHouseMatchScore(result: HouseMatchPreparedResult, criteria: HouseMatchSearchCriteria): number {
  let score = 0;
  if (result.vacancyStatus === 'confirmed-vacancy') score += 40;
  if (result.vacancyStatus === 'grace-period') score += 25;
  if (result.verificationStatus === 'verified') score += 30;
  if (result.vacancyFreshnessStatus === 'recently-confirmed') score += 20;
  if (result.vacancyFreshnessStatus === 'within-24-hour-confirmation-period') score += 15;
  if (result.residentialCategory === criteria.residentialCategory) score += 20;
  if (criteria.county && result.location.county.toLowerCase().includes(criteria.county.toLowerCase())) score += 10;
  if (criteria.townOrCity && result.location.townOrCity.toLowerCase().includes(criteria.townOrCity.toLowerCase())) score += 10;
  if (criteria.estateOrNeighbourhood && result.location.estateOrAreaOrNeighbourhood.toLowerCase().includes(criteria.estateOrNeighbourhood.toLowerCase())) score += 10;
  if (criteria.maximumMonthlyRent && result.monthlyRent !== null && result.monthlyRent <= criteria.maximumMonthlyRent) score += 10;
  if (criteria.maximumDeposit && result.depositAmount !== null && result.depositAmount <= criteria.maximumDeposit) score += 5;
  return score;
}

export function buildWhyThisHomeMatches(result: HouseMatchPreparedResult, criteria: HouseMatchSearchCriteria): WhyThisHomeMatchesItem[] {
  const reasons: WhyThisHomeMatchesItem[] = [];
  if (result.location.county || result.location.townOrCity || result.location.estateOrAreaOrNeighbourhood) {
    reasons.push({ id: 'location', label: 'Matches your selected location.' });
  }
  if (result.residentialCategory === criteria.residentialCategory) reasons.push({ id: 'house-type', label: 'Matches your selected house type.' });
  if (criteria.maximumMonthlyRent && result.monthlyRent !== null && result.monthlyRent <= criteria.maximumMonthlyRent) reasons.push({ id: 'rent', label: 'Matches your rent range.' });
  if (criteria.nearbyPlaces?.length) reasons.push({ id: 'nearby', label: 'Matches your preferred nearby facilities.' });
  if (criteria.waterAvailability?.length || criteria.electricityRequired !== 'any') reasons.push({ id: 'utilities', label: 'Matches your selected utility preferences.' });
  return reasons;
}

export function buildHouseAiSummary(result: HouseMatchPreparedResult): HouseMatchAiSummary {
  const parts = [
    `${result.residentialCategory.replaceAll('-', ' ')} in ${result.location.estateOrAreaOrNeighbourhood || result.location.townOrCity}`,
    result.monthlyRent !== null ? `rent KSh ${result.monthlyRent}` : undefined,
    result.verificationStatus === 'verified' ? 'verified property' : undefined,
    result.vacancyFreshnessStatus.replaceAll('-', ' ')
  ].filter(Boolean);
  return {
    label: 'AI Summary',
    text: parts.join(' · '),
    usesOnlyListingInformation: true,
    inventedInformationAllowed: false
  };
}

export function buildUnlockPreparation(result: HouseMatchPreparedResult): HouseMatchUnlockPreparation {
  return {
    available: true,
    pricingKey: `residential-unlock:${result.residentialCategory}`,
    price: getResidentialUnlockPrice(result.residentialCategory, 'unlock-this-listing'),
    pricingSource: 'official-pataspace-residential-unlock-pricing-model',
    manualPriceEntryAllowed: false,
    expiryRulesInherited: true
  };
}

export function buildVerifiedAccessRecommendation(result: HouseMatchPreparedResult, batchSize: number): HouseMatchVerifiedAccessRecommendation {
  const recommended = batchSize > 2;
  return {
    eligible: true,
    recommended,
    reason: recommended ? 'several-suitable-homes-recommend-verified-access' : 'few-suitable-homes-emphasize-unlock',
    customerStillCanUnlockIndividualListings: true,
    pricingKey: `residential-verified-access:${result.residentialCategory}`,
    verifiedAccess72HourPrice: getResidentialUnlockPrice(result.residentialCategory, 'verified-access')
  };
}
