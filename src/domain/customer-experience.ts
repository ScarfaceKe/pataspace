import type { PropertyCategoryId } from './types';
import type { UnlockAccessRecord } from './unlock';
import type { VerifiedAccessRecord } from './verified-access';

export type RecentlyViewedAccessState = 'public-card' | 'unlocked' | 'verified-access' | 'expired-public-view';
export type ViewingFeedbackAnswer = 'yes' | 'no';
export type MinimalAiSuggestionType = 'increase-budget-slightly' | 'expand-to-nearby-estates';

export interface RecentlyViewedPropertyRecord {
  id: string;
  customerId: string;
  propertyId: string;
  unitIdentifier?: string;
  propertyCategory: PropertyCategoryId;
  viewedAt: string;
  accessState: RecentlyViewedAccessState;
  customerAccessControlApplied: true;
}

export interface SmartSearchRecoveryPrompt {
  customerId: string;
  message: "We couldn't find an exact match for your recent search. Would you like us to continue searching and notify you when a matching property becomes available?";
  acceptedCreatesSavedSearch: true;
  monitoredByAiPersonalPropertyAssistant: true;
}

export interface MinimalAiGuidance {
  type: MinimalAiSuggestionType;
  message: 'Consider increasing your budget slightly.' | 'Try expanding your search to nearby estates.';
  subtle: true;
  interruptsCustomer: false;
  dominatesSearchExperience: false;
}

export interface ViewingFeedbackRecord {
  id: string;
  customerId: string;
  viewingId: string;
  answer: ViewingFeedbackAnswer;
  improvesMatchQuality: true;
  improvesPropertyQuality: true;
  improvesAiRecommendations: true;
  improvesPlatformAnalytics: true;
  createdAt: string;
}

export interface ActivePropertyAccessSummary {
  unlocks: UnlockAccessRecord[];
  verifiedAccess: VerifiedAccessRecord[];
  remainingTimeUpdatesAutomatically: true;
}

export const CUSTOMER_EXPERIENCE_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  objective: 'Help customers find the right property with the fewest possible steps.',
  effortlessExperience: true,
  invisibleIntelligencePrinciple: true,
  customerHomeScreenStandardPermanent: true,
  customerFirstScreenQuestion: 'What would you like us to help you find today?',
  customerNeverLandsOnDashboardImmediatelyAfterSignIn: true,
  homeOptions: ['🏠 Find a Home', '🏪 Find a Shop', '🏢 Find an Office', '🎉 Find an Event Hall'] as const,
  propertySearchJourney: ['Intelligent toggle filters', 'AI Search Description', 'AI Match Engine', 'Category-specific Match workflow'] as const,
  dashboardAccessibleFromNavigation: true,
  dashboardSections: ['Saved Searches', 'Saved Properties', 'Recently Viewed', 'Active Unlock This Listing', 'Active Verified Access', 'Viewing Requests', 'Notifications', 'Settings'] as const,
  savedProperties: {
    customerMaySaveIndividualCards: true,
    remainUntilCustomerRemovesThem: true,
    neverBypassCustomerAccessControl: true,
    lockedPropertiesRemainLocked: true
  },
  recentlyViewed: {
    includesPublicCards: true,
    includesPreviouslyUnlockedProperties: true,
    expiredAccessReturnsToPublicInformationOnly: true,
    respectsCustomerAccessControl: true
  },
  activePropertyAccess: {
    activeUnlockThisListingShown: true,
    unlockRemainingTimeShown: true,
    activeVerifiedAccessShown: true,
    verifiedAccessRemainingTimeShown: true,
    remainingTimeUpdatesAutomatically: true
  },
  smartSearchRecovery: {
    aiQuietlyHelpsWhenRepeatedSearchesFail: true,
    promptMessage: "We couldn't find an exact match for your recent search. Would you like us to continue searching and notify you when a matching property becomes available?",
    acceptanceCreatesSavedSearch: true,
    monitoredByAiPersonalPropertyAssistant: true
  },
  minimalAiGuidance: {
    allowedSuggestions: ['Consider increasing your budget slightly.', 'Try expanding your search to nearby estates.'] as const,
    subtle: true,
    neverInterruptsCustomer: true,
    neverDominatesSearchExperience: true
  },
  viewingFeedback: {
    question: 'Was your viewing successful?',
    options: ['✅ Yes', '❌ No'] as const,
    improves: ['Match quality', 'Property quality', 'AI recommendations', 'Platform analytics'] as const
  },
  customerExperiencePrinciples: ['Fast', 'Simple', 'Clear', 'Helpful', 'Consistent', 'Intelligent', 'Non-intrusive'] as const,
  aiCustomerAssistance: ['Improving search quality', 'Reducing unnecessary steps', 'Remembering active saved searches', 'Delivering meaningful notifications', 'Helping customers find better property matches'] as const,
  security: {
    customerHistoryPrivate: true,
    savedSearchesPrivate: true,
    savedPropertiesPrivate: true,
    recentlyViewedPrivate: true,
    activePurchasesPrivate: true,
    onlyAccountOwnerMayAccess: true,
    customerAccessControlFullyApplicable: true
  },
  integrations: ['Customer Home Screen', 'Customer Dashboard', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Saved Searches', 'Saved Properties', 'Recently Viewed', 'Unlock This Listing', 'Verified Access', 'Viewing Workflow', 'Notifications', 'AI Match Engine', 'AI Personal Property Assistant', 'Platform Analytics'] as const
} as const;

export function buildSmartSearchRecoveryPrompt(customerId: string): SmartSearchRecoveryPrompt {
  return {
    customerId,
    message: "We couldn't find an exact match for your recent search. Would you like us to continue searching and notify you when a matching property becomes available?",
    acceptedCreatesSavedSearch: true,
    monitoredByAiPersonalPropertyAssistant: true
  };
}

export function buildMinimalAiGuidance(type: MinimalAiSuggestionType): MinimalAiGuidance {
  return type === 'increase-budget-slightly'
    ? { type, message: 'Consider increasing your budget slightly.', subtle: true, interruptsCustomer: false, dominatesSearchExperience: false }
    : { type, message: 'Try expanding your search to nearby estates.', subtle: true, interruptsCustomer: false, dominatesSearchExperience: false };
}
