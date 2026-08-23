import type { ElectricityInformationInput } from './property-registration';
import type { NearbyPlaceId, ResidentialCategoryId, WaterAvailabilityId } from './house-registration';
import type { VerificationStatus } from './verification';
import type { VacancyFreshnessStatus } from './vacancy-confirmation-intelligence';

export interface HouseMatchSearchCriteria {
  residentialCategory: ResidentialCategoryId;
  county?: string;
  townOrCity?: string;
  estateOrNeighbourhood?: string;
  maximumMonthlyRent?: number;
  maximumDeposit?: number;
  waterAvailability?: WaterAvailabilityId[];
  electricityRequired?: 'yes' | 'no' | 'any';
  nearbyPlaces?: NearbyPlaceId[];
}

export interface HouseMatchPreparedResult {
  resultId: string;
  houseRegistrationId: string;
  propertyFoundationId: string;
  matchedUnitIdentifier: string;
  residentialCategory: ResidentialCategoryId;
  isMixedResidentialMatch: boolean;
  location: {
    county: string;
    townOrCity: string;
    estateOrAreaOrNeighbourhood: string;
    landmark?: string;
  };
  monthlyRent: number | null;
  depositAmount: number | null;
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

export interface HouseMatchResponseFoundation {
  criteria: HouseMatchSearchCriteria;
  results: HouseMatchPreparedResult[];
  limitedBatch: {
    prepared: true;
    limit: number;
    totalMatchesBeforeLimit: number;
    displayLogicImplementedInPrompt11B: true;
  };
  noExactMatchSupport: {
    prepared: true;
    detailedBehaviourImplementedInPrompt11B: true;
    avoidEmptyExperienceWhenSuitableAlternativesExist: true;
  };
}

export const HOUSE_MATCH_ENGINE_FOUNDATION = {
  supportedResidentialCategories: [
    'single-room',
    'bedsitter',
    'one-bedroom',
    'two-bedroom',
    'three-bedroom',
    'four-bedroom',
    'five-bedroom',
    'mixed-residential-property'
  ] as const,
  philosophy: ['Relevance', 'Trust', 'Simplicity', 'Not simply filtering listings'] as const,
  registrationUserExperienceStandardInherited: true,
  usesAlreadyCollectedRegistrationData: true,
  neverRequestsDuplicateInformationFromRegistrants: true,
  vacancyRules: {
    onlyActivePublishedVacanciesParticipate: true,
    respectsPropertyVerification: true,
    respectsDailyVacancyConfirmation: true,
    respectsWaitingForVerificationRules: true,
    respectsOneWeekRemovalRule: true,
    manualFilteringRequired: false
  },
  mixedResidentialHandling:
    'When a requested residential category exists inside a Mixed Residential Property, only the matching unit type is returned.',
  limitedBatchPreparation: {
    prepared: true,
    approvedBatchSize: 20,
    displayLogicImplementedInPrompt11B: true
  },
  nextLayerOwns: [
    'Best 20 matching algorithm',
    'Smart Rotation',
    'Why This Home Matches',
    'AI Summary clearly labelled as a summary',
    'Unlock recommendations',
    'Verified Access recommendations',
    'Search ranking behaviour',
    'Customer experience after results'
  ] as const
} as const;

export function textMatches(value: string | undefined, expected: string | undefined): boolean {
  if (!expected?.trim()) return true;
  return (value ?? '').trim().toLowerCase().includes(expected.trim().toLowerCase());
}
