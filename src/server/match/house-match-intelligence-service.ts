import {
  HOUSE_MATCH_INTELLIGENCE,
  buildHouseAiSummary,
  buildUnlockPreparation,
  buildVerifiedAccessRecommendation,
  buildWhyThisHomeMatches,
  getHouseMatchScore,
  type HouseMatchIntelligenceResponse,
  type HouseMatchPropertyCard
} from '@/domain/house-match-intelligence';
import { buildCustomerAccessControlPreparation } from '@/domain/customer-access-control';
import type { HouseMatchPreparedResult, HouseMatchSearchCriteria } from '@/domain/house-match';
import { runHouseMatch } from './house-match-service';

function rotationOffset(criteria: HouseMatchSearchCriteria, total: number): number {
  if (total <= 1) return 0;
  const seed = JSON.stringify(criteria) + new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return hash % total;
}

function rotateWithinPriority(results: HouseMatchPreparedResult[], criteria: HouseMatchSearchCriteria): HouseMatchPreparedResult[] {
  if (results.length <= HOUSE_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize) return results;
  const grouped = new Map<number, HouseMatchPreparedResult[]>();
  for (const result of results) {
    const score = getHouseMatchScore(result, criteria);
    grouped.set(score, [...(grouped.get(score) ?? []), result]);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .flatMap(([, group]) => {
      const offset = rotationOffset(criteria, group.length);
      return [...group.slice(offset), ...group.slice(0, offset)];
    });
}

export async function runHouseMatchIntelligence(criteria: HouseMatchSearchCriteria): Promise<HouseMatchIntelligenceResponse> {
  const foundation = await runHouseMatch(criteria);
  const sorted = [...foundation.results].sort((a, b) => getHouseMatchScore(b, criteria) - getHouseMatchScore(a, criteria));
  const rotated = rotateWithinPriority(sorted, criteria);
  const limit = HOUSE_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize;
  const batch = rotated.slice(0, limit);
  const cards: HouseMatchPropertyCard[] = batch.map((result, index) => ({
    result,
    rank: index + 1,
    rankingSignals: HOUSE_MATCH_INTELLIGENCE.rankingSignals,
    whyThisHomeMatches: buildWhyThisHomeMatches(result, criteria),
    aiSummary: buildHouseAiSummary(result),
    propertyCardPreparation: {
      twoCoverPhotosOnlyBeforeAccess: true,
      propertySummary: true,
      aiSummary: true,
      whyThisHomeMatches: true,
      unlockThisListing: true,
      verifiedAccess: true,
      requestViewingLockedUntilAccess: true,
      callPropertyManagerLockedUntilAccess: true,
      whatsappPropertyManagerLockedUntilAccess: true
    },
    customerAccessControl: buildCustomerAccessControlPreparation(),
    unlockThisListing: buildUnlockPreparation(result),
    verifiedAccess: buildVerifiedAccessRecommendation(result, batch.length)
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
      respectsSearchPriority: true,
      invisibleToCustomer: true,
      remainingQualifiedPropertiesEligibleForFutureRotation: Math.max(foundation.limitedBatch.totalMatchesBeforeLimit - cards.length, 0)
    },
    noResultsBehaviour: {
      avoidsUnnecessaryNoResults: true,
      betterFewRelevantThanNone: true,
      exactMatchesFound: cards.length > 0
    }
  };
}
