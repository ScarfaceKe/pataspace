import { randomUUID } from 'node:crypto';
import type { AuthProfileFoundation } from '@/domain/auth';
import type { CustomerDashboardSnapshot, CustomerSearchHistoryRecord, SavedPropertyRecord } from '@/domain/customer-dashboard';
import { expireElapsedUnlockAccessRecords } from '@/server/unlock/service';
import { expireElapsedVerifiedAccessRecords } from '@/server/verified-access/service';
import { getViewingHistoryForCustomer } from '@/server/viewings/service';
import { readReviewStore } from '@/server/reviews/store';
import { listNotifications } from '@/server/notifications/service';
import { readCustomerDashboardStore, writeCustomerDashboardStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

export async function getCustomerDashboardSnapshot(profile: AuthProfileFoundation): Promise<CustomerDashboardSnapshot> {
  const [dashboard, unlocks, verifiedAccess, viewings, reviewsStore, notifications] = await Promise.all([
    readCustomerDashboardStore(),
    expireElapsedUnlockAccessRecords(),
    expireElapsedVerifiedAccessRecords(),
    getViewingHistoryForCustomer(profile.userId),
    readReviewStore(),
    listNotifications(profile.userId)
  ]);
  return {
    customerId: profile.userId,
    profile: {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      email: profile.email,
      preferredNotificationSettingsPrepared: true,
      passwordManagementPrepared: true
    },
    savedProperties: dashboard.savedProperties.filter((item) => item.customerId === profile.userId),
    unlockedProperties: unlocks.filter((item) => item.customerId === profile.userId),
    verifiedAccess: verifiedAccess.filter((item) => item.customerId === profile.userId),
    viewingRequests: viewings,
    reviews: reviewsStore.reviews.filter((item) => item.customerId === profile.userId),
    notifications,
    payments: dashboard.payments.filter((item) => item.customerId === profile.userId),
    receipts: dashboard.receipts.filter((item) => item.customerId === profile.userId),
    searchHistory: dashboard.searchHistory.filter((item) => item.customerId === profile.userId)
  };
}

export async function saveProperty(input: Omit<SavedPropertyRecord, 'id' | 'savedAt' | 'premiumInformationUnlocked' | 'unlockThisListingAvailable'>): Promise<SavedPropertyRecord> {
  const data = await readCustomerDashboardStore();
  const existing = data.savedProperties.find((item) => item.customerId === input.customerId && item.propertyId === input.propertyId && item.unitIdentifier === input.unitIdentifier);
  if (existing) return existing;
  const record: SavedPropertyRecord = { ...input, id: randomUUID(), savedAt: nowIso(), premiumInformationUnlocked: false, unlockThisListingAvailable: true };
  data.savedProperties.push(record);
  await writeCustomerDashboardStore(data);
  return record;
}

export async function addSearchHistory(input: Omit<CustomerSearchHistoryRecord, 'id' | 'searchedAt' | 'privateToCustomer'>): Promise<CustomerSearchHistoryRecord> {
  const data = await readCustomerDashboardStore();
  const record: CustomerSearchHistoryRecord = { ...input, id: randomUUID(), searchedAt: nowIso(), privateToCustomer: true };
  data.searchHistory.push(record);
  await writeCustomerDashboardStore(data);
  return record;
}

export async function listSavedProperties(customerId: string): Promise<SavedPropertyRecord[]> { return (await readCustomerDashboardStore()).savedProperties.filter((item) => item.customerId === customerId); }
export async function listSearchHistory(customerId: string): Promise<CustomerSearchHistoryRecord[]> { return (await readCustomerDashboardStore()).searchHistory.filter((item) => item.customerId === customerId); }
