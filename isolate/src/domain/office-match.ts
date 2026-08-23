import type { ElectricityInformationInput } from './property-registration';
import type { OfficeNearbyPlaceId, OfficeRoadVisibilityId, OfficeTypeId, OfficeWaterAvailabilityId } from './office-registration';
import type { VerificationStatus } from './verification';
import type { VacancyFreshnessStatus } from './vacancy-confirmation-intelligence';

export interface OfficeMatchSearchCriteria {
  county?: string;
  townOrCity?: string;
  estateOrArea?: string;
  roadVisibility?: OfficeRoadVisibilityId[];
  maximumMonthlyRent?: number;
  maximumDeposit?: number;
  waterAvailability?: OfficeWaterAvailabilityId[];
  electricityRequired?: 'yes' | 'no' | 'any';
  nearbyPlaces?: OfficeNearbyPlaceId[];
}

export interface OfficeMatchPreparedResult {
  resultId: string;
  officeRegistrationId: string;
  propertyFoundationId: string;
  matchedUnitIdentifier: string;
  officeType: OfficeTypeId;
  location: {
    county: string;
    townOrCity: string;
    estateOrAreaOrNeighbourhood: string;
    landmark?: string;
  };
  roadVisibility: OfficeRoadVisibilityId;
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

export interface OfficeMatchResponseFoundation {
  criteria: OfficeMatchSearchCriteria;
  results: OfficeMatchPreparedResult[];
  limitedBatch: {
    prepared: true;
    limit: number;
    totalMatchesBeforeLimit: number;
    displayLogicImplementedInPrompt13B: true;
  };
  noExactMatchSupport: {
    prepared: true;
    detailedBehaviourImplementedInPrompt13B: true;
    presentSuitableAlternativesWhenAvailable: true;
  };
}

export const OFFICE_MATCH_ENGINE_FOUNDATION = {
  philosophy: ['Professional suitability', 'Accessibility', 'Visibility', 'Trust', 'Accurate vacancy information'] as const,
  intelligentlyRecommendOfficeSpaces: true,
  registrationUserExperienceStandardInherited: true,
  usesAlreadyCollectedRegistrationData: true,
  neverRequestsDuplicateInformationFromRegistrants: true,
  roadVisibilityMatching: {
    importantMatchFactor: true,
    options: [
      'facing-main-road',
      'along-main-road',
      'facing-inner-road',
      'along-inner-road',
      'inside-office-building',
      'inside-commercial-complex',
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
    displayLogicImplementedInPrompt13B: true
  },
  nextLayerOwns: [
    'Best Match Ranking',
    'Smart Rotation',
    'Why This Office Matches',
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
