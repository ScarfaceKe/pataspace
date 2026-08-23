import type {
  BusinessSuitabilityId,
  ShopNearbyPlaceDistanceInput,
  ShopRegistrationInput,
  ShopTypeId,
  ShopVacancyInput,
  ShopWaterInformationInput
} from './shop-registration';
import type { PropertyStatus } from './property-registration';

export type ShopPreparedSystemId =
  | 'shop-match'
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

export type ShopUnlockPricingKey = `shop-unlock:${string}`;
export type ShopVerifiedAccessPricingKey = `shop-verified-access:${string}`;

export interface PreparedShopVacancyUnit {
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

export interface ShopMatchPreparation {
  prepared: true;
  duplicateInformationRequested: false;    matchableAttributes: {
    shopType: ShopTypeId[];
    commercialUnitType: ShopRegistrationInput['commercialUnitType'];
    customCommercialUnitType: ShopRegistrationInput['customCommercialUnitType'];
    pricingCategory: ShopRegistrationInput['pricingCategory'];
    location: ShopRegistrationInput['location'];
    roadVisibility: ShopRegistrationInput['roadVisibility'];
    businessSuitability: BusinessSuitabilityId[];
    water: ShopWaterInformationInput;
    electricity: ShopRegistrationInput['electricity'];
    nearbyPlaces: ShopNearbyPlaceDistanceInput[];
    vacancyInformation: ShopVacancyInput | undefined;
    unitIdentification: string[];
  };
}

export interface ShopVacancyWorkflowPreparation {
  prepared: true;
  hasPublishedVacancyCandidates: boolean;
  vacantUnits: PreparedShopVacancyUnit[];
  noVacancySearchSuppression: boolean;
  manualSetupRequired: false;
}

export interface ShopSearchPriorityPreparation {
  prepared: true;
  rankingPerformedNow: false;
  preparedRankingSignals: {
    verifiedVacancyStatus: 'prepared';
    activeVacancyConfirmations: 'prepared';
    freshnessOfVacancyInformation: 'prepared';
    otherFounderApprovedSearchPriorityRules: 'prepared';
  };
}

export interface ShopSmartRotationPreparation {
  prepared: true;
  rotationPerformedNow: false;
  approvedBatchRotationPrepared: true;
  eligibleForFairHighQualityBatches: boolean;
}

export interface ShopMatchResultPreparation {
  prepared: true;
  limitedSearchResultBatchesPrepared: true;
  individualUnlockThisListingPrepared: true;
  verifiedAccessRecommendationsPrepared: true;
  smartRotationPrepared: true;
  systemsImplementedNow: false;
}

export interface ShopUnlockListingPreparation {
  prepared: true;
  manualPricingEntryAllowed: false;
  pricingKey: ShopUnlockPricingKey;
  pricingSource: 'official-pataspace-shop-unlock-pricing-structure';
  shopType: ShopTypeId[];
  unitIdentifiers: string[];
}

export interface ShopVerifiedAccessPreparation {
  prepared: true;
  pricingKey: ShopVerifiedAccessPricingKey;
  pricingSource: 'official-pataspace-shop-verified-access-pricing-structure';
  recommendationLogicPrepared: true;
  fewMatchesMayRecommendUnlock: true;
  manyMatchesMayRecommendVerifiedAccess: true;
  recommendationExecutedNow: false;
}

export interface ShopViewingWorkflowPreparation {
  prepared: true;
  eligibleForFutureViewingWorkflow: true;
  additionalRegistrationRequiredLater: false;
  approvedContactMethodsPrepared: readonly [
    'request-viewing-through-platform',
    'call-property-manager-or-contact-person',
    'whatsapp-property-manager-or-contact-person'
  ];
}

export interface ShopReviewPreparation {
  prepared: true;
  eligibleForFuturePropertyReviews: true;
  reviewsImplementedNow: false;
}

export interface ShopNotificationPreparation {
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

export interface ShopAiAdminAssistantPreparation {
  prepared: true;
  recognisedAsNewShop: true;
  invisibleAssistant: true;
  replacesPlatformAdministrator: false;
  futureAdministrativeAssistancePrepared: readonly [
    'verification-support',
    'vacancy-monitoring',
    'review-prioritisation',
    'platform-recommendations'
  ];
}

export interface ShopPlatformHealthMonitorPreparation {
  prepared: true;
  availableForFutureMonitoring: true;
  monitoringMetricsPrepared: readonly [
    'vacancy-confirmation-activity',
    'search-demand',
    'areas-with-limited-supply',
    'properties-awaiting-verification',
    'other-founder-approved-platform-recommendations'
  ];
  registrantActionRequiredNow: false;
}

export interface ShopSystemPreparation {
  preparedSystemIds: readonly ShopPreparedSystemId[];
  duplicateInformationRequested: false;
  shopMatch: ShopMatchPreparation;
  vacancy: ShopVacancyWorkflowPreparation;
  searchPriority: ShopSearchPriorityPreparation;
  smartRotation: ShopSmartRotationPreparation;
  matchResults: ShopMatchResultPreparation;
  unlockThisListing: ShopUnlockListingPreparation;
  verifiedAccess: ShopVerifiedAccessPreparation;
  viewingWorkflow: ShopViewingWorkflowPreparation;
  reviews: ShopReviewPreparation;
  notifications: ShopNotificationPreparation;
  aiAdminAssistant: ShopAiAdminAssistantPreparation;
  platformHealthMonitor: ShopPlatformHealthMonitorPreparation;
}

export const SHOP_PREPARED_SYSTEMS: readonly ShopPreparedSystemId[] = [
  'shop-match',
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

export function getShopUnlockPricingKey(shopType: ShopTypeId[]): ShopUnlockPricingKey {
  return `shop-unlock:${[...shopType].sort().join(',')}`;
}

export function getShopVerifiedAccessPricingKey(shopType: ShopTypeId[]): ShopVerifiedAccessPricingKey {
  return `shop-verified-access:${[...shopType].sort().join(',')}`;
}

export function prepareShopSystems(input: ShopRegistrationInput, status: PropertyStatus): ShopSystemPreparation {
  const hasVacancy = input.hasVacantShopUnits === 'yes' && Boolean(input.vacancy);
  const unitIdentifiers = input.vacancy?.unitIdentifiers ?? [];
  const vacantUnits = hasVacancy && input.vacancy
    ? [{
        vacancyPreparationId: 'shop-vacancy-1',
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
    preparedSystemIds: SHOP_PREPARED_SYSTEMS,
    duplicateInformationRequested: false,
    shopMatch: {
      prepared: true,
      duplicateInformationRequested: false,
      matchableAttributes: {
        shopType: input.shopType,
        commercialUnitType: input.commercialUnitType,
        customCommercialUnitType: input.customCommercialUnitType,
        pricingCategory: input.pricingCategory,
        location: input.location,
        roadVisibility: input.roadVisibility,
        businessSuitability: input.businessSuitability,
        water: input.water,
        electricity: input.electricity,
        nearbyPlaces: input.nearbyPlaces,
        vacancyInformation: input.vacancy,
        unitIdentification: unitIdentifiers
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
      pricingKey: getShopUnlockPricingKey(input.shopType),
      pricingSource: 'official-pataspace-shop-unlock-pricing-structure',
      shopType: input.shopType,
      unitIdentifiers
    },
    verifiedAccess: {
      prepared: true,
      pricingKey: getShopVerifiedAccessPricingKey(input.shopType),
      pricingSource: 'official-pataspace-shop-verified-access-pricing-structure',
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
      ]
    },
    reviews: {
      prepared: true,
      eligibleForFuturePropertyReviews: true,
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
      recognisedAsNewShop: true,
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
        'areas-with-limited-supply',
        'properties-awaiting-verification',
        'other-founder-approved-platform-recommendations'
      ],
      registrantActionRequiredNow: false
    }
  };
}
