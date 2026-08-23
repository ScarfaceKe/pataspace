/**
 * PataSpace Property Data Integrity Rules
 *
 * These rules ensure that every property listing — whether it is a simple
 * single-unit house or a complex mixed-use building with millions of units —
 * never loses or mixes up its essential information.
 *
 * This domain is referenced by: Property Registration, Verification,
 * Match Engines, Unlock, Verified Access, Viewing Workflow, Vacancy
 * Confirmation, AI Admin Assistant, and Platform Health Monitor.
 */

export const PROPERTY_DATA_INTEGRITY_RULES = {
  /** Each property must have a unique, immutable identity from registration through its entire lifecycle. */
  uniquePropertyIdentity: true,

  /** Once a property is registered and approved, its core identity fields cannot be silently changed. */
  coreIdentityImmutability: {
    immutabilityEnforced: true,
    fields: [
      'property-id',
      'category',
      'location-county',
      'location-town-or-city',
      'location-estate-or-area',
      'registered-by-user',
      'registered-at-timestamp',
      'property-manager-identity',
      'owner-identity',
    ],
    changeRequiresAdminApproval: true,
  },

  /** Floor information — including number of floors, basement, mezzanine, and rooftop — must be stored with the property and never lost. */
  floorInformationPreservation: {
    preserved: true,
    fields: [
      'number-of-floors',
      'has-basement',
      'has-mezzanine',
      'has-rooftop',
      'additional-floor-locations',
    ],
    neverLost: true,
    neverMixedWithOtherProperties: true,
    includedInEverySearchResult: true,
    includedInEveryMatchResult: true,
    includedInPropertyDetails: true,
    includedInUnlockScope: true,
    includedInVerifiedAccessScope: true,
    includedInViewingWorkflow: true,
    includedInVacancyConfirmation: true,
    includedInPropertyVerification: true,
    preservedWhenPropertyTransferred: true,
  },

  /** Unit-level information must be permanently tied to its parent property and never mixed across properties. */
  unitInformationPreservation: {
    preserved: true,
    perUnitIdentity: true,
    fields: [
      'unit-identifier',
      'unit-category',
      'unit-floor',
      'unit-rent',
      'unit-deposit',
      'unit-vacancy-status',
      'unit-type',
      'unit-size',
    ],
    neverMixedAcrossProperties: true,
    neverLostAtScale: true,
    scaleTest: 'Must hold true for 1 million properties with 5 million units',
  },

  /** WhatsApp contacts must be stored with the property and never mixed across listings. */
  contactInformationPreservation: {
    preserved: true,
    fields: [
      'property-manager-whatsapp',
      'owner-whatsapp',
      'leasing-agent-whatsapp',
      'property-manager-name',
      'owner-name',
      'leasing-agent-name',
    ],
    neverMixedAcrossProperties: true,
    notificationsRoutedToCorrectContacts: true,
  },

  /** Photo references must be permanently tied to the correct property. */
  photoInformationPreservation: {
    preserved: true,
    fields: [
      'entrance-photo',
      'building-photo',
      'vacant-unit-photos',
    ],
    neverMixedAcrossProperties: true,
    entrancePhotoRequired: true,
    buildingPhotoRequired: true,
  },

  /** Mixed-use building sub-units inherit the parent building's identity but maintain their own unit identity. */
  mixedUseBuildingIntegrity: {
    parentBuildingIdentityPreserved: true,
    subUnitIdentityIndependent: true,
    subUnitCategoryNeverConfusedWithParent: true,
    subUnitFloorNeverConfusedWithParent: true,
    subUnitUnlockIndependentOfParent: true,
    subUnitSearchableByOwnCategory: true,
    subUnitViewingRequestsRoutedToBuildingManager: true,
  },

  /** The system must never forget essential information regardless of scale. */
  scaleGuarantee: {
    holdsAtMillionProperties: true,
    holdsAtFiveMillionUnits: true,
    dataLossProbability: 'zero',
    informationMixingProbability: 'zero',
    essentialInformationAlwaysRetrievedWithListing: true,
    adminApprovalPreservesAllInformation: true,
    systemSearchAlwaysReturnsCompletePropertyData: true,
  },

  /** When a listing is approved by admin, every piece of information must be preserved exactly as registered. */
  adminApprovalIntegrity: {
    allRegistrationDataPreserved: true,
    floorDataPreserved: true,
    contactDataPreserved: true,
    photoReferencesPreserved: true,
    unitDataPreserved: true,
    mixedPropertyDataPreserved: true,
    noDataLossOnApproval: true,
    noDataMixingOnApproval: true,
  },
} as const;

export const PROPERTY_DATA_INTEGRITY_FOUNDATION = {
  question: 'How does PataSpace ensure that property information is never lost or mixed up, even at massive scale?',
  answer: 'Every property receives a unique immutable identity at registration. Floor information (including basement, mezzanine, and rooftop), unit details, contact information, and photos are stored as first-class data fields permanently tied to that identity. The system is designed so that no operation — search, match, unlock, viewing, vacancy confirmation, or admin approval — can lose or mix this data, even with 1 million properties and 5 million units.',
  customerFacingRule: 'The information you provide during registration is permanently stored with your listing and is never mixed with another property.',
  adminFacingRule: 'Every property listing carries its complete registration data through its entire lifecycle. No approved listing may lose floor information, unit details, contact details, or photo references.',
  aiAdminRule: 'AI must never recommend removing, overwriting, or mixing property floor information, contact information, or unit details during any operation.',
  technicalGuarantee: 'Property identity is the primary key for all data operations. No cross-property data contamination is possible through normal system operations.',
} as const;

export type PropertyDataIntegrityRuleSet = typeof PROPERTY_DATA_INTEGRITY_RULES;
