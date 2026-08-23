import { buildCustomerAccessControlPreparation } from '@/domain/customer-access-control';
import {
  EVENT_HALL_MATCH_INTELLIGENCE,
  buildEventHallSummary,
  buildEventHallUnlockPreparation,
  buildEventHallVerifiedAccessRecommendation,
  buildWhyThisHallMatches,
  getEventHallMatchScore,
  type EventHallMatchIntelligenceResponse,
  type EventHallMatchPropertyCard
} from '@/domain/event-hall-match-intelligence';
import type { EventHallMatchPreparedResult, EventHallMatchSearchCriteria } from '@/domain/event-hall-match';
import { runEventHallMatch } from './event-hall-match-service';

function rotationOffset(criteria: EventHallMatchSearchCriteria, total: number): number {
  if (total <= 1) return 0;
  const seed = JSON.stringify(criteria) + new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return hash % total;
}

function rotateWithinPriority(results: EventHallMatchPreparedResult[], criteria: EventHallMatchSearchCriteria): EventHallMatchPreparedResult[] {
  if (results.length <= EVENT_HALL_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize) return results;
  const grouped = new Map<number, EventHallMatchPreparedResult[]>();
  for (const result of results) {
    const score = getEventHallMatchScore(result, criteria);
    grouped.set(score, [...(grouped.get(score) ?? []), result]);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .flatMap(([, group]) => {
      const offset = rotationOffset(criteria, group.length);
      return [...group.slice(offset), ...group.slice(0, offset)];
    });
}

export async function runEventHallMatchIntelligence(criteria: EventHallMatchSearchCriteria): Promise<EventHallMatchIntelligenceResponse> {
  const foundation = await runEventHallMatch(criteria);
  const sorted = [...foundation.results].sort((a, b) => getEventHallMatchScore(b, criteria) - getEventHallMatchScore(a, criteria));
  const rotated = rotateWithinPriority(sorted, criteria);
  const limit = EVENT_HALL_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize;
  const batch = rotated.slice(0, limit);
  const cards: EventHallMatchPropertyCard[] = batch.map((result, index) => ({
    result,
    rank: index + 1,
    rankingSignals: EVENT_HALL_MATCH_INTELLIGENCE.rankingSignals,
    whyThisHallMatches: buildWhyThisHallMatches(result, criteria),
    summary: buildEventHallSummary(result),
    propertyCardPreparation: {
      twoCoverPhotosOnlyBeforeAccess: true,
      propertySummary: true,
      summary: true,
      whyThisHallMatches: true,
      unlockThisListing: true,
      verifiedAccess: true,
      requestViewingLockedUntilAccess: true,
      callPropertyManagerOrLeasingAgentLockedUntilAccess: true,
      whatsappPropertyManagerOrLeasingAgentLockedUntilAccess: true,
      additionalPhotosLockedUntilAccess: true
    },
    customerAccessControl: buildCustomerAccessControlPreparation(),
    unlockThisListing: buildEventHallUnlockPreparation(result),
    verifiedAccess: buildEventHallVerifiedAccessRecommendation(result, batch.length),
    reviewPreparation: {
      availableAfterEventHasTakenPlace: true,
      oneMonthDelayRuleApplies: false,
      exclusiveToEventHalls: true
    }
  }));

  return {
    criteria,
    cards,
    limitedBatch: {
      applied: true,
      limit,
      totalQualifiedMatches: foundation.limitedBatch.totalMatchesBeforeLimit,
      customerOverwhelmPrevented: true
    },
    smartRotation: {
      prepared: true,
      applied: foundation.limitedBatch.totalMatchesBeforeLimit > limit,
      maintainsFairness: true,
      givesVisibilityToDifferentQualifiedHalls: true,
      respectsSearchPriority: true,
      invisibleToCustomer: true,
      remainingQualifiedHallsEligibleForFutureRotation: Math.max(foundation.limitedBatch.totalMatchesBeforeLimit - cards.length, 0)
    },
    noResultsBehaviour: {
      avoidsUnnecessaryNoResults: true,
      betterFewRelevantThanNone: true,
      exactMatchesFound: cards.length > 0
    },
    exclusions: {
      waterInformationExcluded: true,
      electricityInformationExcluded: true,
      dailyVacancyConfirmationExcluded: true
    }
  };
}
