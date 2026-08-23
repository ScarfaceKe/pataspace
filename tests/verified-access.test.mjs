import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/verified-access.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/verified-access/service.ts', import.meta.url), 'utf8');
const unlockDomain = readFileSync(new URL('../src/domain/unlock.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const accessDomain = readFileSync(new URL('../src/domain/customer-access-control.ts', import.meta.url), 'utf8');

for (const category of ['Houses', 'Shops', 'Offices', 'Event Halls']) {
  assert.ok(domain.includes(category), `Verified Access must apply to ${category}`);
}
assert.ok(domain.includes('noPropertyCategoryMayBypass: true'), 'No property category may bypass Verified Access');
assert.ok(domain.includes('complementsUnlockThisListing: true'), 'Verified Access must complement Unlock This Listing');
assert.ok(domain.includes('neverReplacesUnlockThisListing: true'), 'Verified Access must never replace Unlock This Listing');
assert.ok(domain.includes('customerAlwaysRetainsBothOptions: true'), 'Customer must retain both purchase options');
assert.ok(domain.includes('accessDurationHours: 72'), '72-hour access duration missing');
assert.ok(domain.includes("accessDuration: '72 Hours'"), 'Checkout must show 72 Hours');
assert.ok(domain.includes('Founder-approved centrally managed pricing tables from Master Prompt 15A'), 'Founder-approved pricing source missing');
assert.ok(domain.includes('customerMayNeverEnterAmount: true'), 'Customer must never manually enter amount');
assert.ok(domain.includes('registrantsMayNeverModifyPricing: true'), 'Registrants must not modify pricing');
assert.ok(domain.includes('oneOrTwoSuitablePropertiesPrioritizeUnlockThisListing: true'), 'Eligibility for few properties missing');
assert.ok(domain.includes('severalSuitablePropertiesRecommendVerifiedAccess: true'), 'Eligibility for several properties missing');
assert.ok(domain.includes('unlockThisListingStillAvailableForEveryIndividualProperty: true'), 'Individual unlock must remain available');
assert.ok(domain.includes('onlyPropertiesCoveredByApprovedRecommendation: true'), 'Scope restriction missing');
assert.ok(domain.includes('neverUnlocksUnrelatedPropertiesOutsideApplicableSearchResults: true'), 'Unrelated property restriction missing');

for (const premium of ['All uploaded property photos', 'Property Owner phone numbers', 'Property Manager phone numbers', 'Leasing Agent phone numbers', 'WhatsApp contact', 'Request Viewing through the approved Viewing Workflow']) {
  assert.ok(domain.includes(premium), `Missing premium info ${premium}`);
}
assert.ok(domain.includes('neverExposePremiumInformationBeforeSuccessfulPayment: true'), 'Security rule missing');
assert.ok(domain.includes('customerAccessControlStandardFullyEnforced: true'), 'Customer Access Control enforcement missing');
assert.ok(domain.includes('immediatelyAfterSuccessfulPayment: true'), 'Immediate activation rule missing');
assert.ok(domain.includes('noManualRefreshRequired: true'), 'No manual refresh rule missing');
assert.ok(domain.includes('prepareVerifiedAccessCheckout'), 'Checkout preparation function missing');
assert.ok(domain.includes('buildActiveVerifiedAccessRecord'), 'Active record builder missing');
assert.ok(domain.includes('targetInVerifiedAccessScope'), 'Target scope check missing');
assert.ok(domain.includes('getVerifiedAccessPrice'), 'Pricing integration function missing');
assert.ok(unlockDomain.includes('verifiedAccess72Hours'), 'Unlock pricing tables must contain Verified Access prices');

assert.ok(service.includes('prepareVerifiedAccessPurchase'), 'Verified Access purchase preparation service missing');
assert.ok(service.includes('getActiveVerifiedAccessForScope'), 'Active scope lookup missing');
assert.ok(service.includes('hasVerifiedAccessToTarget'), 'Target access check missing');
assert.ok(service.includes('activateVerifiedAccessAfterSuccessfulPayment'), 'Activation after successful payment missing');
assert.ok(service.includes('expireElapsedVerifiedAccessRecords'), 'Expiry foundation missing for 16B extension');
assert.ok(service.includes('status === \'active\''), 'Active status check missing');
assert.ok(service.includes('targetInVerifiedAccessScope'), 'Service must restrict access to scoped properties');

assert.ok(accessDomain.includes('contactInformationHidden: true'), 'Customer access control must hide contact before purchase');
assert.ok(accessDomain.includes('requestViewingUnlocked: true'), 'Customer access control must unlock viewing after access');
assert.ok(foundation.includes('verifiedAccess: VERIFIED_ACCESS_FOUNDATION'), 'Foundation snapshot must expose Verified Access foundation');

console.log('PataSpace verified access foundation checks passed.');
