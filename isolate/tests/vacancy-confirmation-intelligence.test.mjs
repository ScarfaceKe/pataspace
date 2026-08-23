import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const intelligenceDomain = readFileSync(new URL('../src/domain/vacancy-confirmation-intelligence.ts', import.meta.url), 'utf8');
const vacancyDomain = readFileSync(new URL('../src/domain/vacancy-confirmation.ts', import.meta.url), 'utf8');
const vacancyService = readFileSync(new URL('../src/server/vacancy-confirmation/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const status of [
  'recently-confirmed',
  'within-24-hour-confirmation-period',
  'within-24-hour-grace-period',
  'waiting-for-verification',
  'long-overdue-for-confirmation'
]) {
  assert.ok(intelligenceDomain.includes(`'${status}'`), `Missing freshness status: ${status}`);
}
assert.ok(vacancyDomain.includes('intelligence: VacancyConfirmationIntelligenceSnapshot'), 'Vacancy records must include intelligence snapshot');
assert.ok(vacancyService.includes('buildVacancyIntelligenceSnapshot'), 'Vacancy service must build intelligence automatically');
assert.ok(intelligenceDomain.includes('oneWeekRemovalAfterHours: 168'), 'One-week removal rule missing');
assert.ok(intelligenceDomain.includes('hide-after-one-week-unconfirmed'), 'Search signal for one-week removal missing');
assert.ok(intelligenceDomain.includes('restore-after-reconfirmation'), 'Recovery after reconfirmation signal missing');
assert.ok(intelligenceDomain.includes('prefer-recently-confirmed'), 'Search should prefer recently confirmed vacancies');
assert.ok(intelligenceDomain.includes('prefer-verified-active-confirmations'), 'Search should prefer verified active confirmations');
assert.ok(intelligenceDomain.includes('prefer-fresh-listings'), 'Search should prefer fresh listings');
assert.ok(intelligenceDomain.includes('rank-waiting-for-verification-below-active-confirmations'), 'Waiting listings should rank below active confirmations');
assert.ok(intelligenceDomain.includes('fewMatchesMayStillShowRelevantProperties: true'), 'Few matches behaviour support missing');
assert.ok(intelligenceDomain.includes('betterFewRelevantThanNone: true'), 'Better few relevant than none rule missing');
assert.ok(intelligenceDomain.includes('matchEngineLogicChangedHere: false'), 'Match Engine logic must not be redesigned');

for (const phrase of [
  'detectApproachingConfirmationExpiry: true',
  'prioritizeOverdueConfirmations: true',
  'identifyManagersWithRepeatedDelays: true',
  'prepareRecommendationsForPlatformAdministrator: true',
  'automaticallyRemoveListings: false',
  'overrideConfirmationDecisions: false'
]) {
  assert.ok(intelligenceDomain.includes(phrase), `Missing AI Admin Assistant intelligence: ${phrase}`);
}

for (const phrase of [
  'identifyAreasWithManyOverdueConfirmations: true',
  'identifyManagersWhoFrequentlyMissConfirmations: true',
  'identifyVerifiedPropertiesWaitingForConfirmation: true',
  'identifyAreasWithHighConfirmationQuality: true',
  'recommendationsOnly: true',
  'automaticEnforcement: false'
]) {
  assert.ok(intelligenceDomain.includes(phrase), `Missing Platform Health Monitor intelligence: ${phrase}`);
}

for (const notification of [
  'Your vacancy confirmation is active for the next 24 hours.',
  'Your vacancy confirmation expires in 12 hours.',
  'Your vacancy confirmation expires in 1 hour.',
  'Your vacancy is awaiting confirmation. Please confirm to keep it active.',
  'Your vacancy is now waiting for verification because confirmation was not received within the required period.'
]) {
  assert.ok(intelligenceDomain.includes(notification), `Missing notification intelligence: ${notification}`);
}

assert.ok(intelligenceDomain.includes('eventHallsExcluded: true'), 'Event Halls must remain excluded');
assert.ok(foundationSource.includes('vacancyConfirmationIntelligence: VACANCY_CONFIRMATION_INTELLIGENCE'), 'Foundation snapshot must expose vacancy confirmation intelligence');

console.log('PataSpace daily vacancy confirmation intelligence checks passed.');
