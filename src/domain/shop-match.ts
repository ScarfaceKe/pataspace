import type { ElectricityInformationInput } from './property-registration';
import type {
  BusinessSuitabilityId,
  CommercialUnitTypeId,
  RoadVisibilityId,
  ShopNearbyPlaceId,
  ShopPricingCategoryId,
  ShopTypeId,
  ShopWaterAvailabilityId
} from './shop-registration';
import type { VerificationStatus } from './verification';
import type { VacancyFreshnessStatus } from './vacancy-confirmation-intelligence';

export interface ShopMatchSearchCriteria {
  county?: string;
  townOrCity?: string;
  estateOrArea?: string;
  roadVisibility?: RoadVisibilityId[];
  maximumMonthlyRent?: number;
  maximumDeposit?: number;
  businessSuitability?: BusinessSuitabilityId[];
  commercialUnitTypes?: CommercialUnitTypeId[];
  waterAvailability?: ShopWaterAvailabilityId[];
  electricityRequired?: 'yes' | 'no' | 'any';
  nearbyPlaces?: ShopNearbyPlaceId[];
}

export interface ShopMatchPreparedResult {
  resultId: string;
  shopRegistrationId: string;
  propertyFoundationId: string;
  matchedUnitIdentifier: string;
  shopType: ShopTypeId[];
  commercialUnitType: CommercialUnitTypeId;
  customCommercialUnitType?: string;
  pricingCategory: ShopPricingCategoryId;
  location: {
    county: string;
    townOrCity: string;
    estateOrAreaOrNeighbourhood: string;
    landmark?: string;
  };
  roadVisibility: RoadVisibilityId;
  monthlyRent: number | null;
  depositAmount: number | null;
  businessSuitability: BusinessSuitabilityId[];
  waterInformation: unknown;
  electricityInformation: ElectricityInformationInput;
  nearbyPlaces: unknown[];
  vacancyStatus: string;
  vacancyFreshnessStatus: VacancyFreshnessStatus;
  verificationStatus: VerificationStatus | 'not-yet-created';
  preparedFor: {
    propertySummary: true;
    unlockThisListing: true;
    verifiedAccess: true;
    viewingWorkflow: true;
    reviews: true;
    notifications: true;
  };
}

export interface ShopMatchResponseFoundation {
  criteria: ShopMatchSearchCriteria;
  results: ShopMatchPreparedResult[];
  limitedBatch: {
    prepared: true;
    limit: number;
    totalMatchesBeforeLimit: number;
    displayLogicImplementedInPrompt12B: true;
  };
  noExactMatchSupport: {
    prepared: true;
    detailedBehaviourImplementedInPrompt12B: true;
    presentSuitableAlternativesWhenAvailable: true;
  };
}

export const SHOP_MATCH_ENGINE_FOUNDATION = {
  philosophy: ['Business suitability', 'Visibility', 'Accessibility', 'Trust', 'Accurate vacancy information'] as const,
  notSimplyFilteringShops: true,
  registrationUserExperienceStandardInherited: true,
  usesAlreadyCollectedRegistrationData: true,
  neverRequestsDuplicateInformationFromRegistrants: true,
  primaryCommercialFactors: ['Road Visibility', 'Business Suitability', 'Commercial Unit Type'] as const,
  commercialUnitTypeMatching: {
    usedForSearchFilteringMatchingAndDisplay: true,
    neverUsedForUnlockOrVerifiedAccessPricing: true
  },
  roadVisibilityMatching: {
    majorMatchFactor: true,
    options: [
      'facing-main-road',
      'along-main-road',
      'facing-inner-road',
      'along-inner-road',
      'inside-shopping-complex',
      'inside-building',
      'inside-estate'
    ] as const,
    matchSelectedPreferencesWheneverPossible: true
  },
  vacancyRules: {
    onlyActivePublishedVacanciesParticipate: true,
    respectsPropertyVerification: true,
    respectsDailyVacancyConfirmation: true,
    respectsWaitingForVerification: true,
    respectsOneWeekRemovalRule: true,
    manualFilteringRequired: false
  },
  limitedBatchPreparation: {
    prepared: true,
    approvedBatchSize: 20,
    displayLogicImplementedInPrompt12B: true
  },
  nextLayerOwns: [
    'Best Match ranking',
    'Smart Rotation',
    'Why This Shop Matches',
    'AI Summary clearly labelled as a summary',
    'Unlock recommendations',
    'Verified Access recommendations',
    'Previously approved pricing logic',
    'Search ranking behaviour',
    'Customer experience after results'
  ] as const
} as const;

export function textMatches(value: string | undefined, expected: string | undefined): boolean {
  if (!expected?.trim()) return true;
  return (value ?? '').trim().toLowerCase().includes(expected.trim().toLowerCase());
}
