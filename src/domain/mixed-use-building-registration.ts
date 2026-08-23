import type { ElectricityInformationInput, PropertyLocationInput, PropertyOwnershipRole, PropertyRegistrationAction } from './property-registration';
import { canRegisterProperties } from './property-registration';
import type { ResidentialCategoryId } from './house-registration';
import type { CommercialUnitTypeId, ShopPricingCategoryId, ShopTypeId, RoadVisibilityId as ShopRoadVisibilityId, BusinessSuitabilityId, ShopWaterAvailabilityId, ShopWaterRentInclusion } from './shop-registration';
import type { OfficeTypeId, OfficeRoadVisibilityId } from './office-registration';
import type { HallCategoryId, HallSizeId, HallRoadVisibilityId, HallWorkingHours } from './event-hall-registration';
import type { UserRoleId } from './types';

/* ---------- Floor options ---------- */
export type FloorLabel = 'basement' | 'ground' | 'mezzanine' | string; // string for numbered floors like "1st", "2nd"

export interface FloorOption {
  id: string;
  label: string;
}

export const FLOOR_OPTIONS: readonly FloorOption[] = [
  { id: 'basement', label: 'Basement' },
  { id: 'ground', label: 'Ground Floor' },
  { id: 'mezzanine', label: 'Mezzanine' },
  { id: '1st', label: '1st Floor' },
  { id: '2nd', label: '2nd Floor' },
  { id: '3rd', label: '3rd Floor' },
  { id: '4th', label: '4th Floor' },
  { id: '5th', label: '5th Floor' },
  { id: '6th', label: '6th Floor' },
  { id: '7th', label: '7th Floor' },
  { id: '8th', label: '8th Floor' },
  { id: '9th', label: '9th Floor' },
  { id: '10th', label: '10th Floor' },
  { id: 'rooftop', label: 'Rooftop' },
] as const;

/* ---------- Unit category (which property type this unit is) ---------- */
export type MixedUseUnitCategory = 'houses' | 'shops' | 'offices' | 'event-halls';

export const MIXED_USE_UNIT_CATEGORIES: readonly { id: MixedUseUnitCategory; label: string; icon: string; description: string }[] = [
  { id: 'houses', label: 'Residential', icon: '🏠', description: 'Rooms, bedsitters, apartments or maisonettes' },
  { id: 'shops', label: 'Shops', icon: '🏪', description: 'Retail shops, kiosks, stalls or commercial spaces' },
  { id: 'offices', label: 'Offices', icon: '🏢', description: 'Private offices, shared offices or workspaces' },
  { id: 'event-halls', label: 'Event Halls', icon: '🎉', description: 'Wedding halls, meeting halls, training halls' },
] as const;

/* ---------- Shared rent input ---------- */
export interface MixedUseRentInput {
  monthlyRent: number | null;
  depositAmount: number | null;
}

/* ---------- Water info (shops/offices/houses) ---------- */
export interface MixedUseWaterInput {
  availability: ShopWaterAvailabilityId;
  specificDays?: string;
  rentInclusion?: ShopWaterRentInclusion;
}

/* ---------- Unit-level data ---------- */
export interface MixedUseUnitInput {
  id: string;
  unitIdentifier: string;
  floor: string;
  category: MixedUseUnitCategory;

  /* Shop-specific */
  shopTypes?: ShopTypeId[];
  commercialUnitType?: CommercialUnitTypeId;
  pricingCategory?: ShopPricingCategoryId;
  roadVisibilityShop?: ShopRoadVisibilityId;
  businessSuitability?: BusinessSuitabilityId[];

  /* Office-specific */
  officeType?: OfficeTypeId;
  roadVisibilityOffice?: OfficeRoadVisibilityId;

  /* Hall-specific */
  hallCategory?: HallCategoryId;
  hallSize?: HallSizeId;
  hallCapacity?: number | null;
  bookingPrice?: number | null;
  workingHours?: HallWorkingHours[];
  roadVisibilityHall?: HallRoadVisibilityId;

  /* House-specific */
  residentialCategory?: ResidentialCategoryId;

  /* Shared */
  rent: MixedUseRentInput;
  water: MixedUseWaterInput;
  electricity: ElectricityInformationInput;
  isVacant: boolean;
  quantityAvailable: number | null;
  unitIdentifiers: string[];
}

/* ---------- WhatsApp contact ---------- */
export interface MixedUseWhatsAppContact {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName?: string;
}

/* ---------- Top-level registration input ---------- */
export interface MixedUseBuildingRegistrationInput {
  buildingName: string;
  location: PropertyLocationInput;
  description: string;
  ownershipRole: PropertyOwnershipRole;
  entrancePhotos: { fileName: string }[];
  buildingPhotos: { fileName: string }[];
  whatsappContacts: MixedUseWhatsAppContact[];
  units: MixedUseUnitInput[];
  action: PropertyRegistrationAction;
}

/* ---------- Stored record ---------- */
export interface RegisteredMixedUseBuilding extends MixedUseBuildingRegistrationInput {
  id: string;
  propertyFoundationId: string;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  status: 'draft' | 'active' | 'waiting-for-verification';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

/* ---------- Foundation ---------- */
export const MIXED_USE_BUILDING_FOUNDATION = {
  purpose: 'Register one building with multiple property categories under a single listing.',
  authorizedRoles: ['property-owner', 'property-manager', 'leasing-agent'] as const,
  blockedRoles: ['customer'] as const,
  philosophy: ['Guided', 'Step-by-step', 'Mobile-first', 'Easy to understand', 'Professional'] as const,
  longFormPolicy: 'Never present one long registration form. Break registration into logical screens.',
  successMessage: 'Your mixed-use building has been successfully registered.',
  understandingRequired: true,
  understandingCopy: 'A Mixed-Use Building is one building with different types of spaces — shops, offices, halls, and/or residential units — all under one roof and managed by one team. All units share the same location, entrance, and building photos. Each unit is registered individually with its own category, pricing, and vacancy. Customers searching for shops, offices, halls, or houses will each see the units that match their search.',
  unlockPricingRule: 'Per-unit unlock pricing. Each unit follows its own category unlock price — customers only pay to unlock the specific unit type they are interested in.',
  unitBasedUnlocking: true,
  sameLocationForAllUnits: true,
  sameBuildingPhotosForAllUnits: true,
  sameContactsForAllUnits: true,
  oneAdminApprovalCoversAllUnits: true,
  futureIntegrations: [
    'House Match', 'Shop Match', 'Office Match', 'Event Hall Match',
    'Verification', 'Vacancy Confirmation', 'Unlock This Listing', 'Verified Access',
    'Viewing Workflow', 'Reviews', 'Notifications', 'AI Admin Assistant', 'Platform Health Monitor'
  ] as const,
  doesNotImplement: ['Search Ranking', 'Payments', 'AI Admin Assistant logic', 'Platform Health Monitor logic'] as const,
} as const;

/* ---------- Helpers ---------- */
export function canRegisterMixedUseBuildings(role: UserRoleId): boolean {
  return canRegisterProperties(role);
}

export function createDefaultMixedUseUnit(): MixedUseUnitInput {
  return {
    id: crypto.randomUUID(),
    unitIdentifier: '',
    floor: 'ground',
    category: 'shops',
    rent: { monthlyRent: null, depositAmount: null },
    water: { availability: 'daily-water' },
    electricity: { isElectricityAvailable: 'yes' },
    isVacant: false,
    quantityAvailable: null,
    unitIdentifiers: [],
  };
}

export function getUnitsByCategory(units: MixedUseUnitInput[], category: MixedUseUnitCategory): MixedUseUnitInput[] {
  return units.filter((unit) => unit.category === category);
}

export function getCategorySummary(units: MixedUseUnitInput[]): Record<MixedUseUnitCategory, number> {
  const summary: Record<MixedUseUnitCategory, number> = { houses: 0, shops: 0, offices: 0, 'event-halls': 0 };
  for (const unit of units) {
    summary[unit.category] += 1;
  }
  return summary;
}

export function getVacantUnitCount(units: MixedUseUnitInput[]): number {
  return units.filter((unit) => unit.isVacant).length;
}

export function getTotalUnitCount(units: MixedUseUnitInput[]): number {
  return units.length;
}
