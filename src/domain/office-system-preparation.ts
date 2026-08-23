import type {
  OfficeNearbyPlaceDistanceInput,
  OfficeRegistrationInput,
  OfficeTypeId,
  OfficeVacancyInput,
  OfficeWaterInformationInput
} from './office-registration';
import type { PropertyStatus } from './property-registration';

export type OfficePreparedSystemId =
  | 'office-match'
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

export type OfficeUnlockPricingKey = `office-unlock:${OfficeTypeId}`;
export type OfficeVerifiedAccessPricingKey = `office-verified-access:${OfficeTypeId}`;

export interface PreparedOfficeVacancyUnit {
  vacancyPreparationId: string;
  unitIdentifiers: string[];
  officialUnitReferenceSource: 'real-world-property-identifier';
  monthlyRent: number | null;
  depositAmount: number | null;
  quantityAvailable: number | null;
  preparedForPublication: boolean;
  preparedForDailyConfirmation: boolean;
  verificationStatus: 'waiting-for-future-verification-workflow' | 'not-published-no-vacancy';
  searchVisibility: 'prepared-for-search-when-verified' | 'not-visible-until-vacancy-published';
}

export interface OfficeMatchPreparation {
  prepared: true;
  duplicateInformationRequested: false;
  matchableAttributes: {
    officeType: OfficeTypeId;
    location: OfficeRegistrationInput['location'];
    roadVisibility: OfficeRegistrationInput['roadVisibility'];
    water: OfficeWaterInformationInput;
    electricity: OfficeRegistrationInput['electricity'];
    nearbyPlaces: OfficeNearbyPlaceDistanceInput[];
    vacancyInformation: OfficeVacancyInput | undefined;
    vacantUnitIdentification: string[];
  };
}

export interface OfficeVacancyWorkflowPreparation {
  prepared: true;
  hasPublishedVacancyCandidates: boolean;
  vacantUnits: PreparedOfficeVacancyUnit[];
  noVacancySearchSuppression: boolean;
  manualSetupRequired: false;
}

export interface OfficeSearchPriorityPreparation {
  prepared: true;
  rankingPerformedNow: false;
  preparedRankingSignals: {
    verifiedVacancyStatus: 'prepared';
    activeVacancyConfirmations: 'prepared';
    freshnessOfVacancyInformation: 'prepared';
    otherFounderApprovedSearchPriorityRules: 'prepared';
  };
}

export interface OfficeSmartRotationPreparation {
  prepared: true;
  rotationPerformedNow: false;
  approvedBatchRotationPrepared: true;
  eligibleForFairHighQualityBatches: boolean;
}

export interface OfficeMatchResultPreparation {
  prepared: true;
  limitedSearchResultBatchesPrepared: true;
  individualUnlockThisListingPrepared: true;
  verifiedAccessRecommendationsPrepared: true;
  smartRotationPrepared: true;
  systemsImplementedNow: false;
}

export interface OfficeUnlockListingPreparation {
  prepared: true;
  manualPricingEntryAllowed: false;
  pricingKey: OfficeUnlockPricingKey;
  pricingSource: 'official-pataspace-office-unlock-pricing-structure';
  officeType: OfficeTypeId;
  unitIdentifiers: string[];
}

export interface OfficeVerifiedAccessPreparation {
  prepared: true;
  pricingKey: OfficeVerifiedAccessPricingKey;
  pricingSource: 'official-pataspace-office-verified-access-pricing-structure';
  recommendationLogicPrepared: true;
  fewMatchesMayRecommendUnlock: true;
  manyMatchesMayRecommendVerifiedAccess: true;
  recommendationExecutedNow: false;
}

export interface OfficeViewingWorkflowPreparation {
  prepared: true;
  eligibleForFutureViewingWorkflow: true;
  additionalRegistrationRequiredLater: false;
  approvedContactMethodsPrepared: readonly [
    'request-viewing-through-platform',
    'call-property-manager-or-contact-person',
    'whatsapp-property-manager-or-contact-person'
  ];
  tenantFollowUpPrepared: readonly [
    'confirm-attended-viewing',
    'confirm-found-office',
    'stop-office-match-notifications'
  ];
}

export interface OfficeReviewPreparation {
  prepared: true;
  eligibleForFuturePropertyReviews: true;
  tenantSuccessfulRentalReviewPrepared: true;
  reviewsImplementedNow: false;
}

export interface OfficeNotificationPreparation {
  prepared: true;
  notificationTopicsPrepared: readonly [
    'vacancy-confirmation-reminders',
    'viewing-workflow-notifications',
    'property-status-updates',
    'verification-updates',
    'unlock-and-verified-access-notifications'
  ];
  notificationsSentNow: false;
}

export interface OfficeAiAdminAssistantPreparation {
  prepared: true;
  recognisedAsNewOffice: true;
  invisibleAssistant: true;
  replacesPlatformAdministrator: false;
  futureAdministrativeAssistancePrepared: readonly [
    'verification-support',
    'vacancy-monitoring',
    'review-prioritisation',
    'platform-recommendations'
  ];
}

export interface OfficePlatformHealthMonitorPreparation {
  prepared: true;
  availableForFutureMonitoring: true;
  monitoringMetricsPrepared: readonly [
    'vacancy-confirmation-activity',
    'search-demand',
    'areas-with-limited-office-supply',
    'properties-awaiting-verification',
    'other-founder-approved-platform-recommendations'
  ];
  registrantActionRequiredNow: false;
}

export interface OfficeSystemPreparation {
  preparedSystemIds: readonly OfficePreparedSystemId[];
  duplicateInformationRequested: false;
  officeMatch: OfficeMatchPreparation;
  vacancy: OfficeVacancyWorkflowPreparation;
  searchPriority: OfficeSearchPriorityPreparation;
  smartRotation: OfficeSmartRotationPreparation;
  matchResults: OfficeMatchResultPreparation;
  unlockThisListing: OfficeUnlockListingPreparation;
  verifiedAccess: OfficeVerifiedAccessPreparation;
  viewingWorkflow: OfficeViewingWorkflowPreparation;
  reviews: OfficeReviewPreparation;
  notifications: OfficeNotificationPreparation;
  aiAdminAssistant: OfficeAiAdminAssistantPreparation;
  platformHealthMonitor: OfficePlatformHealthMonitorPreparation;
}

export const OFFICE_PREPARED_SYSTEMS: readonly OfficePreparedSystemId[] = [
  'office-match',
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

export function getOfficeUnlockPricingKey(officeType: OfficeTypeId): OfficeUnlockPricingKey {
  return `office-unlock:${officeType}`;
}

export function getOfficeVerifiedAccessPricingKey(officeType: OfficeTypeId): OfficeVerifiedAccessPricingKey {
  return `office-verified-access:${officeType}`;
}

export function prepareOfficeSystems(input: OfficeRegistrationInput, status: PropertyStatus): OfficeSystemPreparation {
  const hasVacancy = input.hasVacantOfficeUnits === 'yes' && Boolean(input.vacancy);
  const unitIdentifiers = input.vacancy?.unitIdentifiers ?? [];
  const vacantUnits = hasVacancy && input.vacancy
    ? [{
        vacancyPreparationId: 'office-vacancy-1',
        unitIdentifiers,
        officialUnitReferenceSource: 'real-world-property-identifier' as const,
        monthlyRent: input.vacancy.monthlyRent,
        depositAmount: input.vacancy.depositAmount,
        quantityAvailable: input.vacancy.quantityAvailable,
        preparedForPublication: true,
        preparedForDailyConfirmation: true,
        verificationStatus: 'waiting-for-future-verification-workflow' as const,
        searchVisibility: 'prepared-for-search-when-verified' as const
      }]
    : [];

  return {
    preparedSystemIds: OFFICE_PREPARED_SYSTEMS,
    duplicateInformationRequested: false,
    officeMatch: {
      prepared: true,
      duplicateInformationRequested: false,
      matchableAttributes: {
        officeType: input.officeType,
        location: input.location,
        roadVisibility: input.roadVisibility,
        water: input.water,
        electricity: input.electricity,
        nearbyPlaces: input.nearbyPlaces,
        vacancyInformation: input.vacancy,
        vacantUnitIdentification: unitIdentifiers
      }
    },
    vacancy: {
      prepared: true,
      hasPublishedVacancyCandidates: hasVacancy,
      vacantUnits,
      noVacancySearchSuppression: !hasVacancy,
      manualSetupRequired: false
    },
    searchPriority: {
      prepared: true,
      rankingPerformedNow: false,
      preparedRankingSignals: {
        verifiedVacancyStatus: 'prepared',
        activeVacancyConfirmations: 'prepared',
        freshnessOfVacancyInformation: 'prepared',
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
      pricingKey: getOfficeUnlockPricingKey(input.officeType),
      pricingSource: 'official-pataspace-office-unlock-pricing-structure',
      officeType: input.officeType,
      unitIdentifiers
    },
    verifiedAccess: {
      prepared: true,
      pricingKey: getOfficeVerifiedAccessPricingKey(input.officeType),
      pricingSource: 'official-pataspace-office-verified-access-pricing-structure',
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
      tenantFollowUpPrepared: [
        'confirm-attended-viewing',
        'confirm-found-office',
        'stop-office-match-notifications'
      ]
    },
    reviews: {
      prepared: true,
      eligibleForFuturePropertyReviews: true,
      tenantSuccessfulRentalReviewPrepared: true,
      reviewsImplementedNow: false
    },
    notifications: {
      prepared: true,
      notificationTopicsPrepared: [
        'vacancy-confirmation-reminders',
        'viewing-workflow-notifications',
        'property-status-updates',
        'verification-updates',
        'unlock-and-verified-access-notifications'
      ],
      notificationsSentNow: false
    },
    aiAdminAssistant: {
      prepared: true,
      recognisedAsNewOffice: true,
      invisibleAssistant: true,
      replacesPlatformAdministrator: false,
      futureAdministrativeAssistancePrepared: [
        'verification-support',
        'vacancy-monitoring',
        'review-prioritisation',
        'platform-recommendations'
      ]
    },
    platformHealthMonitor: {
      prepared: true,
      availableForFutureMonitoring: true,
      monitoringMetricsPrepared: [
        'vacancy-confirmation-activity',
        'search-demand',
        'areas-with-limited-office-supply',
        'properties-awaiting-verification',
        'other-founder-approved-platform-recommendations'
      ],
      registrantActionRequiredNow: false
    }
  };
}
