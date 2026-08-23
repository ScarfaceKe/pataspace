import type { UnlockAccessRecord } from './unlock';
import type { PataSpaceNotification } from './notifications';
import type { PropertyReview } from './reviews';
import type { VerifiedAccessRecord } from './verified-access';
import type { ViewingRequestRecord } from './viewing';
import type { PropertyCategoryId } from './types';

export type PaymentStatus = 'successful' | 'failed' | 'pending';
export type PurchaseType = 'unlock-this-listing' | 'verified-access';

export interface SavedPropertyRecord {
  id: string;
  customerId: string;
  propertyId: string;
  unitIdentifier?: string;
  propertyCategory: PropertyCategoryId;
  propertySummary: string;
  currentPropertyStatus: string;
  twoCoverPhotos: string[];
  unlockThisListingAvailable: true;
  verifiedAccessRecommendationAvailable: boolean;
  premiumInformationUnlocked: false;
  savedAt: string;
}

export interface CustomerSearchHistoryRecord {
  id: string;
  customerId: string;
  matchType: 'house' | 'shop' | 'office' | 'event-hall';
  filters: Record<string, unknown>;
  searchedAt: string;
  privateToCustomer: true;
}

export interface CustomerPaymentRecord {
  id: string;
  customerId: string;
  purchaseType: PurchaseType;
  propertyId?: string;
  unitIdentifier?: string;
  propertyCategory?: PropertyCategoryId;
  amountPaid: { currency: 'KES'; amount: number };
  paymentDate: string;
  paymentStatus: PaymentStatus;
  transactionReference: string;
}

export interface CustomerReceiptRecord {
  id: string;
  customerId: string;
  paymentId: string;
  transactionReference: string;
  receiptDate: string;
  downloadable: true;
}

export interface CustomerDashboardSnapshot {
  customerId: string;
  profile: {
    fullName: string;
    phoneNumber: string;
    email: string;
    profilePhoto?: string;
    preferredNotificationSettingsPrepared: true;
    passwordManagementPrepared: true;
  };
  savedProperties: SavedPropertyRecord[];
  unlockedProperties: UnlockAccessRecord[];
  verifiedAccess: VerifiedAccessRecord[];
  viewingRequests: ViewingRequestRecord[];
  reviews: PropertyReview[];
  notifications: PataSpaceNotification[];
  payments: CustomerPaymentRecord[];
  receipts: CustomerReceiptRecord[];
  searchHistory: CustomerSearchHistoryRecord[];
}

export const CUSTOMER_DASHBOARD_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  quickAccessSections: [
    'My Profile',
    'My Saved Properties',
    'My Unlocked Properties',
    'My Verified Access',
    'My Viewing Requests',
    'My Reviews',
    'My Notifications',
    'My Payments',
    'My Receipts',
    'My Account Settings',
    'Search History'
  ] as const,
  myVerifiedAccessDisplay: {
    purchaseDate: true,
    expiryDate: true,
    remainingTimeLiveCountdown: true,
    coveredPropertyCategory: true,
    quickAccessToEligibleProperties: true,
    inactiveStateClearlyDisplayed: true
  },
  myUnlockedPropertiesDisplay: {
    propertyOrUnitIdentifier: true,
    propertyCategory: true,
    unlockDate: true,
    unlockExpiryDate: true,
    remainingUnlockTimeLiveCountdown: true,
    currentPropertyStatus: true,
    contactInformationAfterAccess: true,
    quickCall: true,
    quickWhatsApp: true,
    quickRequestViewing: true,
    expiredUnlockDisplayStatus: 'Unlock Expired',
    expiredUnlocksRemainVisibleWithHistory: true
  },
  savedPropertiesNeverUnlockPremiumInformation: true,
  dashboardSecurity: {
    customersOnlyAccessOwnDashboardInformation: true,
    neverViewOtherCustomersPurchases: true,
    neverViewOtherCustomersNotifications: true,
    neverViewOtherCustomersReceipts: true,
    neverViewOtherCustomersViewingRequests: true,
    neverViewOtherCustomersSavedProperties: true,
    neverViewOtherCustomersReviews: true,
    neverViewOtherCustomersSearchHistory: true
  },
  aiAdminAssistantHealthMonitoring: {
    detectMissingPaymentRecords: true,
    detectFailedReceiptGeneration: true,
    detectBrokenViewingLinks: true,
    detectNotificationDeliveryFailures: true,
    detectSynchronisationIssues: true,
    assistsAdministratorsWithoutInterruptingCustomers: true
  },
  integrations: [
    'Authentication',
    'Property Registration',
    'House Match',
    'Shop Match',
    'Office Match',
    'Event Hall Match',
    'Unlock This Listing',
    'Verified Access',
    'Payment System',
    'Viewing Workflow',
    'Reviews & Ratings',
    'Notifications',
    'Customer Accounts',
    'AI Admin Assistant'
  ] as const
} as const;
