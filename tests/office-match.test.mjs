import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/office-match.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/match/office-match-service.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/match/OfficeMatchSearch.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const criterion of ['county','townOrCity','estateOrArea','roadVisibility','maximumMonthlyRent','maximumDeposit','waterAvailability','electricityRequired','nearbyPlaces']) {
  assert.ok(domain.includes(criterion), `Missing office match criterion ${criterion}`);
}
for (const factor of ['Professional suitability', 'Accessibility', 'Visibility', 'Trust', 'Accurate vacancy information']) {
  assert.ok(domain.includes(factor), `Missing philosophy factor ${factor}`);
}
assert.ok(domain.includes('intelligentlyRecommendOfficeSpaces: true'), 'Office Match must intelligently recommend spaces');
assert.ok(domain.includes('registrationUserExperienceStandardInherited: true'), 'Office Match must inherit guided UX standard');
assert.ok(domain.includes('neverRequestsDuplicateInformationFromRegistrants: true'), 'Office Match must not request duplicate registrant info');
assert.ok(domain.includes('importantMatchFactor: true'), 'Road visibility important factor missing');
assert.ok(domain.includes('matchSelectedPreferencesWheneverPossible: true'), 'Road visibility preference matching missing');
for (const road of ['facing-main-road','along-main-road','facing-inner-road','along-inner-road','inside-office-building','inside-commercial-complex','inside-estate']) {
  assert.ok(domain.includes(`'${road}'`), `Missing road visibility ${road}`);
}
assert.ok(domain.includes('onlyActivePublishedVacanciesParticipate: true'), 'Only active published vacancies should participate');
assert.ok(domain.includes('respectsPropertyVerification: true'), 'Verification integration missing');
assert.ok(domain.includes('respectsDailyVacancyConfirmation: true'), 'Daily Vacancy Confirmation integration missing');
assert.ok(domain.includes('respectsWaitingForVerification: true'), 'Waiting for Verification integration missing');
assert.ok(domain.includes('respectsOneWeekRemovalRule: true'), 'One-week removal rule integration missing');
assert.ok(domain.includes('limitedBatchPreparation'), 'Limited batch preparation missing');
assert.ok(domain.includes('Best Match Ranking'), '13B Best Match ownership must be declared');
assert.ok(domain.includes('AI Summary clearly labelled as a summary'), '13B AI Summary ownership must be declared');

assert.ok(service.includes('readOfficeStore'), 'Office Match must use registered office data');
assert.ok(service.includes('getAllVacancyConfirmationRecords'), 'Office Match must use vacancy confirmation data');
assert.ok(service.includes('getVerificationRecord'), 'Office Match must use verification data');
assert.ok(service.includes("record.category !== 'offices'"), 'Office Match must only use office vacancy records');
assert.ok(service.includes('record.intelligence.searchEligible'), 'Office Match must respect vacancy freshness/search eligibility');
assert.ok(service.includes("record.status !== 'confirmed-vacancy' && record.status !== 'grace-period'"), 'Office Match must restrict to active/grace published vacancies');
assert.ok(service.includes('office.roadVisibility'), 'Road Visibility matching missing');
assert.ok(service.includes('results.slice(0, limit)'), 'Limited batch preparation must limit results');
for (const prepared of ['propertySummary','unlockThisListing','verifiedAccess','viewingWorkflow','reviews','notifications']) {
  assert.ok(domain.includes(prepared), `Prepared result missing ${prepared}`);
}

assert.ok(component.includes('OFFICE_ROAD_VISIBILITY_OPTIONS'), 'Office Match UI must use road visibility options');
assert.ok(component.includes('OFFICE_WATER_AVAILABILITY_OPTIONS'), 'Office Match UI must use water options');
assert.ok(component.includes('Electricity Required?'), 'Office Match UI must ask electricity criterion');
assert.ok(component.includes('Prepare Office Matches'), 'Office Match action missing');
assert.ok(foundation.includes('officeMatchEngine: OFFICE_MATCH_ENGINE_FOUNDATION'), 'Foundation snapshot must expose Office Match Engine');
assert.ok(dashboard.includes('/match/office'), 'Customer dashboard must link to Office Match');

console.log('PataSpace office match foundation checks passed.');
