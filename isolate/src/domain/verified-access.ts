import { buildCustomerAccessControlPreparation, type CustomerAccessControlPreparation } from './customer-access-control';
import type { VerifiedAccessIntelligenceSnapshot } from './verified-access-intelligence';
import type { AccessPurchaseType, EventHallUnlockCategory, OfficeUnlockCategory, PriceAmount, ResidentialUnlockCategory, ShopUnlockCategory, UnlockTarget } from './unlock';
import { getEventHallUnlockPrice, getOfficeUnlockPrice, getResidentialUnlockPrice, getShopUnlockPrice } from './unlock';
import type { PropertyCategoryId } from './types';

export type VerifiedAccessStatus = 'pending-payment' | 'active' | 'expired';
export type VerifiedAccessPricingCategory = ResidentialUnlockCategory | ShopUnlockCategory | OfficeUnlockCategory | EventHallUnlockCategory;

export interface VerifiedAccessScope {
  propertyCategory: PropertyCategoryId;
  pricingCategory: VerifiedAccessPricingCategory;
  searchSignature: string;
  qualifyingTargets: UnlockTarget[];
}

export interface VerifiedAccessRecord {
  id: string;
  customerId: string;
  purchaseType: Extract<AccessPurchaseType, 'verified-access'>;
  status: VerifiedAccessStatus;
  scope: VerifiedAccessScope;
  price: PriceAmount;
  accessDurationHours: 72;
  activatedAt?: string;
  expiresAt?: string;
  paymentReference?: string;
  accessControl: CustomerAccessControlPreparation;
  intelligence?: VerifiedAccessIntelligenceSnapshot;
}

export interface VerifiedAccessCheckoutPreparation {
  purchaseType: 'Verified Access';
  accessDuration: '72 Hours';
  amountToPay: PriceAmount;
  includes: readonly [
    'Premium access to qualifying properties in this approved recommendation',
    'All uploaded property photos for qualifying properties',
    'Contact phone numbers for qualifying properties',
    'WhatsApp contact for qualifying properties',
    'Request Viewing through PataSpace for qualifying properties'
  ];
  scope: VerifiedAccessScope;
  customerUnderstandsPurchase: true;
  paymentProcessingImplementedElsewhere: true;
}

export const VERIFIED_ACCESS_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  noPropertyCategoryMayBypass: true,
  complementsUnlockThisListing: true,
  neverReplacesUnlockThisListing: true,
  customerAlwaysRetainsBothOptions: true,
  accessDurationHours: 72,
  pricingSource: 'Founder-approved centrally managed pricing tables from Master Prompt 15A',
  customerMayNeverEnterAmount: true,
  registrantsMayNeverModifyPricing: true,
  eligibility: {
    oneOrTwoSuitablePropertiesPrioritizeUnlockThisListing: true,
    severalSuitablePropertiesRecommendVerifiedAccess: true,
    unlockThisListingStillAvailableForEveryIndividualProperty: true
  },
  accessScope: {
    onlyPropertiesCoveredByApprovedRecommendation: true,
    neverUnlocksUnrelatedPropertiesOutsideApplicableSearchResults: true
  },
  premiumInformation: [
    'All uploaded property photos',
    'Property Owner phone numbers',
    'Property Manager phone numbers',
    'Leasing Agent phone numbers',
    'WhatsApp contact',
    'Request Viewing through the approved Viewing Workflow'
  ] as const,
  security: {
    neverExposePremiumInformationBeforeSuccessfulPayment: true,
    customerAccessControlStandardFullyEnforced: true
  },
  activation: {
    immediatelyAfterSuccessfulPayment: true,
    applyPremiumPermissions: true,
    displayConfirmation: true,
    noManualRefreshRequired: true
  },
  futureIntegrations: ['Unlock This Listing', 'Payment System', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Customer Access Control Standard', 'Viewing Workflow', 'Property Registration', 'Notifications'] as const
} as const;

export function isVerifiedAccessRecommended(qualifiedResultCount: number): boolean {
  return qualifiedResultCount > 2;
}

export function getVerifiedAccessPrice(propertyCategory: PropertyCategoryId, pricingCategory: VerifiedAccessPricingCategory): PriceAmount {
  if (propertyCategory === 'houses') return getResidentialUnlockPrice(pricingCategory as ResidentialUnlockCategory, 'verified-access');
  if (propertyCategory === 'shops') return getShopUnlockPrice(pricingCategory as ShopUnlockCategory, 'verified-access');
  if (propertyCategory === 'offices') return getOfficeUnlockPrice(pricingCategory as OfficeUnlockCategory, 'verified-access');
  return getEventHallUnlockPrice(pricingCategory as EventHallUnlockCategory, 'verified-access');
}

export function prepareVerifiedAccessCheckout(scope: VerifiedAccessScope): VerifiedAccessCheckoutPreparation {
  return {
    purchaseType: 'Verified Access',
    accessDuration: '72 Hours',
    amountToPay: getVerifiedAccessPrice(scope.propertyCategory, scope.pricingCategory),
    includes: [
      'Premium access to qualifying properties in this approved recommendation',
      'All uploaded property photos for qualifying properties',
      'Contact phone numbers for qualifying properties',
      'WhatsApp contact for qualifying properties',
      'Request Viewing through PataSpace for qualifying properties'
    ],
    scope,
    customerUnderstandsPurchase: true,
    paymentProcessingImplementedElsewhere: true
  };
}

export function buildActiveVerifiedAccessRecord(input: { id: string; customerId: string; scope: VerifiedAccessScope; paymentReference: string; activatedAt: string }): VerifiedAccessRecord {
  const expiresAt = new Date(new Date(input.activatedAt).getTime() + 72 * 60 * 60 * 1000).toISOString();
  return {
    id: input.id,
    customerId: input.customerId,
    purchaseType: 'verified-access',
    status: 'active',
    scope: input.scope,
    price: getVerifiedAccessPrice(input.scope.propertyCategory, input.scope.pricingCategory),
    accessDurationHours: 72,
    activatedAt: input.activatedAt,
    expiresAt,
    paymentReference: input.paymentReference,
    accessControl: buildCustomerAccessControlPreparation()
  };
}

export function targetInVerifiedAccessScope(target: UnlockTarget, scope: VerifiedAccessScope): boolean {
  return scope.qualifyingTargets.some((item) => item.propertyId === target.propertyId && item.unitIdentifier === target.unitIdentifier && item.propertyCategory === target.propertyCategory);
}
