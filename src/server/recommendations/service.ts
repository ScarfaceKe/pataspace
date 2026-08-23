import { buildAiMatchScore, buildRecommendationAnalyticsSnapshot, buildRecommendationExplanation, buildSearchRecoveryPlan, evaluateSavedSearchRecommendation, interpretCustomerSearchDescription, type RecommendationSignal } from '@/domain/recommendation-engine';
import { trackAnalyticsEvent } from '@/server/analytics/service';

export async function explainRecommendation(signals: RecommendationSignal[]) {
  await trackAnalyticsEvent({ eventType: 'ai-recommendation', metadata: { signalCount: signals.length } });
  return { score: buildAiMatchScore({ matchedRequirements: signals.length, totalRequirements: Math.max(signals.length, 1), signals }), explanation: buildRecommendationExplanation(signals) };
}

export async function interpretSearchDescription(description: string) { return interpretCustomerSearchDescription(description); }
export async function getSearchRecoveryPlan(location: string) { return buildSearchRecoveryPlan(location); }
export async function evaluateSavedSearch(input: { savedSearchId: string; matchScore: number; propertyAvailable: boolean; propertyVerified: boolean; currentVacancyActive: boolean }) { return evaluateSavedSearchRecommendation(input); }
export async function getRecommendationAnalytics() { return buildRecommendationAnalyticsSnapshot(); }
