import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const prepDomain = readFileSync(new URL('../src/domain/office-system-preparation.ts', import.meta.url), 'utf8');
const officeDomain = readFileSync(new URL('../src/domain/office-registration.ts', import.meta.url), 'utf8');
const officeService = readFileSync(new URL('../src/server/offices/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const system of [
  'office-match',
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

assert.ok(officeDomain.includes('systemPreparation: OfficeSystemPreparation'), 'Registered offices must include system preparation');
assert.ok(officeService.includes('prepareOfficeSystems(input, propertyResult.property.status)'), 'Office registration must create preparation automatically');
assert.ok(prepDomain.includes('duplicateInformationRequested: false'), 'Preparation must not request duplicate information');
assert.ok(prepDomain.includes('roadVisibility'), 'Office Match road visibility preparation missing');
assert.ok(prepDomain.includes('water'), 'Office Match water preparation missing');
assert.ok(prepDomain.includes('electricity'), 'Office Match electricity preparation missing');
assert.ok(prepDomain.includes('nearbyPlaces'), 'Office Match nearby places preparation missing');
assert.ok(prepDomain.includes('vacantUnitIdentification'), 'Office Match vacant unit identification preparation missing');
assert.ok(prepDomain.includes('unitIdentifiers'), 'Prepared office vacancies must include real-world unit identifiers');
assert.ok(prepDomain.includes("officialUnitReferenceSource: 'real-world-property-identifier'"), 'Prepared systems must use real-world unit identifiers as official reference');
assert.ok(prepDomain.includes('preparedForPublication: true'), 'Vacant office units must be prepared for publication');
assert.ok(prepDomain.includes('preparedForDailyConfirmation: true'), 'Vacant office units must be prepared for Daily Vacancy Confirmation');
assert.ok(prepDomain.includes('not-visible-until-vacancy-published'), 'No-vacancy search suppression must be represented');
assert.ok(prepDomain.includes('rankingPerformedNow: false'), 'Search ranking must not be performed now');
assert.ok(prepDomain.includes('verifiedVacancyStatus'), 'Verified vacancy status signal missing');
assert.ok(prepDomain.includes('activeVacancyConfirmations'), 'Active confirmation signal missing');
assert.ok(prepDomain.includes('freshnessOfVacancyInformation'), 'Freshness signal missing');
assert.ok(prepDomain.includes('approvedBatchRotationPrepared: true'), 'Smart Rotation batch preparation missing');
assert.ok(prepDomain.includes('limitedSearchResultBatchesPrepared: true'), 'Limited match result batches missing');
assert.ok(prepDomain.includes('manualPricingEntryAllowed: false'), 'Manual unlock pricing entry must be disabled');
assert.ok(prepDomain.includes('official-pataspace-office-unlock-pricing-structure'), 'Office Unlock pricing source missing');
assert.ok(prepDomain.includes('official-pataspace-office-verified-access-pricing-structure'), 'Verified Access pricing source missing');
assert.ok(prepDomain.includes('fewMatchesMayRecommendUnlock: true'), 'Few matches recommendation preparation missing');
assert.ok(prepDomain.includes('manyMatchesMayRecommendVerifiedAccess: true'), 'Many matches recommendation preparation missing');
assert.ok(prepDomain.includes('recommendationExecutedNow: false'), 'Verified Access recommendations must not execute now');
assert.ok(prepDomain.includes('request-viewing-through-platform'), 'Viewing request method missing');
assert.ok(prepDomain.includes('call-property-manager-or-contact-person'), 'Call contact method missing');
assert.ok(prepDomain.includes('whatsapp-property-manager-or-contact-person'), 'WhatsApp contact method missing');
assert.ok(prepDomain.includes('confirm-attended-viewing'), 'Tenant viewing attendance follow-up missing');
assert.ok(prepDomain.includes('confirm-found-office'), 'Tenant found office follow-up missing');
assert.ok(prepDomain.includes('stop-office-match-notifications'), 'Stop Office Match notifications follow-up missing');
assert.ok(prepDomain.includes('tenantSuccessfulRentalReviewPrepared: true'), 'Successful rental review preparation missing');
assert.ok(prepDomain.includes('vacancy-confirmation-reminders'), 'Notification vacancy reminders missing');
assert.ok(prepDomain.includes('unlock-and-verified-access-notifications'), 'Unlock/Verified Access notifications missing');
assert.ok(prepDomain.includes('notificationsSentNow: false'), 'Notifications must not be sent now');
assert.ok(prepDomain.includes('verification-support'), 'AI Admin verification support missing');
assert.ok(prepDomain.includes('vacancy-monitoring'), 'AI Admin vacancy monitoring missing');
assert.ok(prepDomain.includes('review-prioritisation'), 'AI Admin review prioritisation missing');
assert.ok(prepDomain.includes('invisibleAssistant: true'), 'AI Admin Assistant must remain invisible');
assert.ok(prepDomain.includes('replacesPlatformAdministrator: false'), 'AI Admin Assistant must not replace Platform Administrator');
assert.ok(prepDomain.includes('search-demand'), 'Platform Health Monitor search demand metric missing');
assert.ok(prepDomain.includes('areas-with-limited-office-supply'), 'Platform Health Monitor limited office supply metric missing');
assert.ok(prepDomain.includes('properties-awaiting-verification'), 'Platform Health Monitor awaiting verification metric missing');
assert.ok(prepDomain.includes('registrantActionRequiredNow: false'), 'Platform Health Monitor must require no registrant action now');
assert.ok(foundationSource.includes('officePreparedSystems: OFFICE_PREPARED_SYSTEMS'), 'Foundation snapshot must expose office preparation systems');

console.log('PataSpace office system preparation checks passed.');
