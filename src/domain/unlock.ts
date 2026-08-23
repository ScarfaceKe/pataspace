import type { CustomerAccessControlPreparation } from './customer-access-control';
import { buildCustomerAccessControlPreparation } from './customer-access-control';
import type { HallCategoryId } from './event-hall-registration';
import type { ResidentialCategoryId } from './house-registration';
import type { OfficeTypeId } from './office-registration';
import type { ShopTypeId } from './shop-registration';
import type { PropertyCategoryId } from './types';

export type CurrencyCode = 'KES';
export type AccessPurchaseType = 'unlock-this-listing' | 'verified-access';
export type UnlockAccessStatus = 'pending-payment' | 'active' | 'unavailable-after-purchase' | 'expired';
export const UNLOCK_THIS_LISTING_VALIDITY_HOURS = 24 as const;

export type ResidentialUnlockCategory = ResidentialCategoryId;
export type ShopUnlockCategory = 'small-shop' | 'medium-shop' | 'large-shop' | 'mixed-shop-property';
export type OfficeUnlockCategory = 'shared-office' | 'small-office' | 'medium-office' | 'large-office' | 'executive-office' | 'mixed-office-type';
export type EventHallUnlockCategory =
  | 'small-event-hall'
  | 'medium-event-hall'
  | 'large-event-hall'
  | 'conference-hall'
  | 'wedding-garden-outdoor-event-venue'
  | 'multi-purpose-hall'
  | 'mixed-hall-category';

export interface PriceAmount {
  currency: CurrencyCode;
  amount: number;
}

export interface PricingRow<TCategory extends string> {
  category: TCategory;
  label: string;
  unlockThisListing: PriceAmount;
  verifiedAccess72Hours: PriceAmount;
}

export interface UnlockTarget {
  propertyId: string;
  unitIdentifier: string;
  propertyCategory: PropertyCategoryId;
  pricingCategory: ResidentialUnlockCategory | ShopUnlockCategory | OfficeUnlockCategory | EventHallUnlockCategory;
}

export interface UnlockRemainingTime {
  expired: boolean;
  totalMillisecondsRemaining: number;
  display: string;
}

export interface UnlockAccessRecord {
  id: string;
  customerId: string;
  target: UnlockTarget;
  purchaseType: AccessPurchaseType;
  status: UnlockAccessStatus;
  price: PriceAmount;
  unlockedAt?: string;
  unlockExpiresAt?: string;
  remainingUnlockTime?: UnlockRemainingTime;
  displayStatus?: 'Unlocked' | 'Unlock Expired';
  paymentReference?: string;
  propertyBecameUnavailableAt?: string;
  accessControl: CustomerAccessControlPreparation;
}

export interface UnlockCheckoutPreparation {
  selectedPropertyOrUnit: UnlockTarget;
  price: PriceAmount;
  explainsOnlySelectedUnitIsUnlocked: true;
  canProceedToPayment: true;
  paymentProcessingImplementedInPrompt15B: true;
}

const kes = (amount: number): PriceAmount => ({ currency: 'KES', amount });

export const RESIDENTIAL_UNLOCK_PRICING: readonly PricingRow<ResidentialUnlockCategory>[] = [
  { category: 'single-room', label: 'Single Room', unlockThisListing: kes(20), verifiedAccess72Hours: kes(100) },
  { category: 'bedsitter', label: 'Bedsitter', unlockThisListing: kes(40), verifiedAccess72Hours: kes(150) },
  { category: 'one-bedroom', label: 'One Bedroom', unlockThisListing: kes(60), verifiedAccess72Hours: kes(200) },
  { category: 'two-bedroom', label: 'Two Bedroom', unlockThisListing: kes(80), verifiedAccess72Hours: kes(250) },
  { category: 'three-bedroom', label: 'Three Bedroom', unlockThisListing: kes(100), verifiedAccess72Hours: kes(300) },
  { category: 'four-bedroom', label: 'Four Bedroom', unlockThisListing: kes(120), verifiedAccess72Hours: kes(400) },
  { category: 'five-bedroom', label: 'Five Bedroom', unlockThisListing: kes(140), verifiedAccess72Hours: kes(500) },
  { category: 'maisonette', label: 'Maisonette', unlockThisListing: kes(140), verifiedAccess72Hours: kes(500) },
  { category: 'double-room', label: 'Double Room', unlockThisListing: kes(30), verifiedAccess72Hours: kes(150) },
  { category: 'bungalow', label: 'Bungalow', unlockThisListing: kes(140), verifiedAccess72Hours: kes(500) },
  { category: 'mixed-residential-property', label: 'Mixed Residential', unlockThisListing: kes(160), verifiedAccess72Hours: kes(500) }
] as const;

export const SHOP_UNLOCK_PRICING: readonly PricingRow<ShopUnlockCategory>[] = [
  { category: 'small-shop', label: 'Small Shop', unlockThisListing: kes(50), verifiedAccess72Hours: kes(250) },
  { category: 'medium-shop', label: 'Medium Shop', unlockThisListing: kes(100), verifiedAccess72Hours: kes(400) },
  { category: 'large-shop', label: 'Large Shop', unlockThisListing: kes(200), verifiedAccess72Hours: kes(700) },
  { category: 'mixed-shop-property', label: 'Mixed Shop Property', unlockThisListing: kes(100), verifiedAccess72Hours: kes(400) }
] as const;

export const OFFICE_UNLOCK_PRICING: readonly PricingRow<OfficeUnlockCategory>[] = [
  { category: 'shared-office', label: 'Shared Office', unlockThisListing: kes(50), verifiedAccess72Hours: kes(250) },
  { category: 'small-office', label: 'Small Office', unlockThisListing: kes(100), verifiedAccess72Hours: kes(500) },
  { category: 'medium-office', label: 'Medium Office', unlockThisListing: kes(200), verifiedAccess72Hours: kes(700) },
  { category: 'large-office', label: 'Large Office', unlockThisListing: kes(300), verifiedAccess72Hours: kes(1000) },
  { category: 'executive-office', label: 'Executive Office', unlockThisListing: kes(500), verifiedAccess72Hours: kes(1500) },
  { category: 'mixed-office-type', label: 'Mixed Office Property', unlockThisListing: kes(200), verifiedAccess72Hours: kes(700) }
] as const;

export const EVENT_HALL_UNLOCK_PRICING: readonly PricingRow<EventHallUnlockCategory>[] = [
  { category: 'small-event-hall', label: 'Small Event Hall', unlockThisListing: kes(30), verifiedAccess72Hours: kes(60) },
  { category: 'medium-event-hall', label: 'Medium Event Hall', unlockThisListing: kes(50), verifiedAccess72Hours: kes(100) },
  { category: 'large-event-hall', label: 'Large Event Hall', unlockThisListing: kes(100), verifiedAccess72Hours: kes(200) },
  { category: 'conference-hall', label: 'Conference Hall', unlockThisListing: kes(100), verifiedAccess72Hours: kes(200) },
  { category: 'wedding-garden-outdoor-event-venue', label: 'Wedding Garden / Outdoor Event Venue', unlockThisListing: kes(100), verifiedAccess72Hours: kes(200) },
  { category: 'multi-purpose-hall', label: 'Multi-Purpose Hall', unlockThisListing: kes(50), verifiedAccess72Hours: kes(100) },
  { category: 'mixed-hall-category', label: 'Mixed Event Venue', unlockThisListing: kes(50), verifiedAccess72Hours: kes(100) }
] as const;

export const UNLOCK_THIS_LISTING_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  platformManagedPricing: true,
  registrantsCanConfigurePricing: false,
  unitBasedUnlocking: true,
  unlockingOneUnitDoesNotUnlockOtherUnits: true,
  verifiedAccessMayGrantMultipleMatches: true,
  beforeUnlockFollowsCustomerAccessControlStandard: true,
  afterUnlockAllowsPremiumInformation: true,
  customerNeverRepurchasesSameUnitWhileAccessValid: true,
  propertyUnavailableAfterUnlockPreservesAccessHistory: true,
  myUnlockedPropertiesDisplaysRemainingTime: true,
  expiredUnlocksRemainVisibleInHistory: true,
  expiredUnlocksHidePremiumInformation: true,
  expiredUnlocksDisableViewingRequests: true,
  unlockThisListingAlwaysAvailableEvenWhenVerifiedAccessRecommended: true,
  validityPeriodHours: 24,
  premiumAccessBeginsImmediatelyAfterSuccessfulPayment: true,
  expiresAutomaticallyAfter24Hours: true,
  paymentProcessingImplementedInPrompt15B: true,
  futureIntegrations: ['House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Viewing Workflow', 'Property Registration', 'Property Verification', 'Notifications', 'Reviews'] as const
} as const;

function findPrice<T extends string>(rows: readonly PricingRow<T>[], category: T, purchaseType: AccessPurchaseType): PriceAmount {
  const row = rows.find((item) => item.category === category);
  if (!row) throw new Error(`Unknown pricing category: ${category}`);
  return purchaseType === 'unlock-this-listing' ? row.unlockThisListing : row.verifiedAccess72Hours;
}

export function getResidentialUnlockPrice(category: ResidentialUnlockCategory, purchaseType: AccessPurchaseType = 'unlock-this-listing'): PriceAmount {
  return findPrice(RESIDENTIAL_UNLOCK_PRICING, category, purchaseType);
}

export function getShopUnlockPrice(category: ShopUnlockCategory, purchaseType: AccessPurchaseType = 'unlock-this-listing'): PriceAmount {
  return findPrice(SHOP_UNLOCK_PRICING, category, purchaseType);
}

export function getOfficeUnlockPrice(category: OfficeUnlockCategory, purchaseType: AccessPurchaseType = 'unlock-this-listing'): PriceAmount {
  return findPrice(OFFICE_UNLOCK_PRICING, category, purchaseType);
}

export function getEventHallUnlockPrice(category: EventHallUnlockCategory, purchaseType: AccessPurchaseType = 'unlock-this-listing'): PriceAmount {
  return findPrice(EVENT_HALL_UNLOCK_PRICING, category, purchaseType);
}

export function resolveShopPricingCategory(shopType: ShopTypeId): ShopUnlockCategory {
  if (shopType === 'kiosk-or-stall') return 'small-shop';
  if (shopType === 'hardware-shop') return 'large-shop';
  return 'medium-shop';
}

export function resolveOfficePricingCategory(officeType: OfficeTypeId): OfficeUnlockCategory {
  if (officeType === 'shared-office') return 'shared-office';
  if (officeType === 'medium-office') return 'medium-office';
  if (officeType === 'large-office') return 'large-office';
  return 'small-office';
}

export function resolveEventHallPricingCategory(input: { hallCategory?: HallCategoryId; hallCapacity?: number | null }): EventHallUnlockCategory {
  if (input.hallCategory === 'meeting-hall' || input.hallCategory === 'training-hall') return 'conference-hall';
  if (input.hallCategory === 'general-event-hall' || input.hallCategory === 'community-hall') return 'multi-purpose-hall';
  if (input.hallCategory === 'wedding-hall') return 'wedding-garden-outdoor-event-venue';
  if ((input.hallCapacity ?? 0) > 300) return 'large-event-hall';
  if ((input.hallCapacity ?? 0) > 100) return 'medium-event-hall';
  return 'small-event-hall';
}

export function getUnlockPriceForTarget(target: UnlockTarget, purchaseType: AccessPurchaseType = 'unlock-this-listing'): PriceAmount {
  if (target.propertyCategory === 'houses') return getResidentialUnlockPrice(target.pricingCategory as ResidentialUnlockCategory, purchaseType);
  if (target.propertyCategory === 'shops') return getShopUnlockPrice(target.pricingCategory as ShopUnlockCategory, purchaseType);
  if (target.propertyCategory === 'offices') return getOfficeUnlockPrice(target.pricingCategory as OfficeUnlockCategory, purchaseType);
  return getEventHallUnlockPrice(target.pricingCategory as EventHallUnlockCategory, purchaseType);
}

export function prepareUnlockCheckout(target: UnlockTarget): UnlockCheckoutPreparation {
  return {
    selectedPropertyOrUnit: target,
    price: getUnlockPriceForTarget(target, 'unlock-this-listing'),
    explainsOnlySelectedUnitIsUnlocked: true,
    canProceedToPayment: true,
    paymentProcessingImplementedInPrompt15B: true
  };
}

export function getUnlockExpiryFromPurchase(unlockedAt: string): string {
  return new Date(new Date(unlockedAt).getTime() + UNLOCK_THIS_LISTING_VALIDITY_HOURS * 60 * 60 * 1000).toISOString();
}

export function formatUnlockRemainingTime(expiresAt: string | undefined, now: Date = new Date()): UnlockRemainingTime {
  if (!expiresAt) return { expired: true, totalMillisecondsRemaining: 0, display: 'Unlock Expired' };
  const remaining = Math.max(new Date(expiresAt).getTime() - now.getTime(), 0);
  if (remaining <= 0) return { expired: true, totalMillisecondsRemaining: 0, display: 'Unlock Expired' };
  const totalMinutes = Math.ceil(remaining / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return { expired: false, totalMillisecondsRemaining: remaining, display: `${days} ${days === 1 ? 'Day' : 'Days'} ${hours} ${hours === 1 ? 'Hour' : 'Hours'} Remaining` };
  if (hours > 0) return { expired: false, totalMillisecondsRemaining: remaining, display: `${hours} ${hours === 1 ? 'Hour' : 'Hours'} Remaining` };
  return { expired: false, totalMillisecondsRemaining: remaining, display: `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'} Remaining` };
}

export function applyUnlockAccessState(record: UnlockAccessRecord, now: Date = new Date()): UnlockAccessRecord {
  const remainingUnlockTime = formatUnlockRemainingTime(record.unlockExpiresAt, now);
  const expired = remainingUnlockTime.expired || record.status === 'expired';
  return {
    ...record,
    status: expired ? 'expired' : record.status,
    remainingUnlockTime,
    displayStatus: expired ? 'Unlock Expired' : 'Unlocked',
    accessControl: expired
      ? {
          beforeAccess: buildCustomerAccessControlPreparation().beforeAccess,
          afterAccess: { allPhotosUnlocked: false, phoneNumberUnlocked: false, callUnlocked: false, whatsappUnlocked: false, requestViewingUnlocked: false }
        }
      : record.accessControl
  };
}

export function isUnlockAccessActive(record: UnlockAccessRecord, now: Date = new Date()): boolean {
  const withState = applyUnlockAccessState(record, now);
  return (withState.status === 'active' || withState.status === 'unavailable-after-purchase') && !withState.remainingUnlockTime?.expired;
}

export function buildActiveUnlockRecord(input: { id: string; customerId: string; target: UnlockTarget; paymentReference: string; unlockedAt: string }): UnlockAccessRecord {
  const unlockExpiresAt = getUnlockExpiryFromPurchase(input.unlockedAt);
  return {
    id: input.id,
    customerId: input.customerId,
    target: input.target,
    purchaseType: 'unlock-this-listing',
    status: 'active',
    price: getUnlockPriceForTarget(input.target, 'unlock-this-listing'),
    unlockedAt: input.unlockedAt,
    unlockExpiresAt,
    remainingUnlockTime: formatUnlockRemainingTime(unlockExpiresAt, new Date(input.unlockedAt)),
    displayStatus: 'Unlocked',
    paymentReference: input.paymentReference,
    accessControl: buildCustomerAccessControlPreparation()
  };
}
