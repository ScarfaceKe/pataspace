import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const houseMatchDomain = readFileSync(new URL('../src/domain/house-match.ts', import.meta.url), 'utf8');
const houseMatchService = readFileSync(new URL('../src/server/match/house-match-service.ts', import.meta.url), 'utf8');
const houseMatchComponent = readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const category of ['single-room', 'bedsitter', 'one-bedroom', 'two-bedroom', 'three-bedroom', 'four-bedroom', 'five-bedroom', 'mixed-residential-property']) {
  assert.ok(houseMatchDomain.includes(`'${category}'`), `Missing supported residential category ${category}`);
}

for (const criterion of ['residentialCategory', 'county', 'townOrCity', 'estateOrNeighbourhood', 'maximumMonthlyRent', 'maximumDeposit', 'waterAvailability', 'electricityRequired', 'nearbyPlaces']) {
  assert.ok(houseMatchDomain.includes(criterion), `Missing search criterion ${criterion}`);
}

assert.ok(houseMatchDomain.includes('Not simply filtering listings'), 'House Match philosophy must not be simple filtering');
assert.ok(houseMatchDomain.includes('registrationUserExperienceStandardInherited: true'), 'House Match must inherit guided UX standard');
assert.ok(houseMatchDomain.includes('neverRequestsDuplicateInformationFromRegistrants: true'), 'House Match must not request duplicate registrant info');
assert.ok(houseMatchDomain.includes('onlyActivePublishedVacanciesParticipate: true'), 'Only active published vacancies should participate');
assert.ok(houseMatchDomain.includes('respectsPropertyVerification: true'), 'Verification integration missing');
assert.ok(houseMatchDomain.includes('respectsDailyVacancyConfirmation: true'), 'Daily Vacancy Confirmation integration missing');
assert.ok(houseMatchDomain.includes('respectsWaitingForVerificationRules: true'), 'Waiting for Verification integration missing');
assert.ok(houseMatchDomain.includes('respectsOneWeekRemovalRule: true'), 'One-week removal rule integration missing');
assert.ok(houseMatchDomain.includes('Mixed Residential Property'), 'Mixed Residential handling missing');
assert.ok(houseMatchDomain.includes('limitedBatchPreparation'), 'Limited batch preparation missing');
assert.ok(houseMatchDomain.includes('Best 20 matching algorithm'), '11B Best 20 ownership must be declared');
assert.ok(houseMatchDomain.includes('AI Summary clearly labelled as a summary'), '11B AI Summary ownership must be declared');

assert.ok(houseMatchService.includes('readHouseStore'), 'House Match must use registered house data');
assert.ok(houseMatchService.includes('getAllVacancyConfirmationRecords'), 'House Match must use vacancy confirmation data');
assert.ok(houseMatchService.includes('getVerificationRecord'), 'House Match must use verification data');
assert.ok(houseMatchService.includes("record.category !== 'houses'"), 'House Match must only use house vacancy records');
assert.ok(houseMatchService.includes('record.intelligence.searchEligible'), 'House Match must respect vacancy freshness/search eligibility');
assert.ok(houseMatchService.includes("record.status !== 'confirmed-vacancy' && record.status !== 'grace-period'"), 'House Match must restrict to active/grace published vacancies');
assert.ok(houseMatchService.includes('vacancy.residentialCategory !== criteria.residentialCategory'), 'House Match must return only requested residential unit category');
assert.ok(houseMatchService.includes('isMixedResidentialProperty'), 'Mixed residential result flag missing');
assert.ok(houseMatchService.includes('results.slice(0, limit)'), 'Limited batch preparation must limit results');

for (const prepared of ['propertySummary', 'unlockThisListing', 'verifiedAccess', 'viewingWorkflow', 'reviews', 'notifications']) {
  assert.ok(houseMatchDomain.includes(prepared), `Prepared result missing ${prepared}`);
}

assert.ok(houseMatchComponent.includes('RESIDENTIAL_CATEGORIES'), 'House Match UI must use residential category cards');
assert.ok(houseMatchComponent.includes('WATER_AVAILABILITY_OPTIONS'), 'House Match UI must use water options');
assert.ok(houseMatchComponent.includes('Electricity Required?'), 'House Match UI must ask electricity criterion');
assert.ok(houseMatchComponent.includes('Prepare House Matches'), 'House Match action missing');
assert.ok(foundationSource.includes('houseMatchEngine: HOUSE_MATCH_ENGINE_FOUNDATION'), 'Foundation snapshot must expose House Match Engine');
assert.ok(dashboardShell.includes('/match/house'), 'Customer dashboard must link to House Match');

console.log('PataSpace house match foundation checks passed.');
