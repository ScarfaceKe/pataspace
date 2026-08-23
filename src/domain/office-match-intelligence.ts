import { buildCustomerAccessControlPreparation, type CustomerAccessControlPreparation } from './customer-access-control';
import type { OfficeMatchPreparedResult, OfficeMatchSearchCriteria } from './office-match';
import { getOfficeUnlockPrice, resolveOfficePricingCategory } from './unlock';

export type OfficeMatchRankingSignal =
  | 'active-vacancy-confirmation'
  | 'verification-status'
  | 'freshness-of-vacancy-confirmation'
  | 'customer-preference-match-quality'
  | 'road-visibility'
  | 'previously-approved-search-priority-rules';

export interface WhyThisOfficeMatchesItem {
  id: string;
  label: string;
}

export interface OfficeMatchSummary {
  label: 'Summary';
  text: string;
  usesOnlyListingInformation: true;
  inventedOrAssumedInformationAllowed: false;
}

export interface OfficeMatchUnlockPreparation {
  available: true;
  pricingKey: string;
  price: { currency: 'KES'; amount: number };
  pricingSource: 'official-pataspace-office-unlock-pricing-structure';
  manualPriceEntryAllowed: false;
  expiryRulesInherited: true;
}

export interface OfficeMatchVerifiedAccessRecommendation {
  eligible: true;
  recommended: boolean;
  reason: 'one-or-two-suitable-offices-prioritize-unlock' | 'several-suitable-offices-recommend-verified-access';
  customerStillCanUnlockIndividualOffices: true;
  pricingKey: string;
  verifiedAccess72HourPrice: { currency: 'KES'; amount: number };
}

export interface OfficeMatchPropertyCard {
  result: OfficeMatchPreparedResult;
  rank: number;
  rankingSignals: readonly OfficeMatchRankingSignal[];
  whyThisOfficeMatches: WhyThisOfficeMatchesItem[];
  summary: OfficeMatchSummary;
  propertyCardPreparation: {
    twoCoverPhotosOnlyBeforeAccess: true;
    propertySummary: true;
    summary: true;
    whyThisOfficeMatches: true;
    unlockThisListing: true;
    verifiedAccess: true;
    requestViewingLockedUntilAccess: true;
    callPropertyManagerOrLeasingAgentLockedUntilAccess: true;
    whatsappPropertyManagerOrLeasingAgentLockedUntilAccess: true;
    additionalPhotosLockedUntilAccess: true;
  };
  customerAccessControl: CustomerAccessControlPreparation;
  unlockThisListing: OfficeMatchUnlockPreparation;
  verifiedAccess: OfficeMatchVerifiedAccessRecommendation;
}

export interface OfficeMatchIntelligenceResponse {
  criteria: OfficeMatchSearchCriteria;
  cards: OfficeMatchPropertyCard[];
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
    givesVisibilityToDifferentQualifiedOfficeListings: true;
    respectsSearchPriority: true;
    invisibleToCustomer: true;
    remainingQualifiedOfficesEligibleForFutureRotation: number;
  };
  noResultsBehaviour: {
    avoidsUnnecessaryNoResults: true;
    betterFewRelevantThanNone: true;
    exactMatchesFound: boolean;
  };
}

export const OFFICE_MATCH_INTELLIGENCE = {
  rankingSignals: [
    'active-vacancy-confirmation',
    'verification-status',
    'freshness-of-vacancy-confirmation',
    'customer-preference-match-quality',
    'road-visibility',
    'previously-approved-search-priority-rules'
  ] as const,
  limitedResultBatch: {
    approvedBatchSize: 20,
    neverOverwhelmCustomersWithLongLists: true
  },
  smartRotation: {
    maintainFairness: true,
    giveVisibilityToDifferentQualifiedOfficeListings: true,
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
    oneOrTwoSuitableOfficesPrioritizeUnlock: true,
    severalSuitableOfficesRecommendVerifiedAccess: true,
    customerAlwaysRetainsBothOptions: true
  }
} as const;

export function getOfficeMatchScore(result: OfficeMatchPreparedResult, criteria: OfficeMatchSearchCriteria): number {
  let score = 0;
  if (result.vacancyStatus === 'confirmed-vacancy') score += 40;
  if (result.vacancyStatus === 'grace-period') score += 25;
  if (result.verificationStatus === 'verified') score += 30;
  if (result.vacancyFreshnessStatus === 'recently-confirmed') score += 20;
  if (result.vacancyFreshnessStatus === 'within-24-hour-confirmation-period') score += 15;
  if (criteria.roadVisibility?.length && criteria.roadVisibility.includes(result.roadVisibility)) score += 20;
  if (criteria.county && result.location.county.toLowerCase().includes(criteria.county.toLowerCase())) score += 10;
  if (criteria.townOrCity && result.location.townOrCity.toLowerCase().includes(criteria.townOrCity.toLowerCase())) score += 10;
  if (criteria.estateOrArea && result.location.estateOrAreaOrNeighbourhood.toLowerCase().includes(criteria.estateOrArea.toLowerCase())) score += 10;
  if (criteria.maximumMonthlyRent && result.monthlyRent !== null && result.monthlyRent <= criteria.maximumMonthlyRent) score += 10;
  if (criteria.maximumDeposit && result.depositAmount !== null && result.depositAmount <= criteria.maximumDeposit) score += 5;
  return score;
}

export function buildWhyThisOfficeMatches(result: OfficeMatchPreparedResult, criteria: OfficeMatchSearchCriteria): WhyThisOfficeMatchesItem[] {
  const reasons: WhyThisOfficeMatchesItem[] = [];
  if (result.location.county || result.location.townOrCity || result.location.estateOrAreaOrNeighbourhood) reasons.push({ id: 'location', label: 'Matches your selected location.' });
  if (criteria.roadVisibility?.includes(result.roadVisibility)) reasons.push({ id: 'road-visibility', label: 'Matches your preferred road visibility.' });
  if (criteria.maximumMonthlyRent && result.monthlyRent !== null && result.monthlyRent <= criteria.maximumMonthlyRent) reasons.push({ id: 'rent', label: 'Matches your rent range.' });
  if (criteria.nearbyPlaces?.length) reasons.push({ id: 'nearby', label: 'Matches your preferred nearby places.' });
  if (criteria.waterAvailability?.length || criteria.electricityRequired !== 'any') reasons.push({ id: 'utilities', label: 'Matches your selected utility preferences.' });
  if (result.vacancyStatus === 'confirmed-vacancy') reasons.push({ id: 'active-vacancy', label: 'Has an actively confirmed vacancy.' });
  return reasons;
}

export function buildOfficeSummary(result: OfficeMatchPreparedResult): OfficeMatchSummary {
  const parts = [
    `${result.officeType.replaceAll('-', ' ')} in ${result.location.estateOrAreaOrNeighbourhood || result.location.townOrCity}`,
    result.roadVisibility.replaceAll('-', ' '),
    result.monthlyRent !== null ? `rent KSh ${result.monthlyRent}` : undefined,
    result.verificationStatus === 'verified' ? 'verified property' : undefined,
    result.vacancyFreshnessStatus.replaceAll('-', ' ')
  ].filter(Boolean);
  return {
    label: 'Summary',
    text: parts.join(' · '),
    usesOnlyListingInformation: true,
    inventedOrAssumedInformationAllowed: false
  };
}

export function buildOfficeUnlockPreparation(result: OfficeMatchPreparedResult): OfficeMatchUnlockPreparation {
  return {
    available: true,
    pricingKey: `office-unlock:${resolveOfficePricingCategory(result.officeType as never)}`,
    price: getOfficeUnlockPrice(resolveOfficePricingCategory(result.officeType as never), 'unlock-this-listing'),
    pricingSource: 'official-pataspace-office-unlock-pricing-structure',
    manualPriceEntryAllowed: false,
    expiryRulesInherited: true
  };
}

export function buildOfficeVerifiedAccessRecommendation(result: OfficeMatchPreparedResult, batchSize: number): OfficeMatchVerifiedAccessRecommendation {
  const recommended = batchSize > 2;
  return {
    eligible: true,
    recommended,
    reason: recommended ? 'several-suitable-offices-recommend-verified-access' : 'one-or-two-suitable-offices-prioritize-unlock',
    customerStillCanUnlockIndividualOffices: true,
    pricingKey: `office-verified-access:${resolveOfficePricingCategory(result.officeType as never)}`,
    verifiedAccess72HourPrice: getOfficeUnlockPrice(resolveOfficePricingCategory(result.officeType as never), 'verified-access')
  };
}

export { buildCustomerAccessControlPreparation };
