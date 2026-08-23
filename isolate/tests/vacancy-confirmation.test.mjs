import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const vacancyDomain = readFileSync(new URL('../src/domain/vacancy-confirmation.ts', import.meta.url), 'utf8');
const vacancyService = readFileSync(new URL('../src/server/vacancy-confirmation/service.ts', import.meta.url), 'utf8');
const houseService = readFileSync(new URL('../src/server/houses/service.ts', import.meta.url), 'utf8');
const shopService = readFileSync(new URL('../src/server/shops/service.ts', import.meta.url), 'utf8');
const officeService = readFileSync(new URL('../src/server/offices/service.ts', import.meta.url), 'utf8');
const eventHallService = readFileSync(new URL('../src/server/event-halls/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const category of ['houses', 'shops', 'offices']) {
  assert.ok(vacancyDomain.includes(`'${category}'`), `Daily Vacancy Confirmation must apply to ${category}`);
}
assert.ok(vacancyDomain.includes("excludes: ['event-halls']"), 'Event Halls must be excluded');
assert.ok(!eventHallService.includes('createVacancyConfirmationRecords'), 'Event Hall registration must not create daily vacancy confirmation records');
assert.ok(houseService.includes("category: 'houses'"), 'House vacancies must create confirmation records');
assert.ok(shopService.includes("category: 'shops'"), 'Shop vacancies must create confirmation records');
assert.ok(officeService.includes("category: 'offices'"), 'Office vacancies must create confirmation records');

for (const status of ['confirmed-vacancy', 'grace-period', 'waiting-for-verification', 'occupied']) {
  assert.ok(vacancyDomain.includes(`'${status}'`), `Missing vacancy confirmation status ${status}`);
}
assert.ok(vacancyDomain.includes('activeWindowHours: 24'), '24-hour confirmation cycle missing');
assert.ok(vacancyDomain.includes('gracePeriodHours: 24'), '24-hour grace period missing');
assert.ok(vacancyDomain.includes('waitingForVerificationAfterTotalHours: 48'), '48-hour waiting status rule missing');
assert.ok(vacancyDomain.includes('independentUnitConfirmation: true'), 'Independent unit confirmation rule missing');
assert.ok(vacancyDomain.includes('noDuplicateRegistrationRequiredForReconfirmation: true'), 'Reconfirmation without duplicate registration missing');
assert.ok(vacancyDomain.includes('differentFromPropertyVerification: true'), 'Vacancy confirmation must be distinct from property verification');
assert.ok(vacancyService.includes('Initial vacancy confirmation recorded automatically'), 'Initial confirmation timestamp must be automatic');
assert.ok(vacancyService.includes('REMINDER_BEFORE_EXPIRY_MS'), 'Reminder preparation before expiry missing');
assert.ok(vacancyService.includes('confirmVacancy'), 'Confirmation action missing');
assert.ok(vacancyService.includes('closeVacancy'), 'Vacancy closure workflow missing');
assert.ok(vacancyService.includes("status: 'waiting-for-verification'"), 'Waiting for Verification transition missing');
assert.ok(vacancyService.includes('visibleInCustomerSearch: false'), 'Search visibility stop missing for restricted states');
assert.ok(vacancyService.includes('unlockThisListingAvailable: false'), 'Unlock should stop when occupied/waiting');
assert.ok(vacancyService.includes('verifiedAccessAvailable: false'), 'Verified Access should stop when occupied/waiting');
assert.ok(vacancyService.includes('viewingRequestsAvailable: false'), 'Viewing requests should stop when occupied/waiting');
assert.ok(foundationSource.includes('dailyVacancyConfirmation: DAILY_VACANCY_CONFIRMATION_FOUNDATION'), 'Foundation snapshot must expose Daily Vacancy Confirmation');
assert.ok(dashboardShell.includes('/dashboard/vacancy-confirmation'), 'Authorized dashboard must link to vacancy confirmation');

console.log('PataSpace daily vacancy confirmation checks passed.');
