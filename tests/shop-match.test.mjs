import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/shop-match.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/match/shop-match-service.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/match/ShopMatchSearch.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const criterion of ['county','townOrCity','estateOrArea','roadVisibility','maximumMonthlyRent','maximumDeposit','businessSuitability','commercialUnitTypes','waterAvailability','electricityRequired','nearbyPlaces']) {
  assert.ok(domain.includes(criterion), `Missing shop match criterion ${criterion}`);
}
assert.ok(domain.includes('notSimplyFilteringShops: true'), 'Shop Match must not simply filter shops');
for (const factor of ['Business suitability', 'Visibility', 'Accessibility', 'Trust', 'Accurate vacancy information']) {
  assert.ok(domain.includes(factor), `Missing philosophy factor ${factor}`);
}
assert.ok(domain.includes('registrationUserExperienceStandardInherited: true'), 'Shop Match must inherit guided UX standard');
assert.ok(domain.includes('neverRequestsDuplicateInformationFromRegistrants: true'), 'Shop Match must not request duplicate registrant info');
assert.ok(domain.includes('primaryCommercialFactors'), 'Primary commercial matching factors missing');
assert.ok(domain.includes('commercialUnitTypeMatching'), 'Commercial Unit Type matching rule missing');
assert.ok(domain.includes('neverUsedForUnlockOrVerifiedAccessPricing: true'), 'Commercial Unit Type must not determine pricing');
assert.ok(domain.includes('majorMatchFactor: true'), 'Road visibility major factor missing');
assert.ok(domain.includes('matchSelectedPreferencesWheneverPossible: true'), 'Road visibility preference matching missing');
for (const road of ['facing-main-road','along-main-road','facing-inner-road','along-inner-road','inside-shopping-complex','inside-building','inside-estate']) {
  assert.ok(domain.includes(`'${road}'`), `Missing road visibility ${road}`);
}
assert.ok(domain.includes('onlyActivePublishedVacanciesParticipate: true'), 'Only active published vacancies should participate');
assert.ok(domain.includes('respectsPropertyVerification: true'), 'Verification integration missing');
assert.ok(domain.includes('respectsDailyVacancyConfirmation: true'), 'Daily Vacancy Confirmation integration missing');
assert.ok(domain.includes('respectsWaitingForVerification: true'), 'Waiting for Verification integration missing');
assert.ok(domain.includes('respectsOneWeekRemovalRule: true'), 'One-week removal rule integration missing');
assert.ok(domain.includes('limitedBatchPreparation'), 'Limited batch preparation missing');
assert.ok(domain.includes('Best Match ranking'), '12B Best Match ownership must be declared');
assert.ok(domain.includes('AI Summary clearly labelled as a summary'), '12B AI Summary ownership must be declared');

assert.ok(service.includes('readShopStore'), 'Shop Match must use registered shop data');
assert.ok(service.includes('getAllVacancyConfirmationRecords'), 'Shop Match must use vacancy confirmation data');
assert.ok(service.includes('getVerificationRecord'), 'Shop Match must use verification data');
assert.ok(service.includes("record.category !== 'shops'"), 'Shop Match must only use shop vacancy records');
assert.ok(service.includes('record.intelligence.searchEligible'), 'Shop Match must respect vacancy freshness/search eligibility');
assert.ok(service.includes("record.status !== 'confirmed-vacancy' && record.status !== 'grace-period'"), 'Shop Match must restrict to active/grace published vacancies');
assert.ok(service.includes('shop.businessSuitability'), 'Business Suitability matching missing');
assert.ok(service.includes('shop.commercialUnitType'), 'Commercial Unit Type matching missing');
assert.ok(service.includes('pricingCategory: shop.pricingCategory'), 'Pricing Category result missing');
assert.ok(service.includes('shop.roadVisibility'), 'Road Visibility matching missing');
assert.ok(service.includes('results.slice(0, limit)'), 'Limited batch preparation must limit results');
for (const prepared of ['propertySummary','unlockThisListing','verifiedAccess','viewingWorkflow','reviews','notifications']) {
  assert.ok(domain.includes(prepared), `Prepared result missing ${prepared}`);
}

assert.ok(component.includes('ROAD_VISIBILITY_OPTIONS'), 'Shop Match UI must use road visibility options');
assert.ok(component.includes('BUSINESS_SUITABILITY_OPTIONS'), 'Shop Match UI must use business suitability options');
assert.ok(component.includes('COMMERCIAL_UNIT_TYPES'), 'Shop Match UI must use commercial unit type options');
assert.ok(component.includes('SHOP_WATER_AVAILABILITY_OPTIONS'), 'Shop Match UI must use water options');
assert.ok(component.includes('Electricity Required?'), 'Shop Match UI must ask electricity criterion');
assert.ok(component.includes('Prepare Shop Matches'), 'Shop Match action missing');
assert.ok(foundation.includes('shopMatchEngine: SHOP_MATCH_ENGINE_FOUNDATION'), 'Foundation snapshot must expose Shop Match Engine');
assert.ok(dashboard.includes('/match/shop'), 'Customer dashboard must link to Shop Match');

console.log('PataSpace shop match foundation checks passed.');
