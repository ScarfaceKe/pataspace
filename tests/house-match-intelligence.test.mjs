import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/house-match-intelligence.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/match/house-match-intelligence-service.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const signal of ['active-vacancy-confirmation','verification-status','freshness-of-vacancy-confirmation','customer-preference-match-quality','previously-approved-search-priority-rules']) {
  assert.ok(domain.includes(`'${signal}'`), `Missing ranking signal ${signal}`);
}
assert.ok(domain.includes('approvedBatchSize: 20'), 'Limited result batch size missing');
assert.ok(domain.includes('neverOverwhelmCustomersWithLongLists: true'), 'Customer overwhelm prevention missing');
assert.ok(domain.includes('maintainFairness: true'), 'Smart Rotation fairness missing');
assert.ok(domain.includes('neverIgnoreSearchPriorityRules: true'), 'Smart Rotation must respect Search Priority');
assert.ok(domain.includes('customerShouldNotNotice: true'), 'Smart Rotation should be invisible');
assert.ok(domain.includes('WhyThisHomeMatchesItem'), 'Why This Home Matches structure missing');
assert.ok(domain.includes("label: 'AI Summary'"), 'AI Summary label missing');
assert.ok(domain.includes('clearlyLabelled: true'), 'AI Summary must be clearly labelled');
assert.ok(domain.includes('neverInventsInformation: true'), 'AI Summary must never invent information');
assert.ok(domain.includes('inventedInformationAllowed: false'), 'AI Summary output must forbid invented information');
for (const action of ['twoCoverPhotosOnlyBeforeAccess','propertySummary','aiSummary','whyThisHomeMatches','unlockThisListing','verifiedAccess','requestViewingLockedUntilAccess','callPropertyManagerLockedUntilAccess','whatsappPropertyManagerLockedUntilAccess']) {
  assert.ok(domain.includes(action), `Missing property card preparation ${action}`);
}
assert.ok(domain.includes('official-pataspace-residential-unlock-pricing-model'), 'Official Unlock pricing source missing');
assert.ok(domain.includes('manualPriceEntryAllowed: false'), 'Manual unlock price entry must be disabled');
assert.ok(domain.includes('expiryRulesInherited: true'), 'Unlock expiry rules must be inherited');
assert.ok(domain.includes('oneOrTwoSuitableHomesEmphasizeUnlock: true'), 'Few homes unlock recommendation missing');
assert.ok(domain.includes('severalSuitableHomesRecommendVerifiedAccess: true'), 'Several homes Verified Access recommendation missing');
assert.ok(domain.includes('customerAlwaysRetainsBothOptions: true'), 'Customer must retain both options');
assert.ok(domain.includes('customerStillCanUnlockIndividualListings: true'), 'Individual unlock must remain available');

assert.ok(service.includes('getHouseMatchScore'), 'Best Match Ranking service missing');
assert.ok(service.includes('rotateWithinPriority'), 'Smart Rotation service missing');
assert.ok(service.includes('respectsSearchPriority: true'), 'Smart Rotation must respect Search Priority in response');
assert.ok(service.includes('invisibleToCustomer: true'), 'Smart Rotation must be invisible in response');
assert.ok(service.includes('cards'), 'Property card response missing');
assert.ok(service.includes('buildWhyThisHomeMatches'), 'Why This Home Matches service missing');
assert.ok(service.includes('buildHouseAiSummary'), 'AI Summary service missing');
assert.ok(service.includes('buildUnlockPreparation'), 'Unlock preparation service missing');
assert.ok(service.includes('buildVerifiedAccessRecommendation'), 'Verified Access recommendation service missing');
assert.ok(service.includes('betterFewRelevantThanNone: true'), 'Approved no-results behaviour missing');

assert.ok(component.includes('/api/match/house/intelligent'), 'Customer UI must use intelligence API');
assert.ok(component.includes('Summary:'), 'Customer card must show clearly labelled Summary');
assert.ok(!component.includes('AI Summary:'), 'Customer card must not expose AI terminology');
assert.ok(component.includes('Unlock This Listing'), 'Customer card must show Unlock This Listing');
assert.ok(component.includes('Verified Access recommended. Individual unlock remains available.'), 'Verified Access recommendation must preserve individual unlock');
assert.ok(component.includes('Contact details, WhatsApp, and Request Viewing unlock after access is granted.'), 'Pre-access contact and viewing lock message missing');
assert.ok(!component.includes('<button className="secondary-action" type="button">Request Viewing</button>'), 'Request Viewing must not be exposed before access');
assert.ok(!component.includes('<button className="secondary-action" type="button">Call Property Manager</button>'), 'Call action must not be exposed before access');
assert.ok(!component.includes('<button className="secondary-action" type="button">WhatsApp Property Manager</button>'), 'WhatsApp action must not be exposed before access');
assert.ok(domain.includes('customerAccessControl: CustomerAccessControlPreparation'), 'House cards must include customer access control preparation');
assert.ok(foundation.includes('houseMatchIntelligence: HOUSE_MATCH_INTELLIGENCE'), 'Foundation snapshot must expose House Match Intelligence');

console.log('PataSpace house match intelligence checks passed.');
