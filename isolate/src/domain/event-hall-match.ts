import type { HallCategoryId, HallNearbyPlaceId, HallRoadVisibilityId } from './event-hall-registration';
import type { VerificationStatus } from './verification';

export interface EventHallMatchSearchCriteria {
  county?: string;
  townOrCity?: string;
  estateOrArea?: string;
  roadVisibility?: HallRoadVisibilityId[];
  hallCategory?: HallCategoryId[];
  minimumCapacity?: number;
  maximumBookingPrice?: number;
  nearbyPlaces?: HallNearbyPlaceId[];
  bookingAvailability?: 'available' | 'any';
  requestedDate?: string;
  requestedTime?: string;
}

export interface EventHallMatchPreparedResult {
  resultId: string;
  eventHallRegistrationId: string;
  propertyFoundationId: string;
  matchedHallIdentifiers: string[];
  hallName: string;
  hallCategory?: HallCategoryId;
  location: {
    county: string;
    townOrCity: string;
    estateOrAreaOrNeighbourhood: string;
    landmark?: string;
  };
  roadVisibility: HallRoadVisibilityId;
  hallCapacity?: number | null;
  bookingPrice?: number | null;
  nearbyPlaces: unknown[];
  bookingAvailability: 'available-for-bookings';
  timeStatus: 'open-and-available' | 'open-but-booked' | 'closed';
  isOpenAtRequestedTime: boolean;
  workingHours?: Array<{ day: string; isOpen: boolean; openTime: string; closeTime: string }>;
  verificationStatus: VerificationStatus | 'not-yet-created';
  waterInformationExcluded: true;
  electricityInformationExcluded: true;
  dailyVacancyConfirmationExcluded: true;
  preparedFor: {
    propertySummary: true;
    unlockThisListing: true;
    verifiedAccess: true;
    viewingWorkflow: true;
    reviews: true;
    notifications: true;
  };
}

export interface EventHallMatchResponseFoundation {
  criteria: EventHallMatchSearchCriteria;
  results: EventHallMatchPreparedResult[];
  limitedBatch: {
    prepared: true;
    limit: number;
    totalMatchesBeforeLimit: number;
    displayLogicImplementedInPrompt14B: true;
  };
  noExactMatchSupport: {
    prepared: true;
    detailedBehaviourImplementedInPrompt14B: true;
    presentSuitableAlternativesWhenAvailable: true;
  };
}

export const EVENT_HALL_MATCH_ENGINE_FOUNDATION = {
  philosophy: ['Event suitability', 'Hall capacity', 'Accessibility', 'Location', 'Accurate booking availability', 'Trust'] as const,
  intelligentlyRecommendEventHalls: true,
  registrationUserExperienceStandardInherited: true,
  usesAlreadyCollectedRegistrationData: true,
  neverRequestsDuplicateInformationFromRegistrants: true,
  waterInformationExcluded: true,
  electricityInformationExcluded: true,
  dailyVacancyConfirmationExcluded: true,
  availabilityRules: {
    onlyAvailableForBookingsParticipate: true,
    respectsPropertyVerification: true,
    respectsHallAvailability: true,
    respectsBookingAvailabilityUpdates: true,
    dailyVacancyConfirmationDoesNotApply: true,
    manualFilteringRequired: false
  },
  criteria: [
    'County',
    'Town / City',
    'Estate / Area',
    'Road Visibility',
    'Hall Capacity',
    'Booking Price',
    'Nearby Places',
    'Booking Availability',
    'Verification Status'
  ] as const,
  limitedBatchPreparation: {
    prepared: true,
    approvedBatchSize: 20,
    displayLogicImplementedInPrompt14B: true
  },
  nextLayerOwns: [
    'Best Match Ranking',
    'Smart Rotation',
    'Why This Hall Matches',
    'Clearly labelled Summary',
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
