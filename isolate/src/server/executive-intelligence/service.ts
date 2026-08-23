import { randomUUID } from 'node:crypto';
import type { ActiveBusinessGoal, AiStrategicRecommendation, BusinessGoalRecommendation, BusinessOutcomeReport, CountyPerformanceIntelligence, ExecutiveBrief, FounderDecisionTimelineEntry, FounderGoalDecision } from '@/domain/executive-intelligence';
import { readAnalyticsStore } from '@/server/analytics/store';
import { readAuthStore } from '@/server/auth/store';
import { readPropertyStore } from '@/server/properties/store';
import { getRevenueDashboard } from '@/server/revenue/service';
import { analyseSearchOpportunities } from '@/server/platform-health/service';
import { getVerificationQueue } from '@/server/verification/service';
import { readExecutiveIntelligenceStore, writeExecutiveIntelligenceStore } from './store';

function nowIso(): string { return new Date().toISOString(); }
function isToday(value: string): boolean { const d = new Date(value); const n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate(); }
function pct(part: number, total: number): string { return total ? `${Math.round((part / total) * 1000) / 10}%` : '0%'; }

export async function getCountyPerformanceIntelligence(): Promise<CountyPerformanceIntelligence[]> {
  const [analytics, properties, verification, revenue] = await Promise.all([readAnalyticsStore(), readPropertyStore(), getVerificationQueue(), getRevenueDashboard()]);
  const counties = new Set<string>();
  properties.properties.forEach((p) => p.location.county && counties.add(p.location.county));
  analytics.events.forEach((e) => e.location?.county && counties.add(e.location.county));
  return Array.from(counties).map((county) => {
    const searches = analytics.events.filter((e) => e.eventType === 'property-search' && e.location?.county === county);
    const regs = properties.properties.filter((p) => p.location.county === county);
    const verified = verification.filter((v) => regs.some((p) => p.id === v.propertyId) && v.status === 'verified');
    const failed = searches.filter((e) => Number(e.metadata?.resultCount ?? 0) === 0).length;
    const status = searches.length >= 10 && verified.length < 2 ? 'high-opportunity' : failed > 3 ? 'under-supplied' : searches.length > regs.length ? 'growing-rapidly' : 'low-activity';
    return { county, customerDemand: searches.length, searchVolume: searches.length, failedSearches: failed, propertyRegistrations: regs.length, verifiedProperties: verified.length, revenueGenerated: revenue.overall.lifetime.amount, searchSuccessRate: pct(searches.length - failed, searches.length), propertySupply: regs.length, status };
  });
}

export async function buildAiStrategicRecommendations(): Promise<AiStrategicRecommendation[]> {
  const [opportunities, counties] = await Promise.all([analyseSearchOpportunities(), getCountyPerformanceIntelligence()]);
  const recs: AiStrategicRecommendation[] = [];
  for (const opp of opportunities.slice(0, 5)) recs.push({ id: `rec-${opp.id}`, title: `Increase ${opp.propertyType ?? opp.propertyCategory} supply in ${opp.locationLabel}`, supportingEvidence: [opp.customerDemandSummary, opp.supplySummary], businessReason: 'Customer demand exceeds available supply.', expectedPlatformImprovement: 'Improved search success and stronger customer retention.', recommendationOnly: true, createdAt: nowIso() });
  const county = counties.find((c) => c.status === 'high-opportunity' || c.status === 'under-supplied');
  if (county) recs.push({ id: `county-${county.county}`, title: `Prioritise recruitment in ${county.county}`, supportingEvidence: [`${county.searchVolume} searches`, `${county.verifiedProperties} verified properties`, `${county.failedSearches} failed searches`], businessReason: 'County demand signals suggest supply gaps.', expectedPlatformImprovement: 'Better category coverage and revenue opportunity.', recommendationOnly: true, createdAt: nowIso() });
  return recs;
}

export async function getExecutiveBrief(): Promise<ExecutiveBrief> {
  const [revenue, auth, properties, verification, opportunities, store, recs] = await Promise.all([getRevenueDashboard(), readAuthStore(), readPropertyStore(), getVerificationQueue(), analyseSearchOpportunities(), readExecutiveIntelligenceStore(), buildAiStrategicRecommendations()]);
  return { revenueToday: revenue.overall.today.amount, revenueThisWeek: revenue.overall['this-week'].amount, revenueThisMonth: revenue.overall['this-month'].amount, newCustomers: auth.users.filter((u) => u.role === 'customer' && isToday(u.createdAt)).length, newPropertyRegistrations: properties.properties.filter((p) => isToday(p.createdAt)).length, newVerifiedProperties: verification.filter((v) => v.verifiedAt && isToday(v.verifiedAt)).length, criticalPlatformIssues: 0, activeBusinessOpportunities: opportunities.filter((o) => o.status !== 'solved').length, activeBusinessGoals: store.activeGoals.filter((g) => g.status !== 'completed').length, aiStrategicRecommendations: recs };
}

export async function recommendBusinessGoals(): Promise<BusinessGoalRecommendation[]> {
  const store = await readExecutiveIntelligenceStore();
  const recs = await buildAiStrategicRecommendations();
  for (const rec of recs) {
    if (!store.recommendations.some((g) => g.id === `goal-${rec.id}`)) store.recommendations.push({ id: `goal-${rec.id}`, goalName: rec.title, target: 5000, targetDescription: rec.title, reason: rec.businessReason, supportingEvidence: rec.supportingEvidence, status: 'recommended', founderApprovalRequired: true, createdAt: nowIso() });
  }
  await writeExecutiveIntelligenceStore(store);
  return store.recommendations;
}

export async function decideBusinessGoal(input: { recommendationId: string; founderUserId: string; decision: FounderGoalDecision; modifiedTarget?: number; modifiedName?: string }): Promise<{ activeGoal?: ActiveBusinessGoal; recommendation?: BusinessGoalRecommendation; timeline: FounderDecisionTimelineEntry }> {
  const store = await readExecutiveIntelligenceStore();
  const recommendation = store.recommendations.find((g) => g.id === input.recommendationId);
  if (!recommendation) throw new Error('Business goal recommendation not found.');
  recommendation.status = input.decision === 'reject-goal' ? 'rejected' : input.decision === 'modify-goal' ? 'modified' : 'recommended';
  let activeGoal: ActiveBusinessGoal | undefined;
  if (input.decision !== 'reject-goal') {
    activeGoal = { id: randomUUID(), goalName: input.modifiedName ?? recommendation.goalName, target: input.modifiedTarget ?? recommendation.target, currentProgress: 0, completionPercentage: 0, remainingTarget: input.modifiedTarget ?? recommendation.target, status: 'active', approvedByFounderId: input.founderUserId, approvedAt: nowIso(), sourceRecommendationId: recommendation.id };
    store.activeGoals.push(activeGoal);
  }
  const timeline: FounderDecisionTimelineEntry = { id: randomUUID(), decisionType: input.decision === 'reject-goal' ? 'business-goal-rejected' : 'business-goal-approved', summary: `${input.decision}: ${recommendation.goalName}`, decidedAt: nowIso() };
  store.decisionTimeline.push(timeline);
  await writeExecutiveIntelligenceStore(store);
  return { activeGoal, recommendation, timeline };
}

export async function updateBusinessGoalProgress(): Promise<ActiveBusinessGoal[]> {
  const [store, properties] = await Promise.all([readExecutiveIntelligenceStore(), readPropertyStore()]);
  for (const goal of store.activeGoals) {
    goal.currentProgress = Math.min(properties.properties.length, goal.target);
    goal.completionPercentage = Math.round((goal.currentProgress / goal.target) * 1000) / 10;
    goal.remainingTarget = Math.max(goal.target - goal.currentProgress, 0);
    goal.status = goal.remainingTarget === 0 ? 'completed' : 'in-progress';
  }
  await writeExecutiveIntelligenceStore(store);
  return store.activeGoals;
}

export async function generateBusinessOutcomeReports(): Promise<BusinessOutcomeReport[]> {
  const store = await readExecutiveIntelligenceStore();
  for (const goal of store.activeGoals.filter((g) => g.status === 'completed')) {
    if (!store.outcomeReports.some((r) => r.goalId === goal.id)) store.outcomeReports.push({ id: randomUUID(), goalId: goal.id, successfullyCompleted: true, customerSearchSuccessImproved: true, propertySupplyIncreased: true, failedSearchesDecreased: true, revenueImproved: true, additionalActionRequired: false, generatedAt: nowIso() });
  }
  await writeExecutiveIntelligenceStore(store);
  return store.outcomeReports;
}

export async function getExecutiveIntelligenceDashboard() {
  const [brief, counties, recommendations, goals, outcomes, store] = await Promise.all([getExecutiveBrief(), getCountyPerformanceIntelligence(), buildAiStrategicRecommendations(), updateBusinessGoalProgress(), generateBusinessOutcomeReports(), readExecutiveIntelligenceStore()]);
  return { brief, countyPerformance: counties, strategicRecommendations: recommendations, goalRecommendations: await recommendBusinessGoals(), activeGoals: goals, outcomeReports: outcomes, founderDecisionTimeline: store.decisionTimeline };
}
