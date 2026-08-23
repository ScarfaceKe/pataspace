import { trackAnalyticsEvent } from '@/server/analytics/service';
import {
  EVENT_HALL_MATCH_ENGINE_FOUNDATION,
  textMatches,
  type EventHallMatchPreparedResult,
  type EventHallMatchResponseFoundation,
  type EventHallMatchSearchCriteria
} from '@/domain/event-hall-match';
import { getHallTimeStatus, isHallOpenAt, type HallTimeStatus } from '@/domain/event-hall-registration';
import { readEventHallStore } from '@/server/event-halls/store';
import { getVerificationRecord } from '@/server/verification/service';

function matchesAny<T extends string>(actual: T | undefined, expected?: T[]): boolean {
  if (!expected?.length) return true;
  return Boolean(actual && expected.includes(actual));
}

function matchesNumberMinimum(value: number | null | undefined, minimum?: number): boolean {
  if (minimum === undefined || minimum === null || Number.isNaN(minimum)) return true;
  if (value === null || value === undefined || Number.isNaN(value)) return false;
  return value >= minimum;
}

function matchesMoney(value: number | null | undefined, maximum?: number): boolean {
  if (maximum === undefined || maximum === null || Number.isNaN(maximum)) return true;
  if (value === null || value === undefined || Number.isNaN(value)) return false;
  return value <= maximum;
}

export async function runEventHallMatch(criteria: EventHallMatchSearchCriteria & { requestedDate?: string; requestedTime?: string }): Promise<EventHallMatchResponseFoundation> {
  const store = await readEventHallStore();
  const results: EventHallMatchPreparedResult[] = [];

  for (const hall of store.eventHalls) {
    if (hall.isAvailableForBookings !== 'yes') continue;
    if (criteria.bookingAvailability === 'available' && hall.isAvailableForBookings !== 'yes') continue;
    const timeStatus: HallTimeStatus = getHallTimeStatus(hall.workingHours ?? [], hall.bookings ?? [], criteria.requestedDate, criteria.requestedTime);
    const isOpen = isHallOpenAt(hall.workingHours ?? [], criteria.requestedTime ?? '');
    if (!textMatches(hall.location.county, criteria.county)) continue;
    if (!textMatches(hall.location.townOrCity, criteria.townOrCity)) continue;
    if (!textMatches(hall.location.estateOrAreaOrNeighbourhood, criteria.estateOrArea)) continue;
    if (!matchesAny(hall.roadVisibility, criteria.roadVisibility)) continue;
    if (!matchesAny(hall.hallCategory, criteria.hallCategory)) continue;
    if (!matchesNumberMinimum(hall.hallCapacity, criteria.minimumCapacity)) continue;
    if (!matchesMoney(hall.bookingPrice, criteria.maximumBookingPrice)) continue;
    if (criteria.nearbyPlaces?.length) {
      const available = new Set(hall.nearbyPlaces.map((place) => place.place));
      if (!criteria.nearbyPlaces.every((place) => available.has(place))) continue;
    }

    const verification = await getVerificationRecord(hall.propertyFoundationId);
    results.push({
      resultId: hall.id,
      eventHallRegistrationId: hall.id,
      propertyFoundationId: hall.propertyFoundationId,
      matchedHallIdentifiers: hall.hallIdentifiers,
      hallName: hall.hallName,
      hallCategory: hall.hallCategory,
      location: hall.location,
      roadVisibility: hall.roadVisibility,
      hallCapacity: hall.hallCapacity,
      bookingPrice: hall.bookingPrice,
      nearbyPlaces: hall.nearbyPlaces,
      bookingAvailability: 'available-for-bookings',
      timeStatus,
      isOpenAtRequestedTime: isOpen,
      workingHours: hall.workingHours,
      verificationStatus: verification?.status ?? 'not-yet-created',
      waterInformationExcluded: true,
      electricityInformationExcluded: true,
      dailyVacancyConfirmationExcluded: true,
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

  const limit = EVENT_HALL_MATCH_ENGINE_FOUNDATION.limitedBatchPreparation.approvedBatchSize;
  await trackAnalyticsEvent({ eventType: 'property-search', metadata: { matchType: 'event-hall', resultCount: results.length } });
  return {
    criteria,
    results: results.slice(0, limit),
    limitedBatch: {
      prepared: true,
      limit,
      totalMatchesBeforeLimit: results.length,
      displayLogicImplementedInPrompt14B: true
    },
    noExactMatchSupport: {
      prepared: true,
      detailedBehaviourImplementedInPrompt14B: true,
      presentSuitableAlternativesWhenAvailable: true
    }
  };
}
