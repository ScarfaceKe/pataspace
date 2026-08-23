import type { AiRecoveryActionRecord, FounderHealthTimelineEvent, PlatformIncident, RecoveryHistoryRecord } from '@/domain/platform-health-operations';
import { readStore, writeStore } from '@/server/database/json-store';

export interface PlatformHealthOperationsStore { incidents: PlatformIncident[]; recoveryActions: AiRecoveryActionRecord[]; recoveryHistory: RecoveryHistoryRecord[]; timeline: FounderHealthTimelineEvent[] }

const EMPTY_STORE: PlatformHealthOperationsStore = { incidents: [], recoveryActions: [], recoveryHistory: [], timeline: [] };
const STORE_KEY = 'platform_health_operations';

export async function readPlatformHealthOperationsStore(): Promise<PlatformHealthOperationsStore> {
  return readStore<PlatformHealthOperationsStore>(STORE_KEY, EMPTY_STORE);
}

export async function writePlatformHealthOperationsStore(data: PlatformHealthOperationsStore): Promise<void> {
  await writeStore<PlatformHealthOperationsStore>(STORE_KEY, data);
}
