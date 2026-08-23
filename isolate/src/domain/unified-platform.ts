import type { PropertyCategoryId } from './types';

export type UnifiedIntelligenceSystem =
  | 'match-intelligence'
  | 'search-intelligence'
  | 'geographic-intelligence'
  | 'verification-intelligence'
  | 'fraud-detection'
  | 'customer-support-intelligence'
  | 'moderator-intelligence'
  | 'finance-intelligence'
  | 'notification-intelligence'
  | 'business-opportunity-intelligence'
  | 'executive-intelligence'
  | 'platform-health-intelligence';

export type KenyaLocalityType = 'county' | 'city' | 'town' | 'estate' | 'neighbourhood' | 'trading-centre' | 'other-locality';

export interface KenyaGeographicLocation {
  id: string;
  name: string;
  type: KenyaLocalityType;
  county?: string;
  parentId?: string;
  aliases: string[];
  validated: boolean;
  source: 'seeded' | 'registration-learning' | 'founder-managed';
  createdAt: string;
  updatedAt: string;
}

export interface GeographicLearningCandidate {
  name: string;
  type: KenyaLocalityType;
  county?: string;
  parentId?: string;
  registrationEvidence: string[];
  acceptedWithoutRejection: true;
}

export const UNIFIED_PLATFORM_INTELLIGENCE_FRAMEWORK = {
  objective: 'Make PataSpace behave as one intelligent platform rather than a collection of separate features.',
  sharedIntelligenceSystems: [
    'match-intelligence',
    'search-intelligence',
    'geographic-intelligence',
    'verification-intelligence',
    'fraud-detection',
    'customer-support-intelligence',
    'moderator-intelligence',
    'finance-intelligence',
    'notification-intelligence',
    'business-opportunity-intelligence',
    'executive-intelligence',
    'platform-health-intelligence'
  ] as const,
  sharedKnowledgeLearnsFrom: [
    'Customer searches',
    'Saved searches',
    'Property registrations',
    'Property verification',
    'Viewing outcomes',
    'Search success',
    'Failed searches',
    'Platform analytics',
    'County performance',
    'Business goals',
    'Founder-approved decisions'
  ] as const,
  geographicDatabaseIncludes: ['Counties', 'Cities', 'Towns', 'Estates', 'Neighbourhoods', 'Trading Centres', 'Other recognised localities'] as const,
  continuousGeographicLearning: {
    neverRejectLegitimateRegistrationForUnknownLocation: true,
    recognisesNewLocations: true,
    validatesUsingRegistrationInformationAndPlatformEvidence: true,
    acceptsLegitimateLocations: true,
    addsValidatedLocationsToDatabase: true,
    makesValidatedLocationsAvailableFor: ['Searches', 'Property registration', 'Matching', 'Recommendations', 'Analytics'] as const
  },
  founderGeographicAuthority: {
    founderMayAddLocations: true,
    founderMayEditLocations: true,
    founderMayRenameLocations: true,
    founderMayCorrectSpelling: true,
    founderMayMergeDuplicateLocations: true,
    founderMayRemoveInvalidLocations: true,
    founderDecisionsOverrideAutomatedUpdates: true
  },
  founderDecisionAuthority: [
    'Platform policies',
    'Pricing',
    'Business goals',
    'Property categories',
    'Verification policies',
    'Customer access rules',
    'Business strategy',
    'Geographic changes',
    'Operational workflows'
  ] as const,
  noAutomatedSystemOverridesFounderDecision: true,
  intelligentImprovementAllowedFor: [
    'Match quality',
    'Search quality',
    'Fraud detection',
    'Verification accuracy',
    'Geographic knowledge',
    'Notification quality',
    'Recommendation quality',
    'Customer experience',
    'Platform performance'
  ] as const,
  intelligentImprovementCannotChangeBusinessLogicWithoutApproval: true,
  technologyVisibilityStandard: {
    customerFacingTechnologyTermsForbidden: ['AI', 'Artificial Intelligence', 'Invisible Intelligence'] as const,
    appliesToNormalCustomerExperience: true,
    underlyingTechnologyBehindScenesUnlessFounderApproves: true,
    customersExperiencePlatformAs: ['Faster', 'Smarter', 'Simpler', 'More accurate', 'More reliable', 'More secure'] as const
  },
  platformConsistency: [
    'Customer Access Control',
    'Unlock This Listing',
    'Verified Access',
    'Viewing Workflow',
    'Search Intelligence',
    'Match Engine',
    'Executive Intelligence',
    'Business Opportunity Intelligence',
    'Customer Experience',
    'Founder Authority',
    'Security'
  ] as const,
  platformLearningPrinciples: [
    'New geographic locations',
    'Improved search patterns',
    'Better property matching',
    'Improved fraud detection',
    'Better recommendation quality',
    'Improved verification performance'
  ] as const,
  security: {
    sensitiveCustomerInformationProtected: true,
    businessIntelligenceProtected: true,
    executiveInformationProtected: true,
    paymentInformationProtected: true,
    platformOperationsProtected: true
  },
  integratesEveryFounderApprovedModule: true,
  futureModulesMustIntegrate: true
} as const;

export function buildGeographicLocationId(type: KenyaLocalityType, name: string, county?: string): string {
  return `${type}:${county ?? 'kenya'}:${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function propertyCategoryLabel(category: PropertyCategoryId): string {
  if (category === 'houses') return 'Houses';
  if (category === 'shops') return 'Shops';
  if (category === 'offices') return 'Offices';
  return 'Event Halls';
}
