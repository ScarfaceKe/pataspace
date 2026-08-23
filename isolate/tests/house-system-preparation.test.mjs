import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const prepDomain = readFileSync(new URL('../src/domain/house-system-preparation.ts', import.meta.url), 'utf8');
const houseDomain = readFileSync(new URL('../src/domain/house-registration.ts', import.meta.url), 'utf8');
const houseService = readFileSync(new URL('../src/server/houses/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const system of [
  'house-match',
  'vacancy-verification',
  'search-priority',
  'smart-rotation',
  'match-results',
  'unlock-this-listing',
  'verified-access',
  'viewing-workflow',
  'property-reviews',
  'notifications',
  'ai-admin-assistant',
  'platform-health-monitor'
]) {
  assert.ok(prepDomain.includes(`'${system}'`), `Missing prepared system: ${system}`);
}

assert.ok(houseDomain.includes('systemPreparation: ResidentialSystemPreparation'), 'Registered houses must include system preparation');
assert.ok(houseService.includes('prepareResidentialSystems(input, propertyResult.property.status)'), 'House registration must create preparation automatically');
assert.ok(prepDomain.includes('duplicateInformationRequested: false'), 'Preparation must not request duplicate information');
assert.ok(prepDomain.includes('matchableAttributes'), 'House Match attributes must be organized');
assert.ok(prepDomain.includes('electricity'), 'House Match preparation must inherit electricity information');
assert.ok(prepDomain.includes('unitIdentifiers'), 'Prepared residential vacancies must include real-world unit identifiers');
assert.ok(prepDomain.includes("officialUnitReferenceSource: 'real-world-property-identifier'"), 'Prepared systems must use real-world unit identifiers as official reference');
assert.ok(prepDomain.includes('preparedForDailyConfirmation: true'), 'Vacant units must be prepared for daily confirmation');
assert.ok(prepDomain.includes('not-visible-until-vacancy-published'), 'No-vacancy search suppression must be represented');
assert.ok(prepDomain.includes('rankingPerformedNow: false'), 'Search ranking must not be performed now');
assert.ok(prepDomain.includes('verifiedVacancyStatus'), 'Verified vacancy status signal missing');
assert.ok(prepDomain.includes('activeVacancyConfirmations'), 'Active confirmation signal missing');
assert.ok(prepDomain.includes('freshnessOfVacancyInformation'), 'Freshness signal missing');
assert.ok(prepDomain.includes('futureBatchThreshold: 20'), 'Smart Rotation threshold preparation missing');
assert.ok(prepDomain.includes('systemsImplementedNow: false'), 'Match Result systems must not be implemented now');
assert.ok(prepDomain.includes('manualPricingEntryAllowed: false'), 'Manual unlock pricing entry must be disabled');
assert.ok(prepDomain.includes('official-pataspace-unlock-pricing-model'), 'Unlock pricing model source missing');
assert.ok(prepDomain.includes('official-pataspace-verified-access-pricing-model'), 'Verified Access pricing model source missing');
assert.ok(prepDomain.includes('recommendationExecutedNow: false'), 'Verified Access recommendations must not execute now');
assert.ok(prepDomain.includes('eligibleForFutureViewingWorkflow: true'), 'Viewing workflow preparation missing');
assert.ok(prepDomain.includes('eligibleForFuturePropertyReviews: true'), 'Review preparation missing');
assert.ok(prepDomain.includes('notificationsSentNow: false'), 'Notifications must not be implemented now');
assert.ok(prepDomain.includes('invisibleToPropertyRegistrant: true'), 'AI Admin Assistant must remain invisible');
assert.ok(prepDomain.includes('replacesPlatformAdmin: false'), 'AI Admin Assistant must not replace Platform Admin');
assert.ok(prepDomain.includes('ownerActionRequiredNow: false'), 'Platform Health Monitor must require no owner action now');
assert.ok(foundationSource.includes('residentialPreparedSystems: RESIDENTIAL_PREPARED_SYSTEMS'), 'Foundation snapshot must expose preparation systems');

console.log('PataSpace house system preparation checks passed.');
