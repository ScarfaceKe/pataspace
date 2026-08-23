import type {
  HouseRegistrationInput,
  NearbyPlaceDistanceInput,
  ResidentialCategoryId,
  ResidentialVacancyInput,
  WaterInformationInput
} from './house-registration';
import type { PropertyStatus } from './property-registration';

export type ResidentialPreparedSystemId =
  | 'house-match'
  | 'vacancy-verification'
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

export type UnlockPricingKey = `residential-unlock:${ResidentialCategoryId}`;
export type VerifiedAccessPricingKey = `residential-verified-access:${ResidentialCategoryId}`;

export interface PreparedResidentialVacancyUnit {
  vacancyPreparationId: string;
  residentialCategory: ResidentialCategoryId;
  monthlyRent: number | null;
  depositAmount: number | null;
  quantityAvailable: number | null;
  unitIdentifiers: string[];
  officialUnitReferenceSource: 'real-world-property-identifier';
  preparedForDailyConfirmation: boolean;
  verificationStatus: 'waiting-for-future-verification-workflow' | 'not-published-no-vacancy';
  searchVisibility: 'prepared-for-search-when-verified' | 'not-visible-until-vacancy-published';
}

export interface HouseMatchPreparation {
  prepared: true;
  duplicateInformationRequested: false;
  matchableAttributes: {
    residentialCategory: ResidentialCategoryId;
    location: HouseRegistrationInput['location'];
    rent: HouseRegistrationInput['rent'];
    water: WaterInformationInput;
    electricity: HouseRegistrationInput['electricity'];
    nearbyPlaces: NearbyPlaceDistanceInput[];
    propertyInformation: Pick<HouseRegistrationInput, 'propertyName' | 'numberOfUnits' | 'numberOfFloors' | 'vacantUnitFloor'>;
  };
}

export interface VacancyWorkflowPreparation {
  prepared: true;
  hasPublishedVacancyCandidates: boolean;
  vacantUnits: PreparedResidentialVacancyUnit[];
  noVacancySearchSuppression: boolean;
  manualSetupRequired: false;
}

export interface SearchPriorityPreparation {
  prepared: true;
  rankingPerformedNow: false;
  preparedRankingSignals: {
    verifiedVacancyStatus: 'prepared';
    activeVacancyConfirmations: 'prepared';
    freshnessOfVacancyInformation: 'prepared';
    otherApprovedSearchPriorityRules: 'prepared';
  };
}

export interface SmartRotationPreparation {
  prepared: true;
  rotationPerformedNow: false;
  futureBatchThreshold: 20;
  eligibleForHighQualityBatches: boolean;
}

export interface MatchResultPreparation {
  prepared: true;
  resultBatchPrepared: true;
  unlockThisListingPrepared: true;
  verifiedAccessPrepared: true;
  smartRotationPrepared: true;
  systemsImplementedNow: false;
}

export interface UnlockListingPreparation {
  prepared: true;
  manualPricingEntryAllowed: false;
  pricingKey: UnlockPricingKey;
  pricingSource: 'official-pataspace-unlock-pricing-model';
  residentialCategory: ResidentialCategoryId;
}

export interface VerifiedAccessPreparation {
  prepared: true;
  pricingKey: VerifiedAccessPricingKey;
  pricingSource: 'official-pataspace-verified-access-pricing-model';
  recommendationRulesPrepared: true;
  recommendationExecutedNow: false;
}

export interface ViewingWorkflowPreparation {
  prepared: true;
  eligibleForFutureViewingWorkflow: true;
  additionalRegistrationRequiredLater: false;
  approvedViewingMethodsPrepared: true;
}

export interface ReviewPreparation {
  prepared: true;
  eligibleForFuturePropertyReviews: true;
  reviewsImplementedNow: false;
}

export interface NotificationPreparation {
  prepared: true;
  notificationTopicsPrepared: readonly [
    'vacancy-confirmation',
    'viewing-workflow',
    'property-status',
    'verification',
    'other-approved-notification-workflows'
  ];
  notificationsSentNow: false;
}

export interface AiAdminAssistantPreparation {
  prepared: true;
  recognisedAsNewResidentialProperty: true;
  invisibleToPropertyRegistrant: true;
  replacesPlatformAdmin: false;
  futureAdministrativeTasksPrepared: readonly [
    'location-review',
    'duplicate-candidate-review',
    'logical-consistency-review',
    'verification-readiness-review'
  ];
}

export interface PlatformHealthMonitorPreparation {
  prepared: true;
  availableForFutureMonitoring: true;
  monitoringSignalsPrepared: readonly [
    'vacancy-confirmation-activity',
    'verification-activity',
    'search-demand-analysis',
    'other-approved-platform-health-recommendations'
  ];
  ownerActionRequiredNow: false;
}

export interface ResidentialSystemPreparation {
  preparedSystemIds: readonly ResidentialPreparedSystemId[];
  duplicateInformationRequested: false;
  houseMatch: HouseMatchPreparation;
  vacancy: VacancyWorkflowPreparation;
  searchPriority: SearchPriorityPreparation;
  smartRotation: SmartRotationPreparation;
  matchResults: MatchResultPreparation;
  unlockThisListing: UnlockListingPreparation;
  verifiedAccess: VerifiedAccessPreparation;
  viewingWorkflow: ViewingWorkflowPreparation;
  reviews: ReviewPreparation;
  notifications: NotificationPreparation;
  aiAdminAssistant: AiAdminAssistantPreparation;
  platformHealthMonitor: PlatformHealthMonitorPreparation;
}

export const RESIDENTIAL_PREPARED_SYSTEMS: readonly ResidentialPreparedSystemId[] = [
  'house-match',
  'vacancy-verification',
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

export function getResidentialUnlockPricingKey(category: ResidentialCategoryId): UnlockPricingKey {
  return `residential-unlock:${category}`;
}

export function getResidentialVerifiedAccessPricingKey(category: ResidentialCategoryId): VerifiedAccessPricingKey {
  return `residential-verified-access:${category}`;
}

export function prepareResidentialSystems(input: HouseRegistrationInput, status: PropertyStatus): ResidentialSystemPreparation {
  const hasVacancies = input.hasVacantUnits === 'yes' && input.vacancies.length > 0;
  const vacantUnits = hasVacancies
    ? input.vacancies.map((vacancy: ResidentialVacancyInput, index) => ({
        vacancyPreparationId: `vacancy-${index + 1}`,
        residentialCategory: vacancy.residentialCategory,
        monthlyRent: vacancy.monthlyRent,
        depositAmount: vacancy.depositAmount,
        quantityAvailable: vacancy.quantityAvailable,
        unitIdentifiers: vacancy.unitIdentifiers,
        officialUnitReferenceSource: 'real-world-property-identifier' as const,
        preparedForDailyConfirmation: true,
        verificationStatus: 'waiting-for-future-verification-workflow' as const,
        searchVisibility: 'prepared-for-search-when-verified' as const
      }))
    : [];

  return {
    preparedSystemIds: RESIDENTIAL_PREPARED_SYSTEMS,
    duplicateInformationRequested: false,
    houseMatch: {
      prepared: true,
      duplicateInformationRequested: false,
      matchableAttributes: {
        residentialCategory: input.residentialCategory,
        location: input.location,
        rent: input.rent,
        water: input.water,
        electricity: input.electricity,
        nearbyPlaces: input.nearbyPlaces,
        propertyInformation: {
          propertyName: input.propertyName,
          numberOfUnits: input.numberOfUnits,
          numberOfFloors: input.numberOfFloors,
          vacantUnitFloor: input.vacantUnitFloor
        }
      }
    },
    vacancy: {
      prepared: true,
      hasPublishedVacancyCandidates: hasVacancies,
      vacantUnits,
      noVacancySearchSuppression: !hasVacancies,
      manualSetupRequired: false
    },
    searchPriority: {
      prepared: true,
      rankingPerformedNow: false,
      preparedRankingSignals: {
        verifiedVacancyStatus: 'prepared',
        activeVacancyConfirmations: 'prepared',
        freshnessOfVacancyInformation: 'prepared',
        otherApprovedSearchPriorityRules: 'prepared'
      }
    },
    smartRotation: {
      prepared: true,
      rotationPerformedNow: false,
      futureBatchThreshold: 20,
      eligibleForHighQualityBatches: status !== 'draft'
    },
    matchResults: {
      prepared: true,
      resultBatchPrepared: true,
      unlockThisListingPrepared: true,
      verifiedAccessPrepared: true,
      smartRotationPrepared: true,
      systemsImplementedNow: false
    },
    unlockThisListing: {
      prepared: true,
      manualPricingEntryAllowed: false,
      pricingKey: getResidentialUnlockPricingKey(input.residentialCategory),
      pricingSource: 'official-pataspace-unlock-pricing-model',
      residentialCategory: input.residentialCategory
    },
    verifiedAccess: {
      prepared: true,
      pricingKey: getResidentialVerifiedAccessPricingKey(input.residentialCategory),
      pricingSource: 'official-pataspace-verified-access-pricing-model',
      recommendationRulesPrepared: true,
      recommendationExecutedNow: false
    },
    viewingWorkflow: {
      prepared: true,
      eligibleForFutureViewingWorkflow: true,
      additionalRegistrationRequiredLater: false,
      approvedViewingMethodsPrepared: true
    },
    reviews: {
      prepared: true,
      eligibleForFuturePropertyReviews: true,
      reviewsImplementedNow: false
    },
    notifications: {
      prepared: true,
      notificationTopicsPrepared: [
        'vacancy-confirmation',
        'viewing-workflow',
        'property-status',
        'verification',
        'other-approved-notification-workflows'
      ],
      notificationsSentNow: false
    },
    aiAdminAssistant: {
      prepared: true,
      recognisedAsNewResidentialProperty: true,
      invisibleToPropertyRegistrant: true,
      replacesPlatformAdmin: false,
      futureAdministrativeTasksPrepared: [
        'location-review',
        'duplicate-candidate-review',
        'logical-consistency-review',
        'verification-readiness-review'
      ]
    },
    platformHealthMonitor: {
      prepared: true,
      availableForFutureMonitoring: true,
      monitoringSignalsPrepared: [
        'vacancy-confirmation-activity',
        'verification-activity',
        'search-demand-analysis',
        'other-approved-platform-health-recommendations'
      ],
      ownerActionRequiredNow: false
    }
  };
}
