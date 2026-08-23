import type { OfficeSystemPreparation } from './office-system-preparation';
import type { ElectricityInformationInput, PropertyLocationInput, PropertyOwnershipRole, PropertyRegistrationAction } from './property-registration';
import { canRegisterProperties } from './property-registration';
import type { UserRoleId } from './types';

export type OfficeTypeId = 'private-office' | 'shared-office' | 'small-office' | 'medium-office' | 'large-office';
export type OfficeRoadVisibilityId =
  | 'facing-main-road'
  | 'along-main-road'
  | 'facing-inner-road'
  | 'along-inner-road'
  | 'inside-office-building'
  | 'inside-commercial-complex'
  | 'inside-estate'
  | 'other';
export type OfficeDepositStructureId = 'one-month' | 'two-months' | 'three-months' | 'custom-amount';
export type OfficeVacancyAnswer = 'yes' | 'no';
export type OfficeWaterAvailabilityId = 'daily-water' | 'specific-days' | 'water-purchased-separately' | 'no-water-connection';
export type OfficeWaterRentInclusion = 'included' | 'paid-separately';
export type OfficeNearbyPlaceId = 'bus-stage' | 'main-road' | 'shopping-centre' | 'bank' | 'hospital';

export interface OfficeTypeOption { id: OfficeTypeId; label: string; description: string }
export interface OfficeRoadVisibilityOption { id: OfficeRoadVisibilityId; label: string }
export interface OfficeRentInformationInput { monthlyRent: number | null; depositStructure: OfficeDepositStructureId; depositAmount: number | null }
export interface OfficeVacancyInput { monthlyRent: number | null; depositStructure: OfficeDepositStructureId; depositAmount: number | null; quantityAvailable: number | null; unitIdentifiers: string[] }
export interface OfficeWaterInformationInput { availability: OfficeWaterAvailabilityId; specificDays?: string; rentInclusion?: OfficeWaterRentInclusion }
export interface OfficeNearbyPlaceDistanceInput { place: OfficeNearbyPlaceId; approximateDistance?: string }
export interface OfficePhotoInput { fileName: string; represents?: 'Front of Building' | 'Office Entrance' | 'Office Interior' | 'Building Frontage' | 'Gate' | 'Parking Area' | 'Shared Reception or Common Areas' | 'Surrounding Environment' }

export interface OfficeWhatsAppContact {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName?: string;
}

export interface OfficeRegistrationInput {
  officeType: OfficeTypeId;
  location: PropertyLocationInput;
  roadVisibility: OfficeRoadVisibilityId;
  officeName?: string;
  unitNumber?: string;
  numberOfOfficeUnits: number | null;
  numberOfFloors?: number | null;
  vacantOfficeFloor?: number | null;
  rent: OfficeRentInformationInput;
  hasVacantOfficeUnits: OfficeVacancyAnswer;
  vacancy?: OfficeVacancyInput;
  water: OfficeWaterInformationInput;
  electricity: ElectricityInformationInput;
  nearbyPlaces: OfficeNearbyPlaceDistanceInput[];
  entrancePhotos: OfficePhotoInput[];
  buildingPhotos: OfficePhotoInput[];
  photos: OfficePhotoInput[];
  whatsappContacts: OfficeWhatsAppContact[];
  description: string;
  ownershipRole: PropertyOwnershipRole;
  action: PropertyRegistrationAction;
}

export interface RegisteredOfficeFoundation extends OfficeRegistrationInput {
  id: string;
  propertyFoundationId: string;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  duplicateCandidateIds: string[];
  reviewFlags: string[];
  systemPreparation: OfficeSystemPreparation;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const OFFICE_REGISTRATION_FOUNDATION = {
  purpose: 'Collect and organize office property information only.',
  authorizedRoles: ['property-owner', 'property-manager', 'leasing-agent'] as const,
  blockedRoles: ['customer'] as const,
  philosophy: ['Guided', 'Step-by-step', 'Mobile-first', 'Professional', 'Simple', 'Easy to complete'] as const,
  progressIndicatorRequired: true,
  successMessage: 'Your office property has been successfully registered.',
  doesNotImplement: ['Office Match', 'Verification', 'Search Ranking', 'Notifications', 'Reviews', 'Payments', 'AI Admin Assistant logic', 'Platform Health Monitor logic'] as const
} as const;

export const OFFICE_TYPES: readonly OfficeTypeOption[] = [
  { id: 'private-office', label: 'Private Office', description: 'A private office space for one person or a team.' },
  { id: 'shared-office', label: 'Shared Office', description: 'A shared office or coworking-style space.' },
  { id: 'small-office', label: 'Small Office', description: 'A compact office for a small team.' },
  { id: 'medium-office', label: 'Medium Office', description: 'A medium-sized office for a growing team.' },
  { id: 'large-office', label: 'Large Office', description: 'A larger office space for bigger teams or operations.' }
] as const;

export const OFFICE_ROAD_VISIBILITY_OPTIONS: readonly OfficeRoadVisibilityOption[] = [
  { id: 'facing-main-road', label: 'Facing the Main Road' },
  { id: 'along-main-road', label: 'Along the Main Road' },
  { id: 'facing-inner-road', label: 'Facing an Inner Road' },
  { id: 'along-inner-road', label: 'Along an Inner Road' },
  { id: 'inside-office-building', label: 'Inside an Office Building' },
  { id: 'inside-commercial-complex', label: 'Inside a Commercial Complex' },
  { id: 'inside-estate', label: 'Inside an Estate' },
  { id: 'other', label: 'Other' }
] as const;

export const OFFICE_DEPOSIT_STRUCTURES = [
  { id: 'one-month', label: 'One Month' },
  { id: 'two-months', label: 'Two Months' },
  { id: 'three-months', label: 'Three Months' },
  { id: 'custom-amount', label: 'Any custom deposit amount' }
] as const;

export const OFFICE_WATER_AVAILABILITY_OPTIONS = [
  { id: 'daily-water', label: 'Daily Water' },
  { id: 'specific-days', label: 'Water Available on Specific Days' },
  { id: 'water-purchased-separately', label: 'Water Purchased Separately' },
  { id: 'no-water-connection', label: 'No Water Connection' }
] as const;

export const OFFICE_NEARBY_PLACES = [
  { id: 'bus-stage', label: 'Bus Stage' },
  { id: 'main-road', label: 'Main Road' },
  { id: 'shopping-centre', label: 'Shopping Centre' },
  { id: 'bank', label: 'Bank' },
  { id: 'hospital', label: 'Hospital' }
] as const;

export const OFFICE_PHOTO_GUIDANCE = [
  'Front of the building',
  'Office entrance',
  'Office interior',
  'Building frontage',
  'Gate where applicable',
  'Parking area if applicable',
  'Shared reception or common areas if applicable',
  'Surrounding environment'
] as const;

export function canRegisterOffices(role: UserRoleId): boolean { return canRegisterProperties(role); }
export function officeWaterHasConnection(availability: OfficeWaterAvailabilityId): boolean { return availability !== 'no-water-connection'; }
