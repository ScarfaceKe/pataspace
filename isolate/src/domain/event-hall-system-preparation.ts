import type { EventHallRegistrationInput, HallCategoryId, HallNearbyPlaceDistanceInput } from './event-hall-registration';
import type { PropertyStatus } from './property-registration';

export type HallPreparedSystemId =
  | 'hall-match'
  | 'availability-verification'
  | 'search-priority'
  | 'smart-rotation'
  | 'match-results'
  | 'unlock-this-listing'
  | 'verified-access'
  | 'viewing-workflow'
  | 'property-reviews'
  | 'notifications'
  | 'ai-admin-assistant'
  | 'platform-health-monitor';

export type HallUnlockPricingKey = `event-hall-unlock:${HallCategoryId | 'uncategorised-hall'}`;
export type HallVerifiedAccessPricingKey = `event-hall-verified-access:${HallCategoryId | 'uncategorised-hall'}`;

export interface PreparedHallAvailabilityUnit {
  availabilityPreparationId: string;
  hallIdentifiers: string[];
  officialUnitReferenceSource: 'real-world-property-identifier';
  bookingPrice: number | null | undefined;
  numberOfHalls: number | null;
  hallCapacity: number | null | undefined;
  preparedForCustomerSearch: boolean;
  preparedForAvailabilityVerification: boolean;
  verificationStatus: 'waiting-for-future-availability-verification-workflow' | 'not-published-unavailable';
  searchVisibility: 'prepared-for-search-when-available-and-verified' | 'not-visible-until-availability-updated';
}

export interface HallMatchPreparation {
  prepared: true;
  duplicateInformationRequested: false;
  waterInformationExcluded: true;
  electricityInformationExcluded: true;
  matchableAttributes: {
    location: EventHallRegistrationInput['location'];
    roadVisibility: EventHallRegistrationInput['roadVisibility'];
    hallCategory: EventHallRegistrationInput['hallCategory'];
    hallCapacity: EventHallRegistrationInput['hallCapacity'];
    hallAvailability: EventHallRegistrationInput['isAvailableForBookings'];
    bookingPrice: EventHallRegistrationInput['bookingPrice'];
    nearbyPlaces: HallNearbyPlaceDistanceInput[];
    propertyPhotos: EventHallRegistrationInput['photos'];
    vacantUnitIdentification: string[];
    stageSetupAndSeatingCanBeDescribedInPropertyDescription: true;
  };
}

export interface HallAvailabilityPreparation {
  prepared: true;
  availableForBookingCandidates: boolean;
  hallUnits: PreparedHallAvailabilityUnit[];
  unavailableSearchSuppression: boolean;
  manualSetupRequired: false;
}

export interface HallAvailabilityVerificationPreparation {
  prepared: true;
  eligibleForAvailabilityVerification: true;
  mostRecentConfirmedBookingAvailabilityPrepared: true;
  manualSetupRequired: false;
}

export interface HallSearchPriorityPreparation {
  prepared: true;
  rankingPerformedNow: false;
  preparedRankingSignals: {
    availabilityStatus: 'prepared';
    freshnessOfAvailabilityConfirmations: 'prepared';
    otherFounderApprovedSearchPriorityRules: 'prepared';
  };
}

export interface HallSmartRotationPreparation {
  prepared: true;
  rotationPerformedNow: false;
  approvedBatchRotationPrepared: true;
  eligibleForFairHighQualityBatches: boolean;
}

export interface HallMatchResultPreparation {
  prepared: true;
  limitedSearchResultBatchesPrepared: true;
  individualUnlockThisListingPrepared: true;
  verifiedAccessRecommendationsPrepared: true;
  smartRotationPrepared: true;
  systemsImplementedNow: false;
}

export interface HallUnlockListingPreparation {
  prepared: true;
  manualPricingEntryAllowed: false;
  pricingKey: HallUnlockPricingKey;
  pricingSource: 'official-pataspace-event-hall-unlock-pricing-structure';
  hallCategory: HallCategoryId | 'uncategorised-hall';
  hallIdentifiers: string[];
}

export interface HallVerifiedAccessPreparation {
  prepared: true;
  pricingKey: HallVerifiedAccessPricingKey;
  pricingSource: 'official-pataspace-event-hall-verified-access-pricing-structure';
  recommendationLogicPrepared: true;
  fewMatchesMayRecommendUnlock: true;
  manyMatchesMayRecommendVerifiedAccess: true;
  recommendationExecutedNow: false;
}

export interface HallViewingWorkflowPreparation {
  prepared: true;
  eligibleForFutureViewingWorkflow: true;
  additionalRegistrationRequiredLater: false;
  approvedContactMethodsPrepared: readonly [
    'request-viewing-through-platform',
    'call-property-manager-or-contact-person',
    'whatsapp-property-manager-or-contact-person'
  ];
  customerFollowUpPrepared: readonly [
    'confirm-attended-viewing',
    'confirm-booked-hall',
    'stop-hall-match-notifications-after-finding-hall'
  ];
}

export interface HallReviewPreparation {
  prepared: true;
  eligibleForFuturePropertyReviews: true;
  reviewAvailableAfterEventHasTakenPlace: true;
  oneMonthDelayRuleApplies: false;
  reviewsImplementedNow: false;
}

export interface HallNotificationPreparation {
  prepared: true;
  notificationTopicsPrepared: readonly [
    'availability-confirmation-reminders',
    'viewing-workflow-notifications',
    'hall-status-updates',
    'verification-updates',
    'unlock-and-verified-access-notifications'
  ];
  notificationsSentNow: false;
}

export interface HallAiAdminAssistantPreparation {
  prepared: true;
  recognisedAsNewEventHall: true;
  invisibleAssistant: true;
  replacesPlatformAdministrator: false;
  futureAdministrativeAssistancePrepared: readonly [
    'availability-verification-support',
    'booking-availability-monitoring',
    'review-prioritisation',
    'platform-recommendations'
  ];
}

export interface HallPlatformHealthMonitorPreparation {
  prepared: true;
  availableForFutureMonitoring: true;
  monitoringMetricsPrepared: readonly [
    'availability-confirmation-activity',
    'search-demand',
    'areas-with-limited-event-hall-supply',
    'halls-awaiting-verification',
    'other-founder-approved-platform-recommendations'
  ];
  registrantActionRequiredNow: false;
}

export interface EventHallSystemPreparation {
  preparedSystemIds: readonly HallPreparedSystemId[];
  duplicateInformationRequested: false;
  hallMatch: HallMatchPreparation;
  availability: HallAvailabilityPreparation;
  availabilityVerification: HallAvailabilityVerificationPreparation;
  searchPriority: HallSearchPriorityPreparation;
  smartRotation: HallSmartRotationPreparation;
  matchResults: HallMatchResultPreparation;
  unlockThisListing: HallUnlockListingPreparation;
  verifiedAccess: HallVerifiedAccessPreparation;
  viewingWorkflow: HallViewingWorkflowPreparation;
  reviews: HallReviewPreparation;
  notifications: HallNotificationPreparation;
  aiAdminAssistant: HallAiAdminAssistantPreparation;
  platformHealthMonitor: HallPlatformHealthMonitorPreparation;
}

export const EVENT_HALL_PREPARED_SYSTEMS: readonly HallPreparedSystemId[] = [
  'hall-match',
  'availability-verification',
  'search-priority',
  'smart-rotation',
  'match-results',
  'unlock-this-listing',
  'verified-access',
  'viewing-workflow',
  'property-reviews',
  'notifications',
  'ai-admin-assistant',
  'platform-health-monitor'
] as const;

export function getHallUnlockPricingKey(hallCategory?: HallCategoryId): HallUnlockPricingKey {
  return `event-hall-unlock:${hallCategory ?? 'uncategorised-hall'}`;
}

export function getHallVerifiedAccessPricingKey(hallCategory?: HallCategoryId): HallVerifiedAccessPricingKey {
  return `event-hall-verified-access:${hallCategory ?? 'uncategorised-hall'}`;
}

export function prepareEventHallSystems(input: EventHallRegistrationInput, status: PropertyStatus): EventHallSystemPreparation {
  const isAvailable = input.isAvailableForBookings === 'yes';
  const hallIdentifiers = input.hallIdentifiers;
  const hallUnits: PreparedHallAvailabilityUnit[] = [{
    availabilityPreparationId: 'event-hall-availability-1',
    hallIdentifiers,
    officialUnitReferenceSource: 'real-world-property-identifier',
    bookingPrice: input.bookingPrice,
    numberOfHalls: input.numberOfHalls,
    hallCapacity: input.hallCapacity,
    preparedForCustomerSearch: isAvailable,
    preparedForAvailabilityVerification: true,
    verificationStatus: isAvailable ? 'waiting-for-future-availability-verification-workflow' : 'not-published-unavailable',
    searchVisibility: isAvailable ? 'prepared-for-search-when-available-and-verified' : 'not-visible-until-availability-updated'
  }];

  return {
    preparedSystemIds: EVENT_HALL_PREPARED_SYSTEMS,
    duplicateInformationRequested: false,
    hallMatch: {
      prepared: true,
      duplicateInformationRequested: false,
      waterInformationExcluded: true,
      electricityInformationExcluded: true,
      matchableAttributes: {
        location: input.location,
        roadVisibility: input.roadVisibility,
        hallCategory: input.hallCategory,
        hallCapacity: input.hallCapacity,
        hallAvailability: input.isAvailableForBookings,
        bookingPrice: input.bookingPrice,
        nearbyPlaces: input.nearbyPlaces,
        propertyPhotos: input.photos,
        vacantUnitIdentification: hallIdentifiers,
        stageSetupAndSeatingCanBeDescribedInPropertyDescription: true
      }
    },
    availability: {
      prepared: true,
      availableForBookingCandidates: isAvailable,
      hallUnits,
      unavailableSearchSuppression: !isAvailable,
      manualSetupRequired: false
    },
    availabilityVerification: {
      prepared: true,
      eligibleForAvailabilityVerification: true,
      mostRecentConfirmedBookingAvailabilityPrepared: true,
      manualSetupRequired: false
    },
    searchPriority: {
      prepared: true,
      rankingPerformedNow: false,
      preparedRankingSignals: {
        availabilityStatus: 'prepared',
        freshnessOfAvailabilityConfirmations: 'prepared',
        otherFounderApprovedSearchPriorityRules: 'prepared'
      }
    },
    smartRotation: {
      prepared: true,
      rotationPerformedNow: false,
      approvedBatchRotationPrepared: true,
      eligibleForFairHighQualityBatches: status !== 'draft'
    },
    matchResults: {
      prepared: true,
      limitedSearchResultBatchesPrepared: true,
      individualUnlockThisListingPrepared: true,
      verifiedAccessRecommendationsPrepared: true,
      smartRotationPrepared: true,
      systemsImplementedNow: false
    },
    unlockThisListing: {
      prepared: true,
      manualPricingEntryAllowed: false,
      pricingKey: getHallUnlockPricingKey(input.hallCategory),
      pricingSource: 'official-pataspace-event-hall-unlock-pricing-structure',
      hallCategory: input.hallCategory ?? 'uncategorised-hall',
      hallIdentifiers
    },
    verifiedAccess: {
      prepared: true,
      pricingKey: getHallVerifiedAccessPricingKey(input.hallCategory),
      pricingSource: 'official-pataspace-event-hall-verified-access-pricing-structure',
      recommendationLogicPrepared: true,
      fewMatchesMayRecommendUnlock: true,
      manyMatchesMayRecommendVerifiedAccess: true,
      recommendationExecutedNow: false
    },
    viewingWorkflow: {
      prepared: true,
      eligibleForFutureViewingWorkflow: true,
      additionalRegistrationRequiredLater: false,
      approvedContactMethodsPrepared: [
        'request-viewing-through-platform',
        'call-property-manager-or-contact-person',
        'whatsapp-property-manager-or-contact-person'
      ],
      customerFollowUpPrepared: [
        'confirm-attended-viewing',
        'confirm-booked-hall',
        'stop-hall-match-notifications-after-finding-hall'
      ]
    },
    reviews: {
      prepared: true,
      eligibleForFuturePropertyReviews: true,
      reviewAvailableAfterEventHasTakenPlace: true,
      oneMonthDelayRuleApplies: false,
      reviewsImplementedNow: false
    },
    notifications: {
      prepared: true,
      notificationTopicsPrepared: [
        'availability-confirmation-reminders',
        'viewing-workflow-notifications',
        'hall-status-updates',
        'verification-updates',
        'unlock-and-verified-access-notifications'
      ],
      notificationsSentNow: false
    },
    aiAdminAssistant: {
      prepared: true,
      recognisedAsNewEventHall: true,
      invisibleAssistant: true,
      replacesPlatformAdministrator: false,
      futureAdministrativeAssistancePrepared: [
        'availability-verification-support',
        'booking-availability-monitoring',
        'review-prioritisation',
        'platform-recommendations'
      ]
    },
    platformHealthMonitor: {
      prepared: true,
      availableForFutureMonitoring: true,
      monitoringMetricsPrepared: [
        'availability-confirmation-activity',
        'search-demand',
        'areas-with-limited-event-hall-supply',
        'halls-awaiting-verification',
        'other-founder-approved-platform-recommendations'
      ],
      registrantActionRequiredNow: false
    }
  };
}
