import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const unlockDomain = readFileSync(new URL('../src/domain/unlock.ts', import.meta.url), 'utf8');
const accessDomain = readFileSync(new URL('../src/domain/customer-access-control.ts', import.meta.url), 'utf8');
const unlockService = readFileSync(new URL('../src/server/unlock/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const houseDomain = readFileSync(new URL('../src/domain/house-match-intelligence.ts', import.meta.url), 'utf8');
const shopDomain = readFileSync(new URL('../src/domain/shop-match-intelligence.ts', import.meta.url), 'utf8');
const officeDomain = readFileSync(new URL('../src/domain/office-match-intelligence.ts', import.meta.url), 'utf8');
const hallDomain = readFileSync(new URL('../src/domain/event-hall-match-intelligence.ts', import.meta.url), 'utf8');

for (const phrase of ['appliesTo', 'Houses', 'Shops', 'Offices', 'Event Halls']) assert.ok(unlockDomain.includes(phrase), `Missing coverage ${phrase}`);
assert.ok(unlockDomain.includes('platformManagedPricing: true'), 'Pricing must be centrally managed');
assert.ok(unlockDomain.includes('registrantsCanConfigurePricing: false'), 'Registrants must not configure pricing');
assert.ok(unlockDomain.includes('UNLOCK_THIS_LISTING_VALIDITY_HOURS = 24'), 'Unlock validity must be exactly 24 hours');
assert.ok(unlockDomain.includes('validityPeriodHours: 24'), 'Unlock foundation must declare 24-hour validity');
assert.ok(unlockDomain.includes('expiresAutomaticallyAfter24Hours: true'), 'Unlock must expire automatically after 24 hours');
assert.ok(unlockDomain.includes('UnlockRemainingTime'), 'Unlock remaining time type missing');
assert.ok(unlockDomain.includes('unlockExpiresAt'), 'Unlock expiry date missing');
assert.ok(unlockDomain.includes('formatUnlockRemainingTime'), 'Unlock remaining time formatter missing');
assert.ok(unlockDomain.includes('Unlock Expired'), 'Unlock Expired status missing');
assert.ok(unlockDomain.includes('expiredUnlocksHidePremiumInformation: true'), 'Expired unlocks must hide premium information');
assert.ok(unlockDomain.includes('expiredUnlocksDisableViewingRequests: true'), 'Expired unlocks must disable viewing requests');
assert.ok(unlockService.includes('expireElapsedUnlockAccessRecords'), 'Unlock service must expire elapsed unlock records');
assert.ok(!unlockService.includes('unlockExpiresAt?: string'), 'Unlock service must not accept custom validity durations');
assert.ok(unlockService.includes('isUnlockAccessActive'), 'Unlock service must check active expiry state');
assert.ok(unlockDomain.includes('unitBasedUnlocking: true'), 'Unit-based unlocking missing');
assert.ok(unlockDomain.includes('resolveShopPricingCategory'), 'Shop pricing category resolver must remain centrally managed');
assert.ok(unlockDomain.includes('unlockingOneUnitDoesNotUnlockOtherUnits: true'), 'Unlocking one unit must not unlock other units');
assert.ok(unlockDomain.includes('beforeUnlockFollowsCustomerAccessControlStandard: true'), 'Before unlock must follow access control');
assert.ok(unlockDomain.includes('customerNeverRepurchasesSameUnitWhileAccessValid: true'), 'Unlock ownership memory missing');
assert.ok(unlockDomain.includes('propertyUnavailableAfterUnlockPreservesAccessHistory: true'), 'Availability after unlock rule missing');
assert.ok(unlockDomain.includes('unlockThisListingAlwaysAvailableEvenWhenVerifiedAccessRecommended: true'), 'Unlock must remain available with Verified Access recommendation');
assert.ok(unlockDomain.includes('paymentProcessingImplementedInPrompt15B: true'), 'Payment processing must be deferred to 15B');

for (const row of [
  ['single-room', 20, 100], ['bedsitter', 40, 150], ['one-bedroom', 60, 200], ['two-bedroom', 80, 250],
  ['three-bedroom', 100, 300], ['four-bedroom', 120, 400], ['five-bedroom', 140, 500], ['mixed-residential-property', 160, 500],
  ['small-shop', 50, 250], ['medium-shop', 100, 400], ['large-shop', 200, 700],
  ['shared-office', 50, 250], ['small-office', 100, 500], ['medium-office', 200, 700], ['large-office', 300, 1000], ['executive-office', 500, 1500],
  ['small-event-hall', 30, 60], ['medium-event-hall', 50, 100], ['large-event-hall', 100, 200], ['conference-hall', 100, 200], ['wedding-garden-outdoor-event-venue', 100, 200], ['multi-purpose-hall', 50, 100]
]) {
  const [category, unlockPrice, verifiedPrice] = row;
  assert.ok(unlockDomain.includes(`category: '${category}'`), `Missing pricing category ${category}`);
  assert.ok(unlockDomain.includes(`unlockThisListing: kes(${unlockPrice})`), `Missing unlock price ${unlockPrice} for ${category}`);
  assert.ok(unlockDomain.includes(`verifiedAccess72Hours: kes(${verifiedPrice})`), `Missing verified price ${verifiedPrice} for ${category}`);
}

for (const hidden of ['Property Owner phone number', 'Property Manager phone number', 'Leasing Agent phone number', 'WhatsApp contact', 'Request Viewing through the platform']) {
  assert.ok(accessDomain.includes(hidden), `Customer Access Control must hide ${hidden}`);
}
for (const unlocked of ['allPhotosUnlocked', 'phoneNumberUnlocked', 'callUnlocked', 'whatsappUnlocked', 'requestViewingUnlocked']) {
  assert.ok(accessDomain.includes(`${unlocked}: true`), `After access must unlock ${unlocked}`);
}

assert.ok(unlockService.includes('prepareUnlockThisListing'), 'Unlock checkout preparation missing');
assert.ok(unlockService.includes('grantUnlockAfterSuccessfulPayment'), 'Successful payment unlock grant service missing');
assert.ok(unlockService.includes('getActiveUnlockForTarget'), 'Unlock ownership lookup missing');
assert.ok(unlockService.includes('hasPurchasedAccess'), 'Purchased access security check missing');
assert.ok(unlockService.includes('markUnlockedPropertyUnavailable'), 'Availability after unlock handling missing');
assert.ok(foundationSource.includes('unlockThisListing: UNLOCK_THIS_LISTING_FOUNDATION'), 'Foundation snapshot must expose Unlock This Listing');
assert.ok(foundationSource.includes('unlockPricing'), 'Foundation snapshot must expose unlock pricing tables');

for (const domain of [houseDomain, shopDomain, officeDomain, hallDomain]) {
  assert.ok(domain.includes('price: { currency: \'KES\'; amount: number }'), 'Match cards must carry approved unlock price');
  assert.ok(domain.includes('manualPriceEntryAllowed: false'), 'Match cards must prevent manual unlock pricing');
}

console.log('PataSpace unlock foundation checks passed.');
