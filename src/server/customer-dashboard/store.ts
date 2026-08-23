import type { CustomerPaymentRecord, CustomerReceiptRecord, CustomerSearchHistoryRecord, SavedPropertyRecord } from '@/domain/customer-dashboard';
import { readStore, writeStore } from '@/server/database/json-store';

export interface CustomerDashboardStoreData {
  savedProperties: SavedPropertyRecord[];
  searchHistory: CustomerSearchHistoryRecord[];
  payments: CustomerPaymentRecord[];
  receipts: CustomerReceiptRecord[];
}

const EMPTY_STORE: CustomerDashboardStoreData = { savedProperties: [], searchHistory: [], payments: [], receipts: [] };
const STORE_KEY = 'customer_dashboard';

export async function readCustomerDashboardStore(): Promise<CustomerDashboardStoreData> {
  return readStore<CustomerDashboardStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeCustomerDashboardStore(data: CustomerDashboardStoreData): Promise<void> {
  await writeStore<CustomerDashboardStoreData>(STORE_KEY, data);
}
