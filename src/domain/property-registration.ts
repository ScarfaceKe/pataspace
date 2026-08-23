import { CUSTOMER_ACCESS_CONTROL_STANDARD } from './customer-access-control';
import type { VerificationStatus } from './verification';
import type { PropertyLocationVerification } from './location-verification';
import type { PropertyCategoryId, UserRoleId } from './types';

export type PropertyRegistrationCategoryId = PropertyCategoryId;
export type PropertyOwnershipRole = 'owner' | 'property-manager' | 'leasing-agent';
export type PropertyVacancyAnswer = 'yes' | 'no';
export type PropertyRegistrationAction = 'save-draft' | 'submit-registration';
export type ElectricityAvailabilityAnswer = 'yes' | 'no';
export type ElectricityBillingType = 'individual-meter' | 'shared-meter' | 'included-in-rent' | 'other';
export type PropertyStatus = 'draft' | 'active' | 'waiting-for-verification' | 'occupied';
export type PropertyReviewFlagReason =
  | 'new-location-review'
  | 'possible-duplicate'
  | 'logical-consistency-review'
  | 'obvious-mistake-review';

export type FloorLocationType = 'basement' | 'ground' | 'mezzanine' | 'upper-floor' | 'rooftop';

export interface WhatsAppContactInfo {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName?: string;
}

export interface PropertyRegistrationCategory {
  id: PropertyRegistrationCategoryId;
  icon: '🏠' | '🏪' | '🏢' | '🎉';
  label: 'House' | 'Shop' | 'Office' | 'Event Hall';
  description: string;
}

export interface PropertyLocationInput {
  county: string;
  townOrCity: string;
  estateOrAreaOrNeighbourhood: string;
  street?: string;
  landmark?: string;
  verification?: PropertyLocationVerification;
}

export interface PropertyPhotoFoundationInput {
  fileName: string;
  qualityNote?: string;
}

export interface PropertyEntrancePhotoInput {
  fileName: string;
}

export interface PropertyBuildingPhotoInput {
  fileName: string;
}

export interface VacancyFoundationInput {
  summary: string;
  unitsAvailable?: number;
  unitIdentifiers?: string[];
}

export interface PropertyContactLinkFoundation {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface PropertyRegistrationResponsibilityLinks {
  propertyOwner?: PropertyContactLinkFoundation;
  propertyManager?: PropertyContactLinkFoundation;
  leasingAgent?: PropertyContactLinkFoundation;
}

export interface ElectricityInformationInput {
  isElectricityAvailable: ElectricityAvailabilityAnswer;
  billingType?: ElectricityBillingType;
  otherBillingDescription?: string;
  powerAvailabilityNotes?: string;
}

export interface DailyVacancyVerificationFoundation {
  requiredForPublishedVacantUnits: boolean;
  preparedForDailyConfirmations: boolean;
  preparedForGracePeriods: boolean;
  preparedForWaitingForVerification: boolean;
  preparedForSearchPriority: boolean;
  preparedForPlatformHealthMonitor: boolean;
  lastConfirmedAt?: string;
  nextConfirmationDueAt?: string;
}

export interface PropertyRegistrationInput {
  category: PropertyRegistrationCategoryId;
  location: PropertyLocationInput;
  description: string;
  ownershipRole: PropertyOwnershipRole;
  responsibilityLinks?: PropertyRegistrationResponsibilityLinks;
  whatsappContacts?: WhatsAppContactInfo[];
  electricity?: ElectricityInformationInput;
  hasVacantUnits: PropertyVacancyAnswer;
  vacancy?: VacancyFoundationInput;
  entrancePhotos?: PropertyEntrancePhotoInput[];
  buildingPhotos?: PropertyBuildingPhotoInput[];
  photos?: PropertyPhotoFoundationInput[];
  action: PropertyRegistrationAction;
}

export interface RegisteredPropertyFoundation extends PropertyRegistrationInput {
  id: string;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  status: PropertyStatus;
  verificationStatus: VerificationStatus;
  locationReviewRequired: boolean;
  reviewFlags: PropertyReviewFlagReason[];
  duplicateCandidateIds: string[];
  vacancyVerification: DailyVacancyVerificationFoundation;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const PROPERTY_REGISTRATION_FOUNDATION = {
  philosophy: ['Guided', 'Step-by-step', 'Mobile-first', 'Easy to understand', 'Professional'] as const,
  authorizedRoles: ['property-owner', 'property-manager', 'leasing-agent'] as const,
  blockedRoles: ['customer'] as const,
  platformAdminRegistrationManagedSeparately: true,
  longFormPolicy: 'Never overwhelm users with one very long form. Break registration into logical screens.',
  registrationResponsibilities: {
    propertyOwner: [
      'Register their own property',
      'Assign or link a Property Manager',
      'Assign or link a Leasing Agent',
      'Manage their property through the Owner Dashboard'
    ],
    propertyManager: [
      'Register properties they manage',
      'Link the Property Owner',
      'Link the Leasing Agent if applicable',
      'Manage vacancies and perform daily vacancy confirmations'
    ],
    leasingAgent: [
      'Register properties on behalf of the Property Owner',
      'Link the Property Owner',
      'Link the Property Manager if one already exists',
      'Participate in the leasing workflow according to assigned permissions'
    ]
  },
  commonFrameworkFor: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  aiAdminAssistantMode: 'quiet-background-assistance',
  unrecognisedLocationUserMessageAllowed: false,
  customerAccessControlStandard: CUSTOMER_ACCESS_CONTROL_STANDARD,
  floorLogic: {
    groundFloorAlwaysIncluded: true,
    note: 'Any property with one or more floors must have a ground floor by default. If you enter 3 floors, the system understands Ground, 1st, and 2nd floors.',
    allowsBasement: true,
    allowsMezzanine: true,
    allowsRooftop: true,
    specialFloorLocations: ['basement', 'mezzanine', 'rooftop'] as const
  },
  whatsappContactPolicy: {
    enabled: true,
    requiredRole: 'property-manager',
    description: 'The property manager WhatsApp number receives most notifications. The listing agent should also provide owner and leasing agent WhatsApp numbers if available.'
  },
  photoUploadPolicy: {
    requiresEntrancePhoto: true,
    requiresWholeBuildingPhoto: true,
    vacantUnitPhotosDeferredToAfterApproval: true,
    description: 'Entrance photo and whole building photo are required during registration. Vacant unit photos are uploaded after admin approval.'
  },
  unitNumberPolicy: {
    requiredOnListingNamePage: true,
    description: 'The unit number must be entered on the same page as the listing name to ensure every listing is properly identified.'
  },
  registrationUserExperienceStandard: {
    platformWideRule: true,
    appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'],
    experienceModel: 'intelligent-guided-experience-not-traditional-form',
    preferredInteractionPatterns: [
      'Toggle buttons',
      'Selectable chips',
      'Option cards',
      'Multi-select choices',
      'Yes / No switches'
    ],
    adaptiveBehaviour: 'Questions should appear only when they become relevant based on previous selections.',
    userFeeling: 'Users should feel as though they are making simple choices instead of filling out long forms.',
    textInputOnlyWhenNeededFor: ['Property Name', 'Landmark', 'Property Description', 'Other when selected'],
    examples: {
      waterAvailable: ['Daily', 'Specific Days', 'Purchased', 'No Water'],
      electricityAvailable: ['Yes', 'No'],
      electricityBillingWhenAvailable: ['Individual Meter', 'Shared Meter', 'Included in Rent', 'Other']
    },
    inheritedByFutureRegistrationModules: true
  },
  electricityInformation: {
    platformWideRule: true,
    mandatory: true,
    appliesTo: ['Houses', 'Shops', 'Offices'],
    excludes: ['Event Halls'],
    question: 'Is electricity available?',
    availabilityOptions: ['Yes', 'No'],
    billingQuestion: 'How is electricity billed?',
    billingOptions: ['Individual Meter', 'Shared Meter', 'Included in Rent', 'Other'],
    collectOnceAndInheritEverywhere: true,
    futureConsumers: ['House Match', 'Shop Match', 'Office Match', 'Viewing Workflow', 'AI Admin Assistant', 'Property Details'],
    profilePurpose: 'Helps prospective tenants understand the electricity setup before unlocking a listing or requesting a viewing.'
  },
  vacantUnitIdentification: {
    platformWideRule: true,
    appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'],
    platformGeneratesIdentifiers: false,
    preserveExactlyAsEntered: true,
    examples: ['A1', 'A2', 'B5', 'K7', 'Shop 14', 'Office 203', 'Hall A', 'Hall B', 'Stall 3', 'Unit 12', 'Room 7'],
    officialReferenceFor: [
      'Unlock This Listing',
      'Verified Access',
      'Viewing Requests',
      'Property Reviews',
      'Notifications',
      'Vacancy Management',
      'Daily Vacancy Confirmation',
      'Search Results',
      'Search Matching',
      'Admin Dashboard',
      'AI Admin Assistant'
    ]
  },
  futureIntegrations: [
    'House Registration',
    'Shop Registration',
    'Office Registration',
    'Hall Registration',
    'Mixed-Use Building Registration',
    'Verification System',
    'Vacancy Verification',
    'Match Engines',
    'AI Admin Assistant',
    'Platform Health Monitor',
    'Dashboards'
  ] as const
} as const;

export const PROPERTY_REGISTRATION_CATEGORIES: readonly PropertyRegistrationCategory[] = [
  {
    id: 'houses',
    icon: '🏠',
    label: 'House',
    description: 'Register a residential rental property for future house-specific details.'
  },
  {
    id: 'shops',
    icon: '🏪',
    label: 'Shop',
    description: 'Register a shop space for future size and business suitability details.'
  },
  {
    id: 'offices',
    icon: '🏢',
    label: 'Office',
    description: 'Register an office space for future office type and setup details.'
  },
  {
    id: 'event-halls',
    icon: '🎉',
    label: 'Event Hall',
    description: 'Register an event hall for future capacity and event suitability details.'
  }
] as const;

export const MIXED_USE_BUILDING_REGISTRATION_CATEGORY = {
  id: 'mixed-use-building' as const,
  icon: '🏙️',
  label: 'Mixed-Use Building',
  description: 'Register a building with shops, offices, halls, and/or residential units under one roof.',
  href: '/properties/register/mixed-use-building',
} as const;

export const PROPERTY_STATUS_OPTIONS: readonly PropertyStatus[] = [
  'draft', 'active', 'waiting-for-verification', 'occupied'
] as const;

export const PROPERTY_LOCATION_FIELDS = [
  'County', 'Town / City', 'Estate / Area / Neighbourhood', 'Street (if applicable)', 'Landmark (optional)'
] as const;

export const PROPERTY_DESCRIPTION_LABEL =
  'Tell us anything else that will help people find the right home, shop, office or hall.';

export const FLOOR_TYPE_OPTIONS = [
  { id: 'basement' as FloorLocationType, label: 'Basement', description: 'Below ground level' },
  { id: 'ground' as FloorLocationType, label: 'Ground Floor', description: 'Street level (always included)' },
  { id: 'mezzanine' as FloorLocationType, label: 'Mezzanine', description: 'Between ground and first floor' },
  { id: 'upper-floor' as FloorLocationType, label: 'Upper Floor', description: 'Standard numbered floor' },
  { id: 'rooftop' as FloorLocationType, label: 'Rooftop', description: 'Top level or rooftop area' }
] as const;

export function canRegisterProperties(role: UserRoleId): boolean {
  return role === 'property-owner' || role === 'property-manager' || role === 'leasing-agent';
}

export function getRegistrationResponsibilityCopy(role: UserRoleId): string {
  if (role === 'property-owner') return 'You can register your own property, then assign or link a Property Manager or Leasing Agent.';
  if (role === 'property-manager') return 'You can register properties you manage, link the Property Owner, and link the Leasing Agent if applicable.';
  if (role === 'leasing-agent') return 'You can register properties on behalf of the Property Owner, then link the owner and Property Manager if one already exists.';
  return 'Customers cannot register properties.';
}

export function getInitialPropertyStatus(input: Pick<PropertyRegistrationInput, 'action' | 'hasVacantUnits'>): PropertyStatus {
  if (input.action === 'save-draft') return 'draft';
  if (input.hasVacantUnits === 'yes') return 'waiting-for-verification';
  return 'occupied';
}

export function createVacancyVerificationFoundation(hasVacantUnits: PropertyVacancyAnswer): DailyVacancyVerificationFoundation {
  return {
    requiredForPublishedVacantUnits: hasVacantUnits === 'yes',
    preparedForDailyConfirmations: true,
    preparedForGracePeriods: true,
    preparedForWaitingForVerification: true,
    preparedForSearchPriority: true,
    preparedForPlatformHealthMonitor: true
  };
}

export function getFloorCountWithGroundFloor(numberOfFloors: number | null): string {
  if (!numberOfFloors || numberOfFloors <= 0) return 'No floors specified';
  if (numberOfFloors === 1) return '1 floor (Ground Floor)';
  return `${numberOfFloors} floors (Ground Floor + ${numberOfFloors - 1} upper level${numberOfFloors - 1 > 1 ? 's' : ''})`;
}
