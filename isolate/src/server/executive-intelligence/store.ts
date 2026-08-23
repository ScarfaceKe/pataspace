import type { ActiveBusinessGoal, BusinessGoalRecommendation, BusinessOutcomeReport, FounderDecisionTimelineEntry } from '@/domain/executive-intelligence';
import { readStore, writeStore } from '@/server/database/json-store';

export interface ExecutiveIntelligenceStore { recommendations: BusinessGoalRecommendation[]; activeGoals: ActiveBusinessGoal[]; outcomeReports: BusinessOutcomeReport[]; decisionTimeline: FounderDecisionTimelineEntry[] }

const EMPTY_STORE: ExecutiveIntelligenceStore = { recommendations: [], activeGoals: [], outcomeReports: [], decisionTimeline: [] };
const STORE_KEY = 'executive_intelligence';

export async function readExecutiveIntelligenceStore(): Promise<ExecutiveIntelligenceStore> {
  return readStore<ExecutiveIntelligenceStore>(STORE_KEY, EMPTY_STORE);
}

export async function writeExecutiveIntelligenceStore(data: ExecutiveIntelligenceStore): Promise<void> {
  await writeStore<ExecutiveIntelligenceStore>(STORE_KEY, data);
}
