import type { ResidentialSystemPreparation } from './house-system-preparation';
import type { ElectricityInformationInput, PropertyLocationInput, PropertyOwnershipRole, PropertyRegistrationAction } from './property-registration';
import { canRegisterProperties } from './property-registration';
import type { UserRoleId } from './types';

export type ResidentialCategoryId =
  | 'single-room'
  | 'bedsitter'
  | 'one-bedroom'
  | 'two-bedroom'
  | 'three-bedroom'
  | 'four-bedroom'
  | 'five-bedroom'
  | 'maisonette'
  | 'bungalow'
  | 'mixed-residential-property';

export type DepositStructureId = 'one-month' | 'two-months' | 'three-months' | 'custom-amount';
export type VacancyAnswer = 'yes' | 'no';
export type WaterAvailabilityId =
  | 'daily-water'
  | 'specific-days'
  | 'water-purchased-separately'
  | 'no-water-connection';
export type WaterRentInclusion = 'included' | 'paid-separately';

export type NearbyPlaceId =
  | 'primary-school'
  | 'secondary-school'
  | 'hospital'
  | 'shopping-centre'
  | 'bus-stage'
  | 'market'
  | 'police-station';

export interface ResidentialCategoryOption {
  id: ResidentialCategoryId;
  label: string;
  description: string;
}

export interface RentInformationInput {
  monthlyRent: number | null;
  depositStructure: DepositStructureId;
  depositAmount: number | null;
}

export interface ResidentialVacancyInput {
  residentialCategory: ResidentialCategoryId;
  monthlyRent: number | null;
  depositAmount: number | null;
  quantityAvailable: number | null;
  unitIdentifiers: string[];
}

export interface WaterInformationInput {
  availability: WaterAvailabilityId;
  specificDays?: string;
  rentInclusion?: WaterRentInclusion;
}

export interface NearbyPlaceDistanceInput {
  place: NearbyPlaceId;
  approximateDistance?: string;
}

export interface HousePhotoInput {
  fileName: string;
  represents?: 'Exterior' | 'Interior' | 'Shared Areas';
}

export interface HouseWhatsAppContact {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName?: string;
}

export interface HouseRegistrationInput {
  residentialCategory: ResidentialCategoryId;
  location: PropertyLocationInput;
  propertyName?: string;
  unitNumber?: string;
  numberOfUnits: number | null;
  numberOfFloors?: number | null;
  vacantUnitFloor?: number | null;
  rent: RentInformationInput;
  hasVacantUnits: VacancyAnswer;
  vacancies: ResidentialVacancyInput[];
  water: WaterInformationInput;
  electricity: ElectricityInformationInput;
  nearbyPlaces: NearbyPlaceDistanceInput[];
  entrancePhotos: HousePhotoInput[];
  buildingPhotos: HousePhotoInput[];
  photos: HousePhotoInput[];
  whatsappContacts: HouseWhatsAppContact[];
  description: string;
  ownershipRole: PropertyOwnershipRole;
  action: PropertyRegistrationAction;
}

export interface RegisteredHouseFoundation extends HouseRegistrationInput {
  id: string;
  propertyFoundationId: string;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  duplicateCandidateIds: string[];
  reviewFlags: string[];
  systemPreparation: ResidentialSystemPreparation;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const HOUSE_REGISTRATION_FOUNDATION = {
  purpose: 'Collect and organize residential property information only.',
  doesNotImplement: [
    'matching',
    'verification',
    'search ranking',
    'notifications',
    'reviews',
    'payments',
    'AI Admin Assistant logic',
    'Platform Health Monitor logic'
  ] as const,
  authorizedRoles: ['property-owner', 'property-manager', 'leasing-agent'] as const,
  blockedRoles: ['customer'] as const,
  philosophy: ['Guided', 'Step-by-step', 'Mobile-first', 'Clean', 'Professional', 'Easy to understand'] as const,
  longFormPolicy: 'Never present one long registration form. Divide registration into short logical screens.',
  adaptiveQuestionPolicy: 'Only display questions relevant to the selected residential category.',
  successMessage: 'Your residential property has been successfully registered.'
} as const;

export const RESIDENTIAL_CATEGORIES: readonly ResidentialCategoryOption[] = [
  { id: 'single-room', label: 'Single Room', description: 'A single residential room.' },
  { id: 'bedsitter', label: 'Bedsitter', description: 'A bedsitter residential unit.' },
  { id: 'one-bedroom', label: 'One Bedroom', description: 'A one bedroom residential unit.' },
  { id: 'two-bedroom', label: 'Two Bedroom', description: 'A two bedroom residential unit.' },
  { id: 'three-bedroom', label: 'Three Bedroom', description: 'A three bedroom residential unit.' },
  { id: 'four-bedroom', label: 'Four Bedroom', description: 'A four bedroom residential unit.' },
  { id: 'five-bedroom', label: 'Five Bedroom', description: 'A five bedroom residential unit.' },
  { id: 'maisonette', label: 'Maisonette', description: 'A maisonette residential unit.' },
  { id: 'bungalow', label: 'Bungalow', description: 'A bungalow residential unit.' },
  {
    id: 'mixed-residential-property',
    label: 'Mixed Residential Property',
    description: 'One property containing multiple residential unit types in the same compound.'
  }
] as const;

export const DEPOSIT_STRUCTURES = [
  { id: 'one-month', label: 'One Month' },
  { id: 'two-months', label: 'Two Months' },
  { id: 'three-months', label: 'Three Months' },
  { id: 'custom-amount', label: 'Any other amount' }
] as const;

export const WATER_AVAILABILITY_OPTIONS = [
  { id: 'daily-water', label: 'Daily Water' },
  { id: 'specific-days', label: 'Water Available on Specific Days' },
  { id: 'water-purchased-separately', label: 'Water Purchased Separately' },
  { id: 'no-water-connection', label: 'No Water Connection' }
] as const;

export const NEARBY_PLACES = [
  { id: 'primary-school', label: 'Primary School' },
  { id: 'secondary-school', label: 'Secondary School' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'shopping-centre', label: 'Shopping Centre' },
  { id: 'bus-stage', label: 'Bus Stage' },
  { id: 'market', label: 'Market' },
  { id: 'police-station', label: 'Police Station' }
] as const;

export function canRegisterHouses(role: UserRoleId): boolean {
  return canRegisterProperties(role);
}

export function isMixedResidentialProperty(category: ResidentialCategoryId): boolean {
  return category === 'mixed-residential-property';
}

export function getAllowedVacancyCategories(category: ResidentialCategoryId): readonly ResidentialCategoryOption[] {
  return isMixedResidentialProperty(category)
    ? RESIDENTIAL_CATEGORIES.filter((item) => item.id !== 'mixed-residential-property')
    : RESIDENTIAL_CATEGORIES.filter((item) => item.id === category);
}

export function waterHasConnection(availability: WaterAvailabilityId): boolean {
  return availability !== 'no-water-connection';
}
