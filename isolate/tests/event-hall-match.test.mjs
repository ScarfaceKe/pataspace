import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/event-hall-match.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/match/event-hall-match-service.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/match/EventHallMatchSearch.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const criterion of ['county','townOrCity','estateOrArea','roadVisibility','hallCategory','minimumCapacity','maximumBookingPrice','nearbyPlaces','bookingAvailability']) {
  assert.ok(domain.includes(criterion), `Missing hall match criterion ${criterion}`);
}
for (const factor of ['Event suitability','Hall capacity','Accessibility','Location','Accurate booking availability','Trust']) {
  assert.ok(domain.includes(factor), `Missing philosophy factor ${factor}`);
}
assert.ok(domain.includes('intelligentlyRecommendEventHalls: true'), 'Hall Match must intelligently recommend event halls');
assert.ok(domain.includes('registrationUserExperienceStandardInherited: true'), 'Hall Match must inherit guided UX standard');
assert.ok(domain.includes('neverRequestsDuplicateInformationFromRegistrants: true'), 'Hall Match must not request duplicate registrant info');
assert.ok(domain.includes('waterInformationExcluded: true'), 'Water must be excluded from Hall Match');
assert.ok(domain.includes('electricityInformationExcluded: true'), 'Electricity must be excluded from Hall Match');
assert.ok(domain.includes('dailyVacancyConfirmationExcluded: true'), 'Daily Vacancy Confirmation must be excluded from Hall Match');
for (const data of ['Hall Capacity','Booking Price','Nearby Places','Booking Availability','Verification Status']) {
  assert.ok(domain.includes(data), `Missing foundation criterion ${data}`);
}
assert.ok(domain.includes('onlyAvailableForBookingsParticipate: true'), 'Only available halls should participate');
assert.ok(domain.includes('respectsPropertyVerification: true'), 'Verification integration missing');
assert.ok(domain.includes('respectsHallAvailability: true'), 'Hall availability integration missing');
assert.ok(domain.includes('respectsBookingAvailabilityUpdates: true'), 'Booking availability updates integration missing');
assert.ok(domain.includes('dailyVacancyConfirmationDoesNotApply: true'), 'Daily Vacancy Confirmation exclusion missing');
assert.ok(domain.includes('limitedBatchPreparation'), 'Limited batch preparation missing');
assert.ok(domain.includes('Best Match Ranking'), '14B Best Match ownership must be declared');
assert.ok(domain.includes('Clearly labelled Summary'), '14B Summary ownership must be declared');

assert.ok(service.includes('readEventHallStore'), 'Hall Match must use registered event hall data');
assert.ok(service.includes('getVerificationRecord'), 'Hall Match must use verification data');
assert.ok(!service.includes('getAllVacancyConfirmationRecords'), 'Hall Match must not use Daily Vacancy Confirmation');
assert.ok(service.includes("hall.isAvailableForBookings !== 'yes'"), 'Hall Match must only use available halls');
assert.ok(service.includes('matchesNumberMinimum(hall.hallCapacity'), 'Hall capacity matching missing');
assert.ok(service.includes('matchesMoney(hall.bookingPrice'), 'Booking price matching missing');
assert.ok(service.includes('waterInformationExcluded: true'), 'Hall result must mark water excluded');
assert.ok(service.includes('electricityInformationExcluded: true'), 'Hall result must mark electricity excluded');
assert.ok(service.includes('dailyVacancyConfirmationExcluded: true'), 'Hall result must mark daily vacancy confirmation excluded');
assert.ok(service.includes('results.slice(0, limit)'), 'Limited batch preparation must limit results');
for (const prepared of ['propertySummary','unlockThisListing','verifiedAccess','viewingWorkflow','reviews','notifications']) {
  assert.ok(domain.includes(prepared), `Prepared result missing ${prepared}`);
}

assert.ok(component.includes('HALL_ROAD_VISIBILITY_OPTIONS'), 'Hall Match UI must use road visibility options');
assert.ok(component.includes('HALL_CATEGORIES'), 'Hall Match UI must use hall categories');
assert.ok(component.includes('Minimum Hall Capacity'), 'Hall Match UI must collect capacity');
assert.ok(component.includes('Maximum Booking Price'), 'Hall Match UI must collect booking price');
assert.ok(component.includes('Water Information and Electricity Information are not used for Hall Match.'), 'Hall Match UI must state water/electricity exclusion');
assert.ok(component.includes('Prepare Hall Matches'), 'Hall Match action missing');
assert.ok(foundation.includes('eventHallMatchEngine: EVENT_HALL_MATCH_ENGINE_FOUNDATION'), 'Foundation snapshot must expose Event Hall Match Engine');
assert.ok(dashboard.includes('/match/event-hall'), 'Customer dashboard must link to Hall Match');

console.log('PataSpace event hall match foundation checks passed.');
