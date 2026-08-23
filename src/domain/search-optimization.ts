import type { PropertyCategoryId } from './types';

export type MatchSearchCategory = 'houses' | 'shops' | 'offices' | 'event-halls';
export type MatchFilterControl = 'toggle' | 'option-card' | 'multi-select' | 'yes-no-switch' | 'text-when-needed';
export type MatchRankingSignal =
  | 'match-accuracy'
  | 'verification-status'
  | 'property-reputation-history'
  | 'customer-reviews'
  | 'water-information'
  | 'electricity-information'
  | 'road-accessibility'
  | 'parking-availability'
  | 'distance-from-requested-location'
  | 'nearby-facilities'
  | 'property-condition'
  | 'daily-vacancy-confirmation';

export interface IntelligentSearchFilter {
  id: string;
  label: string;
  appliesTo: readonly MatchSearchCategory[];
  control: MatchFilterControl;
}

export interface AiSearchDescriptionInput {
  title: 'Tell us more to help us find your ideal property.';
  originalText: string;
  extractedPreferences: string[];
  preservesOriginalMeaning: true;
  restrictiveCharacterLimit: false;
}

export interface SavedSearchRecord {
  id: string;
  customerId: string;
  category: MatchSearchCategory;
  selectedFilters: Record<string, unknown>;
  aiSearchDescription: AiSearchDescriptionInput;
  privateToCustomer: true;
  customerAccessControlEnforced: true;
  createdAt: string;
  updatedAt: string;
}

export const INTELLIGENT_SEARCH_FILTERS: readonly IntelligentSearchFilter[] = [
  { id: 'county', label: 'County', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'option-card' },
  { id: 'town', label: 'Town', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'option-card' },
  { id: 'estate-neighbourhood', label: 'Estate / Neighbourhood', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'option-card' },
  { id: 'budget', label: 'Budget', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'option-card' },
  { id: 'property-category', label: 'Property Category', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'option-card' },
  { id: 'bedrooms', label: 'Bedrooms', appliesTo: ['houses'], control: 'option-card' },
  { id: 'water-availability', label: 'Water Availability', appliesTo: ['houses', 'shops', 'offices'], control: 'multi-select' },
  { id: 'electricity-information', label: 'Electricity Information', appliesTo: ['houses', 'shops', 'offices'], control: 'yes-no-switch' },
  { id: 'road-access', label: 'Road Access', appliesTo: ['shops', 'offices', 'event-halls'], control: 'multi-select' },
  { id: 'parking', label: 'Parking', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'yes-no-switch' },
  { id: 'security-features', label: 'Security Features', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'multi-select' },
  { id: 'furnished', label: 'Furnished / Unfurnished', appliesTo: ['houses', 'offices'], control: 'option-card' },
  { id: 'accessibility', label: 'Accessibility', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'multi-select' },
  { id: 'nearby-facilities', label: 'Nearby Facilities', appliesTo: ['houses', 'shops', 'offices', 'event-halls'], control: 'multi-select' },
  { id: 'floor-preference', label: 'Floor Preference', appliesTo: ['houses', 'shops', 'offices'], control: 'option-card' },
  { id: 'business-suitability', label: 'Business Suitability', appliesTo: ['shops'], control: 'multi-select' },
  { id: 'commercial-unit-type', label: 'Commercial Unit Type', appliesTo: ['shops'], control: 'multi-select' },
  { id: 'office-type', label: 'Office Type', appliesTo: ['offices'], control: 'option-card' },
  { id: 'hall-capacity', label: 'Hall Capacity', appliesTo: ['event-halls'], control: 'option-card' },
  { id: 'booking-price', label: 'Booking Price', appliesTo: ['event-halls'], control: 'option-card' }
] as const;

export const SEARCH_OPTIMISATION_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  objective: 'Return the most relevant properties based primarily on customer requirements.',
  matchEngineQuestion: 'Which available property best matches what this customer wants?',
  customerIntentComesFirst: true,
  aiNeverPrioritisesPlatformConvenienceOverCustomerIntent: true,
  categorySpecificSearchWorkflows: true,
  filterExperience: {
    primarilyToggleBased: true,
    approximately15To20IntelligentFilters: true,
    textOnlyWhenCustomerChooses: true,
    onlyRelevantFiltersAppear: true
  },
  aiSearchDescription: {
    title: 'Tell us more to help us find your ideal property.',
    freeTextAllowed: true,
    restrictiveCharacterLimit: false,
    extractsUsefulPreferences: true,
    preservesOriginalMeaning: true
  },
  rankingPriority: {
    priority1: 'Match Accuracy',
    matchAccuracyAlwaysHighestRankingFactor: true,
    additionalSignals: ['Verification status', 'Property reputation history', 'Customer reviews', 'Water information where applicable', 'Electricity information where applicable', 'Road accessibility', 'Parking availability', 'Distance from requested location', 'Nearby facilities', 'Property condition', 'Other Founder-approved matching factors'] as const,
    finalRankingFactor: 'Daily Vacancy Confirmation'
  },
  nearbyAlternatives: {
    searchRequestedLocationFirst: true,
    searchEverySupportedEstateAndNeighbourhoodFirst: true,
    nearbyTownsOnlyWhenNoMeaningfulMatchesExist: true,
    geographicallyReasonableSuggestions: true,
    examples: ['Athi River', 'Mlolongo', 'Syokimau'] as const
  },
  savedSearches: {
    includesSelectedFilters: true,
    includesAiSearchDescription: true,
    privateToCustomer: true,
    neverBypassesCustomerAccessControl: true
  },
  personalPropertyAssistant: {
    quietlyMonitorsSavedSearches: true,
    notifiesOnlyForMeaningfulNewMatches: true,
    notifiesWhenUnavailableSearchCanNowBeSatisfied: true,
    notifiesWhenSignificantlyBetterMatchAppears: true,
    avoidsRepetitiveNotifications: true,
    groupsSimilarPropertyNotifications: true
  },
  searchPerformance: ['Search speed', 'Match accuracy', 'Filter relevance', 'AI understanding', 'Result quality'] as const,
  aiLearningPrinciple: {
    mayImproveDescriptionInterpretation: true,
    mustNeverModifyFounderApprovedRankingPriorities: true,
    mustNeverOverrideCustomerAccessControl: true,
    mustNeverChangePricing: true,
    mustNeverChangeBusinessRules: true,
    onlyFounderApprovesBusinessLogicChanges: true
  },
  integrations: ['Property Registration', 'Property Verification', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Unlock This Listing', 'Verified Access', 'Customer Dashboard', 'Notifications', 'AI Admin Assistant', 'Platform Analytics', 'Business Opportunity Intelligence'] as const
} as const;

export function getFiltersForCategory(category: MatchSearchCategory): readonly IntelligentSearchFilter[] {
  return INTELLIGENT_SEARCH_FILTERS.filter((filter) => filter.appliesTo.includes(category));
}

export function extractSearchPreferences(description: string): AiSearchDescriptionInput {
  const lower = description.toLowerCase();
  const preferences = ['quiet neighbourhood', 'reliable water', 'near jKIA', 'upstairs okay', 'no car', 'children']
    .filter((hint) => lower.includes(hint.toLowerCase()));
  return { title: 'Tell us more to help us find your ideal property.', originalText: description, extractedPreferences: preferences, preservesOriginalMeaning: true, restrictiveCharacterLimit: false };
}
