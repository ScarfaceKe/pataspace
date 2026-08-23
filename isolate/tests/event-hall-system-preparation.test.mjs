import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const prepDomain = readFileSync(new URL('../src/domain/event-hall-system-preparation.ts', import.meta.url), 'utf8');
const hallDomain = readFileSync(new URL('../src/domain/event-hall-registration.ts', import.meta.url), 'utf8');
const hallService = readFileSync(new URL('../src/server/event-halls/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const system of [
  'hall-match',
  'availability-verification',
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

assert.ok(hallDomain.includes('systemPreparation: EventHallSystemPreparation'), 'Registered event halls must include system preparation');
assert.ok(hallService.includes('prepareEventHallSystems'), 'Event Hall registration must create preparation automatically');
assert.ok(prepDomain.includes('duplicateInformationRequested: false'), 'Preparation must not request duplicate information');
assert.ok(prepDomain.includes('waterInformationExcluded: true'), 'Water must be excluded from Hall Match preparation');
assert.ok(prepDomain.includes('electricityInformationExcluded: true'), 'Electricity must be excluded from Hall Match preparation');
assert.ok(prepDomain.includes('location'), 'Hall Match location preparation missing');
assert.ok(prepDomain.includes('roadVisibility'), 'Hall Match road visibility preparation missing');
assert.ok(prepDomain.includes('hallCapacity'), 'Hall Match capacity preparation missing');
assert.ok(prepDomain.includes('hallAvailability'), 'Hall Match availability preparation missing');
assert.ok(prepDomain.includes('bookingPrice'), 'Hall Match booking price preparation missing');
assert.ok(prepDomain.includes('nearbyPlaces'), 'Hall Match nearby places preparation missing');
assert.ok(prepDomain.includes('propertyPhotos'), 'Hall Match photo preparation missing');
assert.ok(prepDomain.includes('vacantUnitIdentification'), 'Hall Match real-world hall identifier preparation missing');
assert.ok(prepDomain.includes('preparedForCustomerSearch: isAvailable'), 'Available halls must be prepared for customer search');
assert.ok(prepDomain.includes('unavailableSearchSuppression: !isAvailable'), 'Unavailable halls must be suppressed from search');
assert.ok(prepDomain.includes('eligibleForAvailabilityVerification: true'), 'Availability verification preparation missing');
assert.ok(prepDomain.includes('mostRecentConfirmedBookingAvailabilityPrepared: true'), 'Most recent availability confirmation preparation missing');
assert.ok(prepDomain.includes('availabilityStatus'), 'Search priority availability status missing');
assert.ok(prepDomain.includes('freshnessOfAvailabilityConfirmations'), 'Search priority freshness signal missing');
assert.ok(prepDomain.includes('rankingPerformedNow: false'), 'Search ranking must not run now');
assert.ok(prepDomain.includes('approvedBatchRotationPrepared: true'), 'Smart Rotation preparation missing');
assert.ok(prepDomain.includes('limitedSearchResultBatchesPrepared: true'), 'Limited result batch preparation missing');
assert.ok(prepDomain.includes('manualPricingEntryAllowed: false'), 'Manual unlock pricing must be disabled');
assert.ok(prepDomain.includes('official-pataspace-event-hall-unlock-pricing-structure'), 'Unlock pricing source missing');
assert.ok(prepDomain.includes('official-pataspace-event-hall-verified-access-pricing-structure'), 'Verified Access pricing source missing');
assert.ok(prepDomain.includes('fewMatchesMayRecommendUnlock: true'), 'Few matches unlock recommendation prep missing');
assert.ok(prepDomain.includes('manyMatchesMayRecommendVerifiedAccess: true'), 'Many matches verified access prep missing');
assert.ok(prepDomain.includes('request-viewing-through-platform'), 'Viewing platform request missing');
assert.ok(prepDomain.includes('call-property-manager-or-contact-person'), 'Call contact method missing');
assert.ok(prepDomain.includes('whatsapp-property-manager-or-contact-person'), 'WhatsApp contact method missing');
assert.ok(prepDomain.includes('confirm-attended-viewing'), 'Customer attended viewing follow-up missing');
assert.ok(prepDomain.includes('confirm-booked-hall'), 'Customer booked hall follow-up missing');
assert.ok(prepDomain.includes('stop-hall-match-notifications-after-finding-hall'), 'Stop Hall Match notification follow-up missing');
assert.ok(prepDomain.includes('reviewAvailableAfterEventHasTakenPlace: true'), 'Hall review timing preparation missing');
assert.ok(prepDomain.includes('oneMonthDelayRuleApplies: false'), 'Residential/commercial one-month delay must not apply to halls');
assert.ok(prepDomain.includes('availability-confirmation-reminders'), 'Availability reminders missing');
assert.ok(prepDomain.includes('hall-status-updates'), 'Hall status notification missing');
assert.ok(prepDomain.includes('unlock-and-verified-access-notifications'), 'Unlock/Verified Access notifications missing');
assert.ok(prepDomain.includes('availability-verification-support'), 'AI Admin availability verification support missing');
assert.ok(prepDomain.includes('booking-availability-monitoring'), 'AI Admin booking availability monitoring missing');
assert.ok(prepDomain.includes('review-prioritisation'), 'AI Admin review prioritisation missing');
assert.ok(prepDomain.includes('invisibleAssistant: true'), 'AI Admin Assistant must remain invisible');
assert.ok(prepDomain.includes('replacesPlatformAdministrator: false'), 'AI Admin Assistant must not replace Platform Administrator');
assert.ok(prepDomain.includes('availability-confirmation-activity'), 'Health Monitor availability activity metric missing');
assert.ok(prepDomain.includes('search-demand'), 'Health Monitor search demand metric missing');
assert.ok(prepDomain.includes('areas-with-limited-event-hall-supply'), 'Health Monitor limited hall supply metric missing');
assert.ok(prepDomain.includes('halls-awaiting-verification'), 'Health Monitor awaiting verification metric missing');
assert.ok(prepDomain.includes('registrantActionRequiredNow: false'), 'Registrant should not need action now');
assert.ok(foundationSource.includes('eventHallPreparedSystems: EVENT_HALL_PREPARED_SYSTEMS'), 'Foundation snapshot must expose event hall preparation systems');

console.log('PataSpace event hall system preparation checks passed.');
