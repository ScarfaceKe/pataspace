import type { PropertyCategoryId } from './types';
import type { AiSearchDescriptionInput, MatchSearchCategory } from './search-optimization';
import { extractSearchPreferences } from './search-optimization';

export type RecommendationSignal =
  | 'preferred-budget'
  | 'preferred-area'
  | 'requested-property-type'
  | 'bedroom-requirement'
  | 'parking-preference'
  | 'water-preference'
  | 'electricity-preference'
  | 'security-preference'
  | 'accessibility-requirement'
  | 'description-match'
  | 'verification-status'
  | 'current-availability';

export interface AiMatchScore {
  score: number;
  invisibleToCustomers: true;
  matchAccuracyPrimary: true;
  popularityOnlyScoringAllowed: false;
  signals: RecommendationSignal[];
}

export interface RecommendationExplanation {
  whyThisPropertyMatches: string[];
  generatedFromCustomerRequirements: true;
  inventedReasonsAllowed: false;
}

export interface SearchRecoveryPlan {
  requestedLocation: string;
  recoveryOrder: readonly [
    'search-every-estate-and-neighbourhood-within-requested-town',
    'search-every-supported-area-within-requested-location',
    'suggest-nearby-towns-only-if-no-meaningful-matches-exist'
  ];
  skipDirectlyToDistantLocations: false;
}

export interface SavedSearchRecommendationEvaluation {
  savedSearchId: string;
  matchQuality: 'low' | 'medium' | 'high';
  propertyAvailable: boolean;
  propertyVerified: boolean;
  currentVacancyActive: boolean;
  shouldNotifyCustomer: boolean;
  notificationReason?: string;
}

export interface RecommendationAnalyticsSnapshot {
  recommendationQualityPrepared: true;
  matchSuccessRatePrepared: true;
  savedSearchPerformancePrepared: true;
  notificationUsefulnessPrepared: true;
  searchRecoveryEffectivenessPrepared: true;
}

export const AI_RECOMMENDATION_ENGINE_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  customerRequirementsAlwaysFirst: true,
  matchScoreInvisibleToCustomers: true,
  highestScoreBelongsToBestRequirementMatch: true,
  popularityOnlyScoringForbidden: true,
  additionalFactorsOnlyRefineAfterMatchAccuracy: true,
  whyThisPropertyMatchesPublic: true,
  explanationUsesActualSearchRequirements: true,
  explanationsNeverInventReasons: true,
  aiDescriptionInterpretation: {
    originalTextUnchanged: true,
    extractsPreferences: ['Quiet neighbourhood', 'Reliable water', 'Reasonable access toward JKIA', 'Family-friendly environment'] as const
  },
  continuousOptimisation: ['Match accuracy', 'Search quality', 'Filter effectiveness', 'Recommendation quality', 'Customer interaction with search results'] as const,
  smartSearchRecoveryOrder: ['Search every estate and neighbourhood within the requested town', 'Search every supported area within the requested location', 'Suggest nearby towns only when no meaningful matches exist'] as const,
  savedSearchIntelligence: {
    monitorsSavedSearches: true,
    notifiesOnlyForHighQualityMatches: true,
    evaluatesMatchQualityAvailabilityVerificationAndVacancy: true
  },
  notificationQuality: {
    valuableOnly: true,
    avoidPoorMatches: true,
    avoidDuplicateRecommendations: true,
    avoidMinorImprovements: true,
    avoidRepetitiveListings: true
  },
  recommendationDiversity: {
    avoidNearlyIdenticalFirstPage: true,
    includeHealthyVarietyWhenAppropriate: true,
    stillRespectsMatchAccuracy: true
  },
  aiLearning: {
    mayImproveSearchDescriptionUnderstanding: true,
    mayImproveRecommendationExplanations: true,
    mayRefineSearchRecovery: true,
    mayImproveRecommendationQuality: true,
    mustNeverModifyFounderApprovedMatchRanking: true,
    mustNeverModifyUnlockThisListingRules: true,
    mustNeverModifyVerifiedAccessRules: true,
    mustNeverModifyCustomerAccessControl: true,
    mustNeverChangePricing: true,
    mustNeverChangeBusinessRules: true,
    onlyFounderMayApproveBusinessRuleChanges: true
  },
  privacy: {
    customerSearchesRemainPrivate: true,
    savedSearchesRemainPrivate: true,
    aiInterpretationRemainsPrivate: true,
    noCustomerSearchInformationSharedWithOtherUsers: true
  },
  integrations: ['Search Optimisation & AI Match Engine Foundation', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Property Registration', 'Property Verification', 'Customer Dashboard', 'Notifications', 'Platform Analytics', 'Business Opportunity Intelligence', 'AI Admin Assistant'] as const
} as const;

export function buildAiMatchScore(input: { matchedRequirements: number; totalRequirements: number; signals: RecommendationSignal[] }): AiMatchScore {
  const score = input.totalRequirements <= 0 ? 0 : Math.round((input.matchedRequirements / input.totalRequirements) * 100);
  return { score, invisibleToCustomers: true, matchAccuracyPrimary: true, popularityOnlyScoringAllowed: false, signals: input.signals };
}

export function buildRecommendationExplanation(signals: RecommendationSignal[]): RecommendationExplanation {
  const map: Record<RecommendationSignal, string> = {
    'preferred-budget': 'Matches your preferred budget.',
    'preferred-area': 'Located in your preferred area.',
    'requested-property-type': 'Matches your requested property type.',
    'bedroom-requirement': 'Matches your bedroom requirement.',
    'parking-preference': 'Matches your parking preference.',
    'water-preference': 'Matches your water preference.',
    'electricity-preference': 'Matches your electricity preference.',
    'security-preference': 'Matches your security preference.',
    'accessibility-requirement': 'Matches your accessibility requirements.',
    'description-match': 'Matches details from your description.',
    'verification-status': 'Has suitable verification status.',
    'current-availability': 'Has current availability.'
  };
  return { whyThisPropertyMatches: signals.map((signal) => map[signal]), generatedFromCustomerRequirements: true, inventedReasonsAllowed: false };
}

export function interpretCustomerSearchDescription(description: string): AiSearchDescriptionInput {
  return extractSearchPreferences(description);
}

export function buildSearchRecoveryPlan(requestedLocation: string): SearchRecoveryPlan {
  return { requestedLocation, recoveryOrder: ['search-every-estate-and-neighbourhood-within-requested-town', 'search-every-supported-area-within-requested-location', 'suggest-nearby-towns-only-if-no-meaningful-matches-exist'], skipDirectlyToDistantLocations: false };
}

export function evaluateSavedSearchRecommendation(input: { savedSearchId: string; matchScore: number; propertyAvailable: boolean; propertyVerified: boolean; currentVacancyActive: boolean }): SavedSearchRecommendationEvaluation {
  const matchQuality = input.matchScore >= 80 ? 'high' : input.matchScore >= 55 ? 'medium' : 'low';
  const shouldNotifyCustomer = matchQuality === 'high' && input.propertyAvailable && input.propertyVerified && input.currentVacancyActive;
  return { savedSearchId: input.savedSearchId, matchQuality, propertyAvailable: input.propertyAvailable, propertyVerified: input.propertyVerified, currentVacancyActive: input.currentVacancyActive, shouldNotifyCustomer, notificationReason: shouldNotifyCustomer ? 'A meaningful new match is available for your saved search.' : undefined };
}

export function buildRecommendationAnalyticsSnapshot(): RecommendationAnalyticsSnapshot {
  return { recommendationQualityPrepared: true, matchSuccessRatePrepared: true, savedSearchPerformancePrepared: true, notificationUsefulnessPrepared: true, searchRecoveryEffectivenessPrepared: true };
}
