import { buildCustomerAccessControlPreparation } from '@/domain/customer-access-control';
import {
  OFFICE_MATCH_INTELLIGENCE,
  buildOfficeSummary,
  buildOfficeUnlockPreparation,
  buildOfficeVerifiedAccessRecommendation,
  buildWhyThisOfficeMatches,
  getOfficeMatchScore,
  type OfficeMatchIntelligenceResponse,
  type OfficeMatchPropertyCard
} from '@/domain/office-match-intelligence';
import type { OfficeMatchPreparedResult, OfficeMatchSearchCriteria } from '@/domain/office-match';
import { runOfficeMatch } from './office-match-service';

function rotationOffset(criteria: OfficeMatchSearchCriteria, total: number): number {
  if (total <= 1) return 0;
  const seed = JSON.stringify(criteria) + new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return hash % total;
}

function rotateWithinPriority(results: OfficeMatchPreparedResult[], criteria: OfficeMatchSearchCriteria): OfficeMatchPreparedResult[] {
  if (results.length <= OFFICE_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize) return results;
  const grouped = new Map<number, OfficeMatchPreparedResult[]>();
  for (const result of results) {
    const score = getOfficeMatchScore(result, criteria);
    grouped.set(score, [...(grouped.get(score) ?? []), result]);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .flatMap(([, group]) => {
      const offset = rotationOffset(criteria, group.length);
      return [...group.slice(offset), ...group.slice(0, offset)];
    });
}

export async function runOfficeMatchIntelligence(criteria: OfficeMatchSearchCriteria): Promise<OfficeMatchIntelligenceResponse> {
  const foundation = await runOfficeMatch(criteria);
  const sorted = [...foundation.results].sort((a, b) => getOfficeMatchScore(b, criteria) - getOfficeMatchScore(a, criteria));
  const rotated = rotateWithinPriority(sorted, criteria);
  const limit = OFFICE_MATCH_INTELLIGENCE.limitedResultBatch.approvedBatchSize;
  const batch = rotated.slice(0, limit);
  const cards: OfficeMatchPropertyCard[] = batch.map((result, index) => ({
    result,
    rank: index + 1,
    rankingSignals: OFFICE_MATCH_INTELLIGENCE.rankingSignals,
    whyThisOfficeMatches: buildWhyThisOfficeMatches(result, criteria),
    summary: buildOfficeSummary(result),
    propertyCardPreparation: {
      twoCoverPhotosOnlyBeforeAccess: true,
      propertySummary: true,
      summary: true,
      whyThisOfficeMatches: true,
      unlockThisListing: true,
      verifiedAccess: true,
      requestViewingLockedUntilAccess: true,
      callPropertyManagerOrLeasingAgentLockedUntilAccess: true,
      whatsappPropertyManagerOrLeasingAgentLockedUntilAccess: true,
      additionalPhotosLockedUntilAccess: true
    },
    customerAccessControl: buildCustomerAccessControlPreparation(),
    unlockThisListing: buildOfficeUnlockPreparation(result),
    verifiedAccess: buildOfficeVerifiedAccessRecommendation(result, batch.length)
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
      givesVisibilityToDifferentQualifiedOfficeListings: true,
      respectsSearchPriority: true,
      invisibleToCustomer: true,
      remainingQualifiedOfficesEligibleForFutureRotation: Math.max(foundation.limitedBatch.totalMatchesBeforeLimit - cards.length, 0)
    },
    noResultsBehaviour: {
      avoidsUnnecessaryNoResults: true,
      betterFewRelevantThanNone: true,
      exactMatchesFound: cards.length > 0
    }
  };
}
