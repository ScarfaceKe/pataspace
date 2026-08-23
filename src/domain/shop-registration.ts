import type { ElectricityInformationInput, PropertyLocationInput, PropertyOwnershipRole, PropertyRegistrationAction } from './property-registration';
import { canRegisterProperties } from './property-registration';
import type { ShopSystemPreparation } from './shop-system-preparation';
import type { UserRoleId } from './types';

export type CommercialUnitTypeId =
  | 'kiosk'
  | 'stall'
  | 'shop'
  | 'showroom'
  | 'warehouse'
  | 'godown'
  | 'container-shop'
  | 'mini-shop'
  | 'boutique'
  | 'salon-barbershop'
  | 'restaurant-cafe-space'
  | 'pharmacy-space'
  | 'supermarket-space'
  | 'hardware-shop'
  | 'office-shop-combination'
  | 'other-commercial-unit-type';
export type ShopPricingCategoryId = 'small-shop' | 'medium-shop' | 'large-shop';

export type ShopTypeId =
  | 'retail-shop'
  | 'kiosk-or-stall'
  | 'salon-or-barber-shop'
  | 'food-shop-or-restaurant'
  | 'pharmacy-or-chemist'
  | 'hardware-shop'
  | 'boutique-or-clothing-shop'
  | 'general-commercial-shop';

export type RoadVisibilityId =
  | 'facing-main-road'
  | 'along-main-road'
  | 'facing-inner-road'
  | 'along-inner-road'
  | 'inside-shopping-complex'
  | 'inside-building'
  | 'inside-estate'
  | 'other';

export type DepositStructureId = 'one-month' | 'two-months' | 'three-months' | 'custom-amount';
export type ShopVacancyAnswer = 'yes' | 'no';
export type ShopWaterAvailabilityId = 'daily-water' | 'specific-days' | 'water-purchased-separately' | 'no-water-connection';
export type ShopWaterRentInclusion = 'included' | 'paid-separately';

export type BusinessSuitabilityId =
  | 'retail'
  | 'salon-or-barber'
  | 'food-business'
  | 'boutique'
  | 'chemist-or-pharmacy'
  | 'hardware'
  | 'mpesa-or-agent-shop'
  | 'office-services'
  | 'mini-mart'
  | 'other-business';

export type ShopNearbyPlaceId = 'bus-stage' | 'market' | 'main-road' | 'shopping-centre' | 'bank' | 'hospital';

export interface CommercialUnitTypeOption { id: CommercialUnitTypeId; label: string; description: string }
export interface ShopPricingCategoryOption { id: ShopPricingCategoryId; label: string; description: string }

export interface ShopTypeOption {
  id: ShopTypeId;
  label: string;
  description: string;
}

export interface RoadVisibilityOption {
  id: RoadVisibilityId;
  label: string;
}

export interface ShopRentInformationInput {
  monthlyRent: number | null;
  depositStructure: DepositStructureId;
  depositAmount: number | null;
}

export interface ShopVacancyInput {
  monthlyRent: number | null;
  depositStructure: DepositStructureId;
  depositAmount: number | null;
  quantityAvailable: number | null;
  unitIdentifiers: string[];
}

export interface ShopWaterInformationInput {
  availability: ShopWaterAvailabilityId;
  specificDays?: string;
  rentInclusion?: ShopWaterRentInclusion;
}

export interface ShopNearbyPlaceDistanceInput {
  place: ShopNearbyPlaceId;
  approximateDistance?: string;
}

export interface ShopPhotoInput {
  fileName: string;
  represents?: 'Front of Building' | 'Shop Entrance' | 'Shop Interior' | 'Shop Frontage' | 'Gate' | 'Surrounding Environment' | 'Shared Parking or Common Areas';
}

export interface ShopWhatsAppContact {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName?: string;
}

export interface ShopRegistrationInput {
  shopSize: ShopPricingCategoryId;
  shopType: ShopTypeId[];
  commercialUnitType: CommercialUnitTypeId;
  customCommercialUnitType?: string;
  pricingCategory: ShopPricingCategoryId;
  location: PropertyLocationInput;
  roadVisibility: RoadVisibilityId;
  shopName?: string;
  unitNumber?: string;
  numberOfShopUnits: number | null;
  numberOfFloors?: number | null;
  vacantShopFloor?: number | null;
  rent: ShopRentInformationInput;
  hasVacantShopUnits: ShopVacancyAnswer;
  vacancy?: ShopVacancyInput;
  water: ShopWaterInformationInput;
  electricity: ElectricityInformationInput;
  businessSuitability: BusinessSuitabilityId[];
  nearbyPlaces: ShopNearbyPlaceDistanceInput[];
  entrancePhotos: ShopPhotoInput[];
  buildingPhotos: ShopPhotoInput[];
  photos: ShopPhotoInput[];
  whatsappContacts: ShopWhatsAppContact[];
  description: string;
  ownershipRole: PropertyOwnershipRole;
  action: PropertyRegistrationAction;
}

export interface RegisteredShopFoundation extends ShopRegistrationInput {
  id: string;
  propertyFoundationId: string;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  duplicateCandidateIds: string[];
  reviewFlags: string[];
  systemPreparation: ShopSystemPreparation;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const SHOP_REGISTRATION_FOUNDATION = {
  purpose: 'Collect shop property information accurately for future PataSpace systems.',
  authorizedRoles: ['property-owner', 'property-manager', 'leasing-agent'] as const,
  blockedRoles: ['customer'] as const,
  philosophy: ['Step-by-step', 'Adaptive', 'Professional', 'Mobile-first', 'Easy to complete'] as const,
  adaptiveQuestionPolicy: 'Only ask questions that are relevant based on previous answers.',
  successMessage: 'Your shop property has been successfully registered.',
  commercialUnitTypeAndPricingCategoryRule: {
    commercialUnitTypeDescribesSpace: true,
    commercialUnitTypeUsedForSearchFilteringMatchingAndDisplay: true,
    pricingCategoryUsedOnlyForFounderApprovedUnlockAndVerifiedAccessPricing: true,
    mustNeverBeConfused: true,
    registrantsCannotEditUnlockOrVerifiedAccessPrices: true
  },
  futureFoundationFor: [
    'Shop Match',
    'Verification',
    'Vacancy Confirmation',
    'Viewing Workflow',
    'Unlock This Listing',
    'Verified Access',
    'Reviews',
    'AI Admin Assistant',
    'Platform Health Monitor'
  ] as const
} as const;


export const COMMERCIAL_UNIT_TYPES: readonly CommercialUnitTypeOption[] = [
  { id: 'kiosk', label: 'Kiosk', description: 'A kiosk commercial space.' },
  { id: 'stall', label: 'Stall', description: 'A stall or market-style commercial space.' },
  { id: 'shop', label: 'Shop', description: 'A standard shop unit.' },
  { id: 'showroom', label: 'Showroom', description: 'A showroom for displaying goods.' },
  { id: 'warehouse', label: 'Warehouse', description: 'A warehouse commercial space.' },
  { id: 'godown', label: 'Godown', description: 'A godown or storage-oriented commercial space.' },
  { id: 'container-shop', label: 'Container Shop', description: 'A shop built from or inside a container.' },
  { id: 'mini-shop', label: 'Mini Shop', description: 'A small commercial shop.' },
  { id: 'boutique', label: 'Boutique', description: 'A boutique or fashion-oriented shop.' },
  { id: 'salon-barbershop', label: 'Salon / Barbershop', description: 'A salon or barbershop commercial space.' },
  { id: 'restaurant-cafe-space', label: 'Restaurant / Café Space', description: 'A restaurant or café space.' },
  { id: 'pharmacy-space', label: 'Pharmacy Space', description: 'A pharmacy or chemist-suitable space.' },
  { id: 'supermarket-space', label: 'Supermarket Space', description: 'A supermarket or mini-market space.' },
  { id: 'hardware-shop', label: 'Hardware Shop', description: 'A hardware-oriented commercial space.' },
  { id: 'office-shop-combination', label: 'Office-Shop Combination', description: 'A space suitable for both office and shop use.' },
  { id: 'other-commercial-unit-type', label: 'Other Commercial Unit Type', description: 'A custom commercial unit type.' }
] as const;

export const SHOP_PRICING_CATEGORIES: readonly ShopPricingCategoryOption[] = [
  { id: 'small-shop', label: 'Small Shop', description: 'A small commercial shop space, typically a single room or kiosk.' },
  { id: 'medium-shop', label: 'Medium Shop', description: 'A medium-sized shop space with room for display and storage.' },
  { id: 'large-shop', label: 'Large Shop', description: 'A large shop space with generous room for operations.' }
] as const;

export const SHOP_SIZE_OPTIONS: readonly ShopPricingCategoryOption[] = SHOP_PRICING_CATEGORIES;

export const MAX_SHOP_TYPES = 2;

export const SHOP_TYPES: readonly ShopTypeOption[] = [
  { id: 'retail-shop', label: 'Retail Shop', description: 'A shop suitable for general retail sales.' },
  { id: 'kiosk-or-stall', label: 'Kiosk or Stall', description: 'A small commercial space or stall.' },
  { id: 'salon-or-barber-shop', label: 'Salon or Barber Shop', description: 'A shop suited to beauty or grooming services.' },
  { id: 'food-shop-or-restaurant', label: 'Food Shop or Restaurant', description: 'A space suited to food sales or eating services.' },
  { id: 'pharmacy-or-chemist', label: 'Pharmacy or Chemist', description: 'A commercial space suited to a chemist or pharmacy.' },
  { id: 'hardware-shop', label: 'Hardware Shop', description: 'A shop suited to hardware or construction supplies.' },
  { id: 'boutique-or-clothing-shop', label: 'Boutique or Clothing Shop', description: 'A space suited to clothes, shoes or fashion goods.' },
  { id: 'general-commercial-shop', label: 'General Commercial Shop', description: 'A general-purpose commercial shop space.' }
] as const;

export const ROAD_VISIBILITY_OPTIONS: readonly RoadVisibilityOption[] = [
  { id: 'facing-main-road', label: 'Facing the Main Road' },
  { id: 'along-main-road', label: 'Along the Main Road' },
  { id: 'facing-inner-road', label: 'Facing an Inner Road' },
  { id: 'along-inner-road', label: 'Along an Inner Road' },
  { id: 'inside-shopping-complex', label: 'Inside a Shopping Complex' },
  { id: 'inside-building', label: 'Inside a Building' },
  { id: 'inside-estate', label: 'Inside an Estate' },
  { id: 'other', label: 'Other' }
] as const;

export const SHOP_DEPOSIT_STRUCTURES = [
  { id: 'one-month', label: 'One Month' },
  { id: 'two-months', label: 'Two Months' },
  { id: 'three-months', label: 'Three Months' },
  { id: 'custom-amount', label: 'Any custom deposit amount' }
] as const;

export const SHOP_WATER_AVAILABILITY_OPTIONS = [
  { id: 'daily-water', label: 'Daily Water' },
  { id: 'specific-days', label: 'Water on Specific Days' },
  { id: 'water-purchased-separately', label: 'Water Purchased Separately' },
  { id: 'no-water-connection', label: 'No Water Connection' }
] as const;

export const BUSINESS_SUITABILITY_OPTIONS = [
  { id: 'retail', label: 'Retail', example: 'General shop, electronics, phone accessories' },
  { id: 'salon-or-barber', label: 'Salon or Barber', example: 'Salon, barber shop, beauty services' },
  { id: 'food-business', label: 'Food Business', example: 'Café, restaurant, takeaway, bakery' },
  { id: 'boutique', label: 'Boutique', example: 'Clothes, shoes, fashion items' },
  { id: 'chemist-or-pharmacy', label: 'Chemist or Pharmacy', example: 'Chemist, pharmacy, health products' },
  { id: 'hardware', label: 'Hardware', example: 'Hardware, paints, construction supplies' },
  { id: 'mpesa-or-agent-shop', label: 'M-Pesa or Agent Shop', example: 'M-Pesa, bank agent, airtime shop' },
  { id: 'office-services', label: 'Office Services', example: 'Cyber, printing, professional services' },
  { id: 'mini-mart', label: 'Mini Mart', example: 'Mini supermarket or convenience store' },
  { id: 'other-business', label: 'Other Business', example: 'Other suitable business use' }
] as const;

export const SHOP_NEARBY_PLACES = [
  { id: 'bus-stage', label: 'Bus Stage' },
  { id: 'market', label: 'Market' },
  { id: 'main-road', label: 'Main Road' },
  { id: 'shopping-centre', label: 'Shopping Centre' },
  { id: 'bank', label: 'Bank' },
  { id: 'hospital', label: 'Hospital' }
] as const;

export const SHOP_PHOTO_GUIDANCE = [
  'The front of the building',
  'The shop entrance',
  'The shop interior',
  'The shop frontage',
  'The gate where applicable',
  'The surrounding environment',
  'Shared parking or common areas if applicable'
] as const;

export function canRegisterShops(role: UserRoleId): boolean {
  return canRegisterProperties(role);
}

export function shopWaterHasConnection(availability: ShopWaterAvailabilityId): boolean {
  return availability !== 'no-water-connection';
}
