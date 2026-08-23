import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/event-hall-match-intelligence.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/match/event-hall-match-intelligence-service.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/match/EventHallMatchSearch.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const signal of ['booking-availability','verification-status','freshness-of-availability-confirmation','customer-preference-match-quality','hall-capacity','previously-approved-search-priority-rules']) {
  assert.ok(domain.includes(`'${signal}'`), `Missing ranking signal ${signal}`);
}
assert.ok(domain.includes('approvedBatchSize: 20'), 'Limited result batch size missing');
assert.ok(domain.includes('neverOverwhelmCustomersWithLongLists: true'), 'Customer overwhelm prevention missing');
assert.ok(domain.includes('maintainFairness: true'), 'Smart Rotation fairness missing');
assert.ok(domain.includes('giveVisibilityToDifferentQualifiedHalls: true'), 'Smart Rotation visibility fairness missing');
assert.ok(domain.includes('neverIgnoreSearchPriorityRules: true'), 'Smart Rotation must respect Search Priority');
assert.ok(domain.includes('customerShouldNotNotice: true'), 'Smart Rotation should be invisible');
assert.ok(domain.includes('WhyThisHallMatchesItem'), 'Why This Hall Matches structure missing');
assert.ok(domain.includes("label: 'Summary'"), 'Summary label missing');
assert.ok(domain.includes('clearlyLabelled: true'), 'Summary must be clearly labelled');
assert.ok(domain.includes('neverInventsOrAssumesInformation: true'), 'Summary must never invent or assume information');
assert.ok(domain.includes('inventedOrAssumedInformationAllowed: false'), 'Summary output must forbid invented or assumed information');
for (const action of ['twoCoverPhotosOnlyBeforeAccess','propertySummary','summary','whyThisHallMatches','unlockThisListing','verifiedAccess','requestViewingLockedUntilAccess','callPropertyManagerOrLeasingAgentLockedUntilAccess','whatsappPropertyManagerOrLeasingAgentLockedUntilAccess','additionalPhotosLockedUntilAccess']) {
  assert.ok(domain.includes(action), `Missing property card preparation ${action}`);
}
assert.ok(domain.includes('official-pataspace-event-hall-unlock-pricing-structure'), 'Official hall Unlock pricing source missing');
assert.ok(domain.includes('manualPriceEntryAllowed: false'), 'Manual unlock price entry must be disabled');
assert.ok(domain.includes('expiryRulesInherited: true'), 'Unlock expiry rules must be inherited');
assert.ok(domain.includes('oneOrTwoSuitableHallsPrioritizeUnlock: true'), 'Few halls unlock recommendation missing');
assert.ok(domain.includes('severalSuitableHallsRecommendVerifiedAccess: true'), 'Several halls Verified Access recommendation missing');
assert.ok(domain.includes('customerAlwaysRetainsBothOptions: true'), 'Customer must retain both options');
assert.ok(domain.includes('customerStillCanUnlockIndividualHalls: true'), 'Individual hall unlock must remain available');
assert.ok(domain.includes('reviewInvitationAfterEventHasTakenPlace: true'), 'Hall-specific review timing missing');
assert.ok(domain.includes('oneMonthDelayRuleApplies: false'), 'One-month review delay must not apply to halls');
assert.ok(domain.includes('waterInformationExcluded: true'), 'Water exclusion missing');
assert.ok(domain.includes('electricityInformationExcluded: true'), 'Electricity exclusion missing');
assert.ok(domain.includes('dailyVacancyConfirmationExcluded: true'), 'Daily Vacancy Confirmation exclusion missing');

assert.ok(service.includes('getEventHallMatchScore'), 'Best Match ranking service missing');
assert.ok(service.includes('rotateWithinPriority'), 'Smart Rotation service missing');
assert.ok(service.includes('respectsSearchPriority: true'), 'Smart Rotation must respect Search Priority in response');
assert.ok(service.includes('invisibleToCustomer: true'), 'Smart Rotation must be invisible in response');
assert.ok(service.includes('cards'), 'Property card response missing');
assert.ok(service.includes('buildWhyThisHallMatches'), 'Why This Hall Matches service missing');
assert.ok(service.includes('buildEventHallSummary'), 'Summary service missing');
assert.ok(service.includes('buildEventHallUnlockPreparation'), 'Unlock preparation service missing');
assert.ok(service.includes('buildEventHallVerifiedAccessRecommendation'), 'Verified Access recommendation service missing');
assert.ok(service.includes('betterFewRelevantThanNone: true'), 'Approved no-results behaviour missing');
assert.ok(service.includes('buildCustomerAccessControlPreparation'), 'Customer Access Control preparation missing');

assert.ok(component.includes('/api/match/event-hall/intelligent'), 'Customer UI must use intelligence API');
assert.ok(component.includes('Summary:'), 'Customer card must show clearly labelled Summary');
assert.ok(component.includes('Unlock This Listing'), 'Customer card must show Unlock This Listing');
assert.ok(component.includes('Verified Access recommended. Individual hall unlock remains available.'), 'Verified Access recommendation must preserve individual hall unlock');
assert.ok(component.includes('Contact details, WhatsApp, additional photos, and Request Viewing unlock after access is granted.'), 'Pre-access lock message missing');
assert.ok(component.includes('Reviews become available after the event has taken place.'), 'Hall review timing message missing');
assert.ok(!component.includes('<button className="secondary-action" type="button">Request Viewing</button>'), 'Request Viewing must not be exposed before access');
assert.ok(!component.includes('<button className="secondary-action" type="button">Call Property Manager'), 'Call action must not be exposed before access');
assert.ok(!component.includes('<button className="secondary-action" type="button">WhatsApp'), 'WhatsApp action must not be exposed before access');
assert.ok(foundation.includes('eventHallMatchIntelligence: EVENT_HALL_MATCH_INTELLIGENCE'), 'Foundation snapshot must expose Event Hall Match Intelligence');

console.log('PataSpace event hall match intelligence checks passed.');
