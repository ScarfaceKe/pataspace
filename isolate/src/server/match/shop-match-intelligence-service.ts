import {
  SHOP_MATCH_INTELLIGENCE,
  buildShopAiSummary,
  buildShopUnlockPreparation,
  buildShopVerifiedAccessRecommendation,
  buildWhyThisShopMatches,
  getShopMatchScore,
  type ShopMatchIntelligenceResponse,
  type ShopMatchPropertyCard
} from '@/domain/shop-match-intelligence';
import { buildCustomerAccessControlPreparation } from '@/domain/customer-access-control';
import type { ShopMatchPreparedResult, ShopMatchSearchCriteria } from '@/domain/shop-match';
import { runShopMatch } from './shop-match-service';

function rotationOffset(criteria: ShopMatchSearchCriteria, total: number): number {
  if (total <= 1) return 0;
  const seed = JSON.stringify(criteria) + new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return hash % total;
}

function rotateWithinPriority(results: ShopMatchPreparedResult[], criteria: ShopMatchSearchCriteria): ShopMatchPreparedResult[] {
  if (results.length <= SHOP_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize) return results;
  const grouped = new Map<number, ShopMatchPreparedResult[]>();
  for (const result of results) {
    const score = getShopMatchScore(result, criteria);
    grouped.set(score, [...(grouped.get(score) ?? []), result]);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .flatMap(([, group]) => {
      const offset = rotationOffset(criteria, group.length);
      return [...group.slice(offset), ...group.slice(0, offset)];
    });
}

export async function runShopMatchIntelligence(criteria: ShopMatchSearchCriteria): Promise<ShopMatchIntelligenceResponse> {
  const foundation = await runShopMatch(criteria);
  const sorted = [...foundation.results].sort((a, b) => getShopMatchScore(b, criteria) - getShopMatchScore(a, criteria));
  const rotated = rotateWithinPriority(sorted, criteria);
  const limit = SHOP_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize;
  const batch = rotated.slice(0, limit);
  const cards: ShopMatchPropertyCard[] = batch.map((result, index) => ({
    result,
    rank: index + 1,
    rankingSignals: SHOP_MATCH_INTELLIGENCE.rankingSignals,
    whyThisShopMatches: buildWhyThisShopMatches(result, criteria),
    aiSummary: buildShopAiSummary(result),
    propertyCardPreparation: {
      twoCoverPhotosOnlyBeforeAccess: true,
      propertySummary: true,
      aiSummary: true,
      whyThisShopMatches: true,
      unlockThisListing: true,
      verifiedAccess: true,
      requestViewingLockedUntilAccess: true,
      callPropertyManagerOrLeasingAgentLockedUntilAccess: true,
      whatsappPropertyManagerOrLeasingAgentLockedUntilAccess: true
    },
    customerAccessControl: buildCustomerAccessControlPreparation(),
    unlockThisListing: buildShopUnlockPreparation(result),
    verifiedAccess: buildShopVerifiedAccessRecommendation(result, batch.length)
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
      givesVisibilityToDifferentQualifiedListings: true,
      respectsSearchPriority: true,
      invisibleToCustomer: true,
      remainingQualifiedShopsEligibleForFutureRotation: Math.max(foundation.limitedBatch.totalMatchesBeforeLimit - cards.length, 0)
    },
    noResultsBehaviour: {
      avoidsUnnecessaryNoResults: true,
      betterFewRelevantThanNone: true,
      exactMatchesFound: cards.length > 0
    }
  };
}
