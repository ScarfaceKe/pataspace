import { trackAnalyticsEvent } from '@/server/analytics/service';
import { HOUSE_MATCH_ENGINE_FOUNDATION, textMatches, type HouseMatchPreparedResult, type HouseMatchResponseFoundation, type HouseMatchSearchCriteria } from '@/domain/house-match';
import { isMixedResidentialProperty } from '@/domain/house-registration';
import type { RegisteredHouseFoundation, ResidentialVacancyInput } from '@/domain/house-registration';
import { readHouseStore } from '@/server/houses/store';
import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { getVerificationRecord } from '@/server/verification/service';

function matchesMoney(value: number | null, maximum?: number): boolean {
  if (maximum === undefined || maximum === null || Number.isNaN(maximum)) return true;
  if (value === null || Number.isNaN(value)) return false;
  return value <= maximum;
}

function findVacancyForUnit(house: RegisteredHouseFoundation, unitIdentifier: string): ResidentialVacancyInput | undefined {
  return house.vacancies.find((vacancy) => vacancy.unitIdentifiers.includes(unitIdentifier));
}

function matchesCriteria(house: RegisteredHouseFoundation, vacancy: ResidentialVacancyInput, criteria: HouseMatchSearchCriteria): boolean {
  if (vacancy.residentialCategory !== criteria.residentialCategory) return false;
  if (!textMatches(house.location.county, criteria.county)) return false;
  if (!textMatches(house.location.townOrCity, criteria.townOrCity)) return false;
  if (!textMatches(house.location.estateOrAreaOrNeighbourhood, criteria.estateOrNeighbourhood)) return false;
  if (!matchesMoney(vacancy.monthlyRent, criteria.maximumMonthlyRent)) return false;
  if (!matchesMoney(vacancy.depositAmount, criteria.maximumDeposit)) return false;
  if (criteria.waterAvailability?.length && !criteria.waterAvailability.includes(house.water.availability)) return false;
  if (criteria.electricityRequired === 'yes' && house.electricity.isElectricityAvailable !== 'yes') return false;
  if (criteria.electricityRequired === 'no' && house.electricity.isElectricityAvailable !== 'no') return false;
  if (criteria.nearbyPlaces?.length) {
    const available = new Set(house.nearbyPlaces.map((place) => place.place));
    if (!criteria.nearbyPlaces.every((place) => available.has(place))) return false;
  }
  return true;
}

export async function runHouseMatch(criteria: HouseMatchSearchCriteria): Promise<HouseMatchResponseFoundation> {
  const [houseStore, vacancyRecords] = await Promise.all([readHouseStore(), getAllVacancyConfirmationRecords()]);
  const results: HouseMatchPreparedResult[] = [];

  for (const record of vacancyRecords) {
    if (record.category !== 'houses') continue;
    if (!record.intelligence.searchEligible) continue;
    if (record.status !== 'confirmed-vacancy' && record.status !== 'grace-period') continue;

    const house = houseStore.houses.find((item) => item.id === record.sourceRegistrationId);
    if (!house) continue;
    const vacancy = findVacancyForUnit(house, record.unitIdentifier);
    if (!vacancy) continue;
    if (!matchesCriteria(house, vacancy, criteria)) continue;
    const verification = await getVerificationRecord(house.propertyFoundationId);

    results.push({
      resultId: `${house.id}:${record.unitIdentifier}`,
      houseRegistrationId: house.id,
      propertyFoundationId: house.propertyFoundationId,
      matchedUnitIdentifier: record.unitIdentifier,
      residentialCategory: vacancy.residentialCategory,
      isMixedResidentialMatch: isMixedResidentialProperty(house.residentialCategory),
      location: house.location,
      monthlyRent: vacancy.monthlyRent,
      depositAmount: vacancy.depositAmount,
      waterInformation: house.water,
      electricityInformation: house.electricity,
      nearbyPlaces: house.nearbyPlaces,
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

  const limit = HOUSE_MATCH_ENGINE_FOUNDATION.limitedBatchPreparation.approvedBatchSize;
  await trackAnalyticsEvent({ eventType: 'property-search', metadata: { matchType: 'house', resultCount: results.length } });
  return {
    criteria,
    results: results.slice(0, limit),
    limitedBatch: {
      prepared: true,
      limit,
      totalMatchesBeforeLimit: results.length,
      displayLogicImplementedInPrompt11B: true
    },
    noExactMatchSupport: {
      prepared: true,
      detailedBehaviourImplementedInPrompt11B: true,
      avoidEmptyExperienceWhenSuitableAlternativesExist: true
    }
  };
}
