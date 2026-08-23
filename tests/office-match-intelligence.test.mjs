import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/office-match-intelligence.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/match/office-match-intelligence-service.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/match/OfficeMatchSearch.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const signal of ['active-vacancy-confirmation','verification-status','freshness-of-vacancy-confirmation','customer-preference-match-quality','road-visibility','previously-approved-search-priority-rules']) {
  assert.ok(domain.includes(`'${signal}'`), `Missing ranking signal ${signal}`);
}
assert.ok(domain.includes('approvedBatchSize: 20'), 'Limited result batch size missing');
assert.ok(domain.includes('neverOverwhelmCustomersWithLongLists: true'), 'Customer overwhelm prevention missing');
assert.ok(domain.includes('maintainFairness: true'), 'Smart Rotation fairness missing');
assert.ok(domain.includes('giveVisibilityToDifferentQualifiedOfficeListings: true'), 'Smart Rotation visibility fairness missing');
assert.ok(domain.includes('neverIgnoreSearchPriorityRules: true'), 'Smart Rotation must respect Search Priority');
assert.ok(domain.includes('customerShouldNotNotice: true'), 'Smart Rotation should be invisible');
assert.ok(domain.includes('WhyThisOfficeMatchesItem'), 'Why This Office Matches structure missing');
assert.ok(domain.includes("label: 'Summary'"), 'Summary label missing');
assert.ok(domain.includes('clearlyLabelled: true'), 'Summary must be clearly labelled');
assert.ok(domain.includes('neverInventsOrAssumesInformation: true'), 'Summary must never invent or assume information');
assert.ok(domain.includes('inventedOrAssumedInformationAllowed: false'), 'Summary output must forbid invented or assumed information');
for (const action of ['twoCoverPhotosOnlyBeforeAccess','propertySummary','summary','whyThisOfficeMatches','unlockThisListing','verifiedAccess','requestViewingLockedUntilAccess','callPropertyManagerOrLeasingAgentLockedUntilAccess','whatsappPropertyManagerOrLeasingAgentLockedUntilAccess','additionalPhotosLockedUntilAccess']) {
  assert.ok(domain.includes(action), `Missing property card preparation ${action}`);
}
assert.ok(domain.includes('official-pataspace-office-unlock-pricing-structure'), 'Official office Unlock pricing source missing');
assert.ok(domain.includes('manualPriceEntryAllowed: false'), 'Manual unlock price entry must be disabled');
assert.ok(domain.includes('expiryRulesInherited: true'), 'Unlock expiry rules must be inherited');
assert.ok(domain.includes('oneOrTwoSuitableOfficesPrioritizeUnlock: true'), 'Few offices unlock recommendation missing');
assert.ok(domain.includes('severalSuitableOfficesRecommendVerifiedAccess: true'), 'Several offices Verified Access recommendation missing');
assert.ok(domain.includes('customerAlwaysRetainsBothOptions: true'), 'Customer must retain both options');
assert.ok(domain.includes('customerStillCanUnlockIndividualOffices: true'), 'Individual office unlock must remain available');
assert.ok(domain.includes('beforeAccessContactLocked: true'), 'Customer access control contact lock missing');
assert.ok(domain.includes('beforeAccessViewingLocked: true'), 'Customer access control viewing lock missing');
assert.ok(domain.includes('beforeAccessAdditionalPhotosLocked: true'), 'Customer access control photo lock missing');

assert.ok(service.includes('getOfficeMatchScore'), 'Best Match ranking service missing');
assert.ok(service.includes('rotateWithinPriority'), 'Smart Rotation service missing');
assert.ok(service.includes('respectsSearchPriority: true'), 'Smart Rotation must respect Search Priority in response');
assert.ok(service.includes('invisibleToCustomer: true'), 'Smart Rotation must be invisible in response');
assert.ok(service.includes('cards'), 'Property card response missing');
assert.ok(service.includes('buildWhyThisOfficeMatches'), 'Why This Office Matches service missing');
assert.ok(service.includes('buildOfficeSummary'), 'Summary service missing');
assert.ok(service.includes('buildOfficeUnlockPreparation'), 'Unlock preparation service missing');
assert.ok(service.includes('buildOfficeVerifiedAccessRecommendation'), 'Verified Access recommendation service missing');
assert.ok(service.includes('betterFewRelevantThanNone: true'), 'Approved no-results behaviour missing');
assert.ok(service.includes('buildCustomerAccessControlPreparation'), 'Customer Access Control preparation missing');

assert.ok(component.includes('/api/match/office/intelligent'), 'Customer UI must use intelligence API');
assert.ok(component.includes('Summary:'), 'Customer card must show clearly labelled Summary');
assert.ok(component.includes('Unlock This Listing'), 'Customer card must show Unlock This Listing');
assert.ok(component.includes('Verified Access recommended. Individual office unlock remains available.'), 'Verified Access recommendation must preserve individual office unlock');
assert.ok(component.includes('Contact details, WhatsApp, additional photos, and Request Viewing unlock after access is granted.'), 'Pre-access lock message missing');
assert.ok(!component.includes('<button className="secondary-action" type="button">Request Viewing</button>'), 'Request Viewing must not be exposed before access');
assert.ok(!component.includes('<button className="secondary-action" type="button">Call Property Manager'), 'Call action must not be exposed before access');
assert.ok(!component.includes('<button className="secondary-action" type="button">WhatsApp'), 'WhatsApp action must not be exposed before access');
assert.ok(foundation.includes('officeMatchIntelligence: OFFICE_MATCH_INTELLIGENCE'), 'Foundation snapshot must expose Office Match Intelligence');

console.log('PataSpace office match intelligence checks passed.');
