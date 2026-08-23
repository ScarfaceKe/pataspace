import { trackAnalyticsEvent } from '@/server/analytics/service';
import { SHOP_MATCH_ENGINE_FOUNDATION, textMatches, type ShopMatchPreparedResult, type ShopMatchResponseFoundation, type ShopMatchSearchCriteria } from '@/domain/shop-match';
import { readShopStore } from '@/server/shops/store';
import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { getVerificationRecord } from '@/server/verification/service';

function matchesMoney(value: number | null, maximum?: number): boolean {
  if (maximum === undefined || maximum === null || Number.isNaN(maximum)) return true;
  if (value === null || Number.isNaN(value)) return false;
  return value <= maximum;
}

function matchesAny<T extends string>(actual: T | undefined, expected?: T[]): boolean {
  if (!expected?.length) return true;
  return Boolean(actual && expected.includes(actual));
}

function matchesAll<T extends string>(actual: T[], expected?: T[]): boolean {
  if (!expected?.length) return true;
  return expected.every((item) => actual.includes(item));
}

export async function runShopMatch(criteria: ShopMatchSearchCriteria): Promise<ShopMatchResponseFoundation> {
  const [shopStore, vacancyRecords] = await Promise.all([readShopStore(), getAllVacancyConfirmationRecords()]);
  const results: ShopMatchPreparedResult[] = [];

  for (const record of vacancyRecords) {
    if (record.category !== 'shops') continue;
    if (!record.intelligence.searchEligible) continue;
    if (record.status !== 'confirmed-vacancy' && record.status !== 'grace-period') continue;

    const shop = shopStore.shops.find((item) => item.id === record.sourceRegistrationId);
    if (!shop || !shop.vacancy) continue;
    if (!shop.vacancy.unitIdentifiers.includes(record.unitIdentifier)) continue;
    if (!textMatches(shop.location.county, criteria.county)) continue;
    if (!textMatches(shop.location.townOrCity, criteria.townOrCity)) continue;
    if (!textMatches(shop.location.estateOrAreaOrNeighbourhood, criteria.estateOrArea)) continue;
    if (!matchesAny(shop.roadVisibility, criteria.roadVisibility)) continue;
    if (!matchesMoney(shop.vacancy.monthlyRent, criteria.maximumMonthlyRent)) continue;
    if (!matchesMoney(shop.vacancy.depositAmount, criteria.maximumDeposit)) continue;
    if (!matchesAll(shop.businessSuitability, criteria.businessSuitability)) continue;
    if (criteria.commercialUnitTypes?.length && !criteria.commercialUnitTypes.includes(shop.commercialUnitType)) continue;
    if (criteria.waterAvailability?.length && !criteria.waterAvailability.includes(shop.water.availability)) continue;
    if (criteria.electricityRequired === 'yes' && shop.electricity.isElectricityAvailable !== 'yes') continue;
    if (criteria.electricityRequired === 'no' && shop.electricity.isElectricityAvailable !== 'no') continue;
    if (criteria.nearbyPlaces?.length) {
      const available = new Set(shop.nearbyPlaces.map((place) => place.place));
      if (!criteria.nearbyPlaces.every((place) => available.has(place))) continue;
    }

    const verification = await getVerificationRecord(shop.propertyFoundationId);
    results.push({
      resultId: `${shop.id}:${record.unitIdentifier}`,
      shopRegistrationId: shop.id,
      propertyFoundationId: shop.propertyFoundationId,
      matchedUnitIdentifier: record.unitIdentifier,
      shopType: Array.isArray(shop.shopType) ? shop.shopType : [shop.shopType],
      commercialUnitType: shop.commercialUnitType,
      customCommercialUnitType: shop.customCommercialUnitType,
      pricingCategory: shop.pricingCategory,
      location: shop.location,
      roadVisibility: shop.roadVisibility,
      monthlyRent: shop.vacancy.monthlyRent,
      depositAmount: shop.vacancy.depositAmount,
      businessSuitability: shop.businessSuitability,
      waterInformation: shop.water,
      electricityInformation: shop.electricity,
      nearbyPlaces: shop.nearbyPlaces,
      vacancyStatus: record.status,
      vacancyFreshnessStatus: record.intelligence.freshnessStatus,
      verificationStatus: verification?.status ?? 'not-yet-created',
      preparedFor: {
        propertySummary: true,
        unlockThisListing: true,
        verifiedAccess: true,
        viewingWorkflow: true,
        reviews: true,
        notifications: true
      }
    });
  }

  const limit = SHOP_MATCH_ENGINE_FOUNDATION.limitedBatchPreparation.approvedBatchSize;
  await trackAnalyticsEvent({ eventType: 'property-search', metadata: { matchType: 'shop', resultCount: results.length } });
  return {
    criteria,
    results: results.slice(0, limit),
    limitedBatch: {
      prepared: true,
      limit,
      totalMatchesBeforeLimit: results.length,
      displayLogicImplementedInPrompt12B: true
    },
    noExactMatchSupport: {
      prepared: true,
      detailedBehaviourImplementedInPrompt12B: true,
      presentSuitableAlternativesWhenAvailable: true
    }
  };
}
