import { trackAnalyticsEvent } from '@/server/analytics/service';
import { OFFICE_MATCH_ENGINE_FOUNDATION, textMatches, type OfficeMatchPreparedResult, type OfficeMatchResponseFoundation, type OfficeMatchSearchCriteria } from '@/domain/office-match';
import { readOfficeStore } from '@/server/offices/store';
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

export async function runOfficeMatch(criteria: OfficeMatchSearchCriteria): Promise<OfficeMatchResponseFoundation> {
  const [officeStore, vacancyRecords] = await Promise.all([readOfficeStore(), getAllVacancyConfirmationRecords()]);
  const results: OfficeMatchPreparedResult[] = [];

  for (const record of vacancyRecords) {
    if (record.category !== 'offices') continue;
    if (!record.intelligence.searchEligible) continue;
    if (record.status !== 'confirmed-vacancy' && record.status !== 'grace-period') continue;

    const office = officeStore.offices.find((item) => item.id === record.sourceRegistrationId);
    if (!office || !office.vacancy) continue;
    if (!office.vacancy.unitIdentifiers.includes(record.unitIdentifier)) continue;
    if (!textMatches(office.location.county, criteria.county)) continue;
    if (!textMatches(office.location.townOrCity, criteria.townOrCity)) continue;
    if (!textMatches(office.location.estateOrAreaOrNeighbourhood, criteria.estateOrArea)) continue;
    if (!matchesAny(office.roadVisibility, criteria.roadVisibility)) continue;
    if (!matchesMoney(office.vacancy.monthlyRent, criteria.maximumMonthlyRent)) continue;
    if (!matchesMoney(office.vacancy.depositAmount, criteria.maximumDeposit)) continue;
    if (criteria.waterAvailability?.length && !criteria.waterAvailability.includes(office.water.availability)) continue;
    if (criteria.electricityRequired === 'yes' && office.electricity.isElectricityAvailable !== 'yes') continue;
    if (criteria.electricityRequired === 'no' && office.electricity.isElectricityAvailable !== 'no') continue;
    if (criteria.nearbyPlaces?.length) {
      const available = new Set(office.nearbyPlaces.map((place) => place.place));
      if (!criteria.nearbyPlaces.every((place) => available.has(place))) continue;
    }

    const verification = await getVerificationRecord(office.propertyFoundationId);
    results.push({
      resultId: `${office.id}:${record.unitIdentifier}`,
      officeRegistrationId: office.id,
      propertyFoundationId: office.propertyFoundationId,
      matchedUnitIdentifier: record.unitIdentifier,
      officeType: office.officeType,
      location: office.location,
      roadVisibility: office.roadVisibility,
      monthlyRent: office.vacancy.monthlyRent,
      depositAmount: office.vacancy.depositAmount,
      waterInformation: office.water,
      electricityInformation: office.electricity,
      nearbyPlaces: office.nearbyPlaces,
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

  const limit = OFFICE_MATCH_ENGINE_FOUNDATION.limitedBatchPreparation.approvedBatchSize;
  await trackAnalyticsEvent({ eventType: 'property-search', metadata: { matchType: 'office', resultCount: results.length } });
  return {
    criteria,
    results: results.slice(0, limit),
    limitedBatch: {
      prepared: true,
      limit,
      totalMatchesBeforeLimit: results.length,
      displayLogicImplementedInPrompt13B: true
    },
    noExactMatchSupport: {
      prepared: true,
      detailedBehaviourImplementedInPrompt13B: true,
      presentSuitableAlternativesWhenAvailable: true
    }
  };
}
