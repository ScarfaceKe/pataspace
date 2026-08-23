import type { UnlockTarget } from './unlock';
import type { VerifiedAccessRecord, VerifiedAccessScope } from './verified-access';

export type VerifiedAccessNotificationType = 'activated' | 'expires-in-24-hours' | 'expires-in-1-hour' | 'expired';
export type VerifiedAccessPropertyStatus = 'available' | 'occupied' | 'unavailable' | 'waiting-for-verification' | 'temporarily-unavailable';

export interface VerifiedAccessRemainingTime {
  expired: boolean;
  totalMillisecondsRemaining: number;
  display: string;
}

export interface VerifiedAccessNotificationScheduleItem {
  type: VerifiedAccessNotificationType;
  message: string;
  nonSpam: true;
}

export interface VerifiedAccessIntelligenceSnapshot {
  activeAccessIndicator: 'Verified Access Active' | 'Verified Access Expired';
  remainingTime: VerifiedAccessRemainingTime;
  premiumAccess: {
    allUploadedPhotos: boolean;
    propertyOwnerPhoneNumbers: boolean;
    propertyManagerPhoneNumbers: boolean;
    leasingAgentPhoneNumbers: boolean;
    callContactPerson: boolean;
    whatsappConversation: boolean;
    requestViewingThroughPataSpace: boolean;
  };
  customerAccessControlEnforced: true;
  accessRecovery: {
    survivesLogout: true;
    survivesLogin: true;
    survivesDeviceChange: true;
    survivesApplicationRestart: true;
    survivesTemporaryNetworkInterruption: true;
  };
  purchaseProtection: {
    preventsDuplicateVerifiedAccessForSameScope: true;
    showAlreadyActiveWithRemainingTime: true;
  };
  expiryManagement: {
    automaticallyRemovesPremiumAccess: boolean;
    hidesContactInformationAfterExpiry: boolean;
    hidesAdditionalPhotosAfterExpiry: boolean;
    disablesViewingRequestsAfterExpiry: boolean;
    returnsCardsToPublicView: boolean;
    noManualActionRequired: true;
  };
  security: {
    cannotManuallyExtend: true;
    cannotTransferBetweenCustomerAccounts: true;
    premiumInformationProtectedWithoutActiveEntitlement: true;
    unlockThisListingStillWorksAlongsideVerifiedAccess: true;
  };
}

export const VERIFIED_ACCESS_NOTIFICATION_SCHEDULE: readonly VerifiedAccessNotificationScheduleItem[] = [
  {
    type: 'activated',
    message: 'Verified Access is now active for 72 hours.',
    nonSpam: true
  },
  {
    type: 'expires-in-24-hours',
    message: 'Your Verified Access expires in 24 hours.',
    nonSpam: true
  },
  {
    type: 'expires-in-1-hour',
    message: 'Your Verified Access expires in 1 hour.',
    nonSpam: true
  },
  {
    type: 'expired',
    message: 'Your Verified Access has expired. Premium information is now locked until new access is purchased.',
    nonSpam: true
  }
] as const;

export const VERIFIED_ACCESS_INTELLIGENCE = {
  complementsUnlockThisListing: true,
  neverReplacesUnlockThisListing: true,
  unlockThisListingAlwaysAvailable: true,
  recommendationLogic: {
    oneOrTwoSuitablePropertiesPrioritizeUnlock: true,
    severalSuitablePropertiesRecommendVerifiedAccess: true,
    stillDisplayUnlockOnEveryCard: true,
    customerAlwaysRetainsBothOptions: true
  },
  activation: {
    immediatelyAfterSuccessfulPayment: true,
    appliesPremiumPermissions: true,
    displaysSuccessConfirmation: true,
    noPageRefreshRequired: true
  },
  expiry: {
    durationHours: 72,
    automaticExpiry: true,
    noManualExtension: true
  },
  integration: ['Unlock This Listing', 'Payment System', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Customer Access Control Standard', 'Viewing Workflow', 'Notifications', 'Customer Accounts'] as const
} as const;

export function formatVerifiedAccessRemainingTime(expiresAt: string | undefined, now: Date = new Date()): VerifiedAccessRemainingTime {
  if (!expiresAt) return { expired: true, totalMillisecondsRemaining: 0, display: 'Expired' };
  const remaining = Math.max(new Date(expiresAt).getTime() - now.getTime(), 0);
  if (remaining <= 0) return { expired: true, totalMillisecondsRemaining: 0, display: 'Expired' };
  const totalMinutes = Math.ceil(remaining / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return { expired: false, totalMillisecondsRemaining: remaining, display: `${days} ${days === 1 ? 'Day' : 'Days'} ${hours} ${hours === 1 ? 'Hour' : 'Hours'} Remaining` };
  if (hours > 0) return { expired: false, totalMillisecondsRemaining: remaining, display: `${hours} ${hours === 1 ? 'Hour' : 'Hours'} Remaining` };
  return { expired: false, totalMillisecondsRemaining: remaining, display: `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'} Remaining` };
}

export function buildVerifiedAccessIntelligenceSnapshot(record: VerifiedAccessRecord, now: Date = new Date()): VerifiedAccessIntelligenceSnapshot {
  const remainingTime = formatVerifiedAccessRemainingTime(record.expiresAt, now);
  const active = record.status === 'active' && !remainingTime.expired;
  return {
    activeAccessIndicator: active ? 'Verified Access Active' : 'Verified Access Expired',
    remainingTime,
    premiumAccess: {
      allUploadedPhotos: active,
      propertyOwnerPhoneNumbers: active,
      propertyManagerPhoneNumbers: active,
      leasingAgentPhoneNumbers: active,
      callContactPerson: active,
      whatsappConversation: active,
      requestViewingThroughPataSpace: active
    },
    customerAccessControlEnforced: true,
    accessRecovery: {
      survivesLogout: true,
      survivesLogin: true,
      survivesDeviceChange: true,
      survivesApplicationRestart: true,
      survivesTemporaryNetworkInterruption: true
    },
    purchaseProtection: {
      preventsDuplicateVerifiedAccessForSameScope: true,
      showAlreadyActiveWithRemainingTime: true
    },
    expiryManagement: {
      automaticallyRemovesPremiumAccess: !active,
      hidesContactInformationAfterExpiry: !active,
      hidesAdditionalPhotosAfterExpiry: !active,
      disablesViewingRequestsAfterExpiry: !active,
      returnsCardsToPublicView: !active,
      noManualActionRequired: true
    },
    security: {
      cannotManuallyExtend: true,
      cannotTransferBetweenCustomerAccounts: true,
      premiumInformationProtectedWithoutActiveEntitlement: true,
      unlockThisListingStillWorksAlongsideVerifiedAccess: true
    }
  };
}

export function targetIsCoveredByVerifiedAccess(target: UnlockTarget, scope: VerifiedAccessScope): boolean {
  return scope.qualifyingTargets.some((item) => item.propertyId === target.propertyId && item.unitIdentifier === target.unitIdentifier && item.propertyCategory === target.propertyCategory);
}
