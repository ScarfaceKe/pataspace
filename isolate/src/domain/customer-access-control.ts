export const CUSTOMER_ACCESS_CONTROL_STANDARD = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  mandatory: true,
  beforeAccessPublicCardMayDisplay: [
    'Only the two cover photos selected during registration',
    'Property Summary',
    'Clearly labelled AI Summary',
    'Why This Property Matches',
    'Unlock This Listing including approved price',
    'Verified Access recommendation when approved rules are satisfied'
  ] as const,
  beforeAccessMustNeverDisplay: [
    'Property Owner phone number',
    'Property Manager phone number',
    'Leasing Agent phone number',
    'WhatsApp contact',
    'Request Viewing through the platform',
    'Any direct contact information that allows communication outside PataSpace'
  ] as const,
  accessGrantMethods: ['Unlock This Listing', 'Verified Access'] as const,
  afterAccessUnlocked: [
    'All property photos uploaded during registration',
    'Contact person phone number',
    'Call Property Owner, Property Manager, or Leasing Agent',
    'Start WhatsApp conversation with Property Owner, Property Manager, or Leasing Agent',
    'Request viewing through PataSpace Viewing Workflow'
  ] as const,
  noPropertyTypeMayBypass: true,
  futurePromptsMayExposeContactBeforeAccess: false
} as const;

export interface CustomerAccessControlPreparation {
  beforeAccess: {
    coverPhotosOnly: true;
    propertySummary: true;
    aiSummary: true;
    whyThisPropertyMatches: true;
    unlockThisListing: true;
    verifiedAccessRecommendationWhenEligible: true;
    contactInformationHidden: true;
    platformCommunicationHidden: true;
  };
  afterAccess: {
    allPhotosUnlocked: boolean;
    phoneNumberUnlocked: boolean;
    callUnlocked: boolean;
    whatsappUnlocked: boolean;
    requestViewingUnlocked: boolean;
  };
}

export function buildCustomerAccessControlPreparation(): CustomerAccessControlPreparation {
  return {
    beforeAccess: {
      coverPhotosOnly: true,
      propertySummary: true,
      aiSummary: true,
      whyThisPropertyMatches: true,
      unlockThisListing: true,
      verifiedAccessRecommendationWhenEligible: true,
      contactInformationHidden: true,
      platformCommunicationHidden: true
    },
    afterAccess: {
      allPhotosUnlocked: true,
      phoneNumberUnlocked: true,
      callUnlocked: true,
      whatsappUnlocked: true,
      requestViewingUnlocked: true
    }
  };
}
