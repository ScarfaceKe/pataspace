export const PATASPACE_FOUNDER_VISION =
  'PataSpace connects the right people to the right rental space at the right time through a simple, affordable, trusted, and reliable experience.';

export const PLATFORM_CONSTITUTION = {
  officialBlueprintCompleteThrough: 'Master Prompts 1–30B',
  founderVision: PATASPACE_FOUNDER_VISION,
  permanentPrinciples: {
    solveCustomerProblemsFirst:
      'Every feature should make it easier for customers to find the right rental space quickly, confidently, and efficiently.',
    protectHonestUsers:
      'Every platform decision should protect honest Customers, Property Owners, Property Managers, and Leasing Agents.',
    keepExperienceSimpleAffordableTrustedReliable:
      ['Simple', 'Affordable', 'Trusted', 'Reliable'] as const,
    founderAuthority:
      'The Founder remains the final authority over platform policies, pricing, business strategy, property categories, geographic management, customer access policies, verification policies, executive business goals, and platform governance.'
  },
  unifiedPlatformStandard: {
    modulesOperateAsOneCoordinatedPlatform: true,
    modules: [
      'Customer Experience',
      'Property Registration',
      'Property Verification',
      'House Match',
      'Shop Match',
      'Office Match',
      'Event Hall Match',
      'Unlock This Listing',
      'Verified Access',
      'Viewing Workflow',
      'Notifications',
      'Geographic Intelligence',
      'Business Opportunity Intelligence',
      'Executive Intelligence',
      'Platform Analytics',
      'Security'
    ] as const,
    modulesStrengthenEachOther: true,
    modulesDoNotOperateIndependentlyWhenSharedIntelligenceImprovesQuality: true
  },
  technologyVisibilityStandard: {
    normalCustomerExperienceMustNeverExpose: ['AI', 'Artificial Intelligence', 'Invisible Intelligence'] as const,
    customersExperiencePlatformAs: ['Faster', 'Smarter', 'Simpler', 'More accurate', 'More secure', 'More reliable'] as const,
    technologyBehindScenesUnlessFounderApproves: true
  },
  continuousLearningStandard: {
    legitimateOperationalLearning: true,
    improves: [
      'Better search quality',
      'Better property matching',
      'Better geographic knowledge',
      'Better fraud detection',
      'Better verification accuracy',
      'Better recommendation quality',
      'Better customer support',
      'Better platform performance'
    ] as const,
    preservesFounderApprovedBusinessRules: true
  },
  geographicEvolutionStandard: {
    comprehensiveKenyaGeographicDatabase: true,
    continuouslyLearnsLegitimateLocations: true,
    neverRejectLegitimateRegistrationBecauseLocationIsMissing: true,
    whenNewLegitimateLocationIdentified: [
      'Validate the location',
      'Accept the property registration',
      'Add the location to the geographic database',
      'Make the location available for future searches, registrations, matching, recommendations, and analytics'
    ] as const,
    founderAuthority: [
      'Add locations',
      'Edit locations',
      'Rename locations',
      'Correct spelling',
      'Merge duplicate locations',
      'Remove invalid locations'
    ] as const,
    founderDecisionsOverrideAutomatedGeographicUpdates: true
  },
  longTermDevelopmentStandard: {
    futureDevelopmentMust: [
      'Extend existing modules',
      'Reuse existing platform intelligence',
      'Preserve platform consistency',
      'Avoid duplicate functionality',
      'Maintain scalability',
      'Maintain security',
      'Improve customer experience'
    ] as const,
    founderBusinessLogicNeverRedesignedWithoutExplicitApproval: true
  },
  governanceStandard: {
    futureEnhancementsEvaluatedAgainstConstitutionFirst: true,
    constitutionTakesPrecedenceOnConflict: true,
    founderMayExplicitlyApproveAmendment: true
  },
  founderBlueprintPreservation: {
    masterPrompts1To30BFormOfficialFounderBlueprint: true,
    futureDevelopmentBuildsUponBlueprintRatherThanReplacingIt: true,
    majorArchitecturalOrBusinessChangesRequireExplicitFounderApproval: true
  },
  finalFounderAcceptance: {
    founderVisionPermanentlyAdopted: true,
    platformConstitutionPermanentlyAdopted: true,
    unifiedPlatformStandardPermanentlyAdopted: true,
    technologyVisibilityStandardPermanentlyAdopted: true,
    continuousLearningStandardPermanentlyAdopted: true,
    geographicEvolutionStandardPermanentlyAdopted: true,
    longTermDevelopmentStandardPermanentlyAdopted: true,
    founderAuthorityHighestAuthority: true,
    noFutureDevelopmentMayContradictWithoutExplicitFounderApproval: true
  }
} as const;
