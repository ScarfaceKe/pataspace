import { buildCustomerAccessControlPreparation, type CustomerAccessControlPreparation } from './customer-access-control';
import type { ShopMatchPreparedResult, ShopMatchSearchCriteria } from './shop-match';
import { getShopUnlockPrice } from './unlock';

export type ShopMatchRankingSignal =
  | 'active-vacancy-confirmation'
  | 'verification-status'
  | 'freshness-of-vacancy-confirmation'
  | 'customer-preference-match-quality'
  | 'business-suitability'
  | 'road-visibility'
  | 'previously-approved-search-priority-rules';

export interface WhyThisShopMatchesItem {
  id: string;
  label: string;
}

export interface ShopMatchAiSummary {
  label: 'AI Summary';
  text: string;
  usesOnlyListingInformation: true;
  inventedOrAssumedInformationAllowed: false;
}

export interface ShopMatchUnlockPreparation {
  available: true;
  pricingKey: string;
  price: { currency: 'KES'; amount: number };
  pricingSource: 'official-pataspace-shop-unlock-pricing-structure';
  manualPriceEntryAllowed: false;
  expiryRulesInherited: true;
}

export interface ShopMatchVerifiedAccessRecommendation {
  eligible: true;
  recommended: boolean;
  reason: 'one-or-two-suitable-shops-prioritize-unlock' | 'several-suitable-shops-recommend-verified-access';
  customerStillCanUnlockIndividualShops: true;
  pricingKey: string;
  verifiedAccess72HourPrice: { currency: 'KES'; amount: number };
}

export interface ShopMatchPropertyCard {
  result: ShopMatchPreparedResult;
  rank: number;
  rankingSignals: readonly ShopMatchRankingSignal[];
  whyThisShopMatches: WhyThisShopMatchesItem[];
  aiSummary: ShopMatchAiSummary;
  propertyCardPreparation: {
    twoCoverPhotosOnlyBeforeAccess: true;
    propertySummary: true;
    aiSummary: true;
    whyThisShopMatches: true;
    unlockThisListing: true;
    verifiedAccess: true;
    requestViewingLockedUntilAccess: true;
    callPropertyManagerOrLeasingAgentLockedUntilAccess: true;
    whatsappPropertyManagerOrLeasingAgentLockedUntilAccess: true;
  };
  customerAccessControl: CustomerAccessControlPreparation;
  unlockThisListing: ShopMatchUnlockPreparation;
  verifiedAccess: ShopMatchVerifiedAccessRecommendation;
}

export interface ShopMatchIntelligenceResponse {
  criteria: ShopMatchSearchCriteria;
  cards: ShopMatchPropertyCard[];
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
    givesVisibilityToDifferentQualifiedListings: true;
    respectsSearchPriority: true;
    invisibleToCustomer: true;
    remainingQualifiedShopsEligibleForFutureRotation: number;
  };
  noResultsBehaviour: {
    avoidsUnnecessaryNoResults: true;
    betterFewRelevantThanNone: true;
    exactMatchesFound: boolean;
  };
}

export const SHOP_MATCH_INTELLIGENCE = {
  rankingSignals: [
    'active-vacancy-confirmation',
    'verification-status',
    'freshness-of-vacancy-confirmation',
    'customer-preference-match-quality',
    'business-suitability',
    'road-visibility',
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
    neverInventsOrAssumesInformation: true
  },
  verifiedAccessLogic: {
    oneOrTwoSuitableShopsPrioritizeUnlock: true,
    severalSuitableShopsRecommendVerifiedAccess: true,
    customerAlwaysRetainsBothOptions: true
  },
  primaryCommercialMatchingFactors: ['Business Suitability', 'Road Visibility', 'Commercial Unit Type'] as const
} as const;

export function getShopMatchScore(result: ShopMatchPreparedResult, criteria: ShopMatchSearchCriteria): number {
  let score = 0;
  if (result.vacancyStatus === 'confirmed-vacancy') score += 40;
  if (result.vacancyStatus === 'grace-period') score += 25;
  if (result.verificationStatus === 'verified') score += 30;
  if (result.vacancyFreshnessStatus === 'recently-confirmed') score += 20;
  if (result.vacancyFreshnessStatus === 'within-24-hour-confirmation-period') score += 15;
  if (criteria.businessSuitability?.length) {
    const matched = criteria.businessSuitability.filter((item) => result.businessSuitability.includes(item)).length;
    score += matched * 15;
  }
  if (criteria.commercialUnitTypes?.length && criteria.commercialUnitTypes.includes(result.commercialUnitType)) score += 15;
  if (criteria.roadVisibility?.length && criteria.roadVisibility.includes(result.roadVisibility)) score += 20;
  if (criteria.county && result.location.county.toLowerCase().includes(criteria.county.toLowerCase())) score += 10;
  if (criteria.townOrCity && result.location.townOrCity.toLowerCase().includes(criteria.townOrCity.toLowerCase())) score += 10;
  if (criteria.estateOrArea && result.location.estateOrAreaOrNeighbourhood.toLowerCase().includes(criteria.estateOrArea.toLowerCase())) score += 10;
  if (criteria.maximumMonthlyRent && result.monthlyRent !== null && result.monthlyRent <= criteria.maximumMonthlyRent) score += 10;
  if (criteria.maximumDeposit && result.depositAmount !== null && result.depositAmount <= criteria.maximumDeposit) score += 5;
  return score;
}

export function buildWhyThisShopMatches(result: ShopMatchPreparedResult, criteria: ShopMatchSearchCriteria): WhyThisShopMatchesItem[] {
  const reasons: WhyThisShopMatchesItem[] = [];
  if (criteria.businessSuitability?.some((item) => result.businessSuitability.includes(item))) reasons.push({ id: 'business-type', label: 'Matches your selected business type.' });
  if (criteria.commercialUnitTypes?.includes(result.commercialUnitType)) reasons.push({ id: 'commercial-unit-type', label: 'Matches your selected commercial unit type.' });
  if (result.location.county || result.location.townOrCity || result.location.estateOrAreaOrNeighbourhood) reasons.push({ id: 'location', label: 'Matches your selected location.' });
  if (criteria.roadVisibility?.includes(result.roadVisibility)) reasons.push({ id: 'road-visibility', label: 'Matches your preferred road visibility.' });
  if (criteria.maximumMonthlyRent && result.monthlyRent !== null && result.monthlyRent <= criteria.maximumMonthlyRent) reasons.push({ id: 'rent', label: 'Matches your rent range.' });
  if (criteria.nearbyPlaces?.length) reasons.push({ id: 'nearby', label: 'Matches your preferred nearby facilities.' });
  if (criteria.waterAvailability?.length || criteria.electricityRequired !== 'any') reasons.push({ id: 'utilities', label: 'Matches your selected utility preferences.' });
  return reasons;
}

export function buildShopAiSummary(result: ShopMatchPreparedResult): ShopMatchAiSummary {
  const parts = [
    `${(result.customCommercialUnitType || result.commercialUnitType).replaceAll('-', ' ')} in ${result.location.estateOrAreaOrNeighbourhood || result.location.townOrCity}`,
    result.roadVisibility.replaceAll('-', ' '),
    result.monthlyRent !== null ? `rent KSh ${result.monthlyRent}` : undefined,
    result.verificationStatus === 'verified' ? 'verified property' : undefined,
    result.vacancyFreshnessStatus.replaceAll('-', ' ')
  ].filter(Boolean);
  return {
    label: 'AI Summary',
    text: parts.join(' · '),
    usesOnlyListingInformation: true,
    inventedOrAssumedInformationAllowed: false
  };
}

export function buildShopUnlockPreparation(result: ShopMatchPreparedResult): ShopMatchUnlockPreparation {
  return {
    available: true,
    pricingKey: `shop-unlock:${result.pricingCategory}`,
    price: getShopUnlockPrice(result.pricingCategory, 'unlock-this-listing'),
    pricingSource: 'official-pataspace-shop-unlock-pricing-structure',
    manualPriceEntryAllowed: false,
    expiryRulesInherited: true
  };
}

export function buildShopVerifiedAccessRecommendation(result: ShopMatchPreparedResult, batchSize: number): ShopMatchVerifiedAccessRecommendation {
  const recommended = batchSize > 2;
  return {
    eligible: true,
    recommended,
    reason: recommended ? 'several-suitable-shops-recommend-verified-access' : 'one-or-two-suitable-shops-prioritize-unlock',
    customerStillCanUnlockIndividualShops: true,
    pricingKey: `shop-verified-access:${result.pricingCategory}`,
    verifiedAccess72HourPrice: getShopUnlockPrice(result.pricingCategory, 'verified-access')
  };
}
