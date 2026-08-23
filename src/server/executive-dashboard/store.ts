import type { FounderDashboardPersonalisation } from '@/domain/executive-dashboard';
import { readStore, writeStore } from '@/server/database/json-store';

export interface ExecutiveDashboardStore { personalisation: FounderDashboardPersonalisation[] }

const EMPTY_STORE: ExecutiveDashboardStore = { personalisation: [] };
const STORE_KEY = 'executive_dashboard';

export async function readExecutiveDashboardStore(): Promise<ExecutiveDashboardStore> {
  return readStore<ExecutiveDashboardStore>(STORE_KEY, EMPTY_STORE);
}

export async function writeExecutiveDashboardStore(data: ExecutiveDashboardStore): Promise<void> {
  await writeStore<ExecutiveDashboardStore>(STORE_KEY, data);
}
