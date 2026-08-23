import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/verified-access-intelligence.ts', import.meta.url), 'utf8');
const verifiedAccessDomain = readFileSync(new URL('../src/domain/verified-access.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/verified-access/service.ts', import.meta.url), 'utf8');
const statusRoute = readFileSync(new URL('../app/api/verified-access/status/route.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

assert.ok(domain.includes('complementsUnlockThisListing: true'), 'Verified Access must complement Unlock This Listing');
assert.ok(domain.includes('neverReplacesUnlockThisListing: true'), 'Verified Access must never replace Unlock This Listing');
assert.ok(domain.includes('unlockThisListingAlwaysAvailable: true'), 'Unlock This Listing must remain available');
assert.ok(domain.includes('oneOrTwoSuitablePropertiesPrioritizeUnlock: true'), 'Few properties recommendation logic missing');
assert.ok(domain.includes('severalSuitablePropertiesRecommendVerifiedAccess: true'), 'Several properties recommendation logic missing');
assert.ok(domain.includes('stillDisplayUnlockOnEveryCard: true'), 'Unlock must remain on every card');
assert.ok(domain.includes('customerAlwaysRetainsBothOptions: true'), 'Customer must retain both options');

assert.ok(domain.includes('immediatelyAfterSuccessfulPayment: true'), 'Immediate activation missing');
assert.ok(domain.includes('appliesPremiumPermissions: true'), 'Premium permission application missing');
assert.ok(domain.includes('displaysSuccessConfirmation: true'), 'Success confirmation missing');
assert.ok(domain.includes('noPageRefreshRequired: true'), 'No page refresh rule missing');
assert.ok(domain.includes("activeAccessIndicator: 'Verified Access Active'"), 'Active access indicator missing');
assert.ok(domain.includes('formatVerifiedAccessRemainingTime'), 'Remaining time formatter missing');
for (const examplePart of ['Days', 'Hours', 'Minutes']) assert.ok(domain.includes(examplePart), `Remaining time must support ${examplePart}`);

for (const premium of ['allUploadedPhotos', 'propertyOwnerPhoneNumbers', 'propertyManagerPhoneNumbers', 'leasingAgentPhoneNumbers', 'callContactPerson', 'whatsappConversation', 'requestViewingThroughPataSpace']) {
  assert.ok(domain.includes(`${premium}: active`), `Premium access flag missing: ${premium}`);
}
assert.ok(domain.includes('customerAccessControlEnforced: true'), 'Customer Access Control enforcement missing');
for (const recovery of ['survivesLogout: true', 'survivesLogin: true', 'survivesDeviceChange: true', 'survivesApplicationRestart: true', 'survivesTemporaryNetworkInterruption: true']) {
  assert.ok(domain.includes(recovery), `Access recovery missing: ${recovery}`);
}
assert.ok(domain.includes('preventsDuplicateVerifiedAccessForSameScope: true'), 'Purchase protection missing');
assert.ok(domain.includes('showAlreadyActiveWithRemainingTime: true'), 'Already active remaining time message missing');
for (const expiry of ['automaticallyRemovesPremiumAccess', 'hidesContactInformationAfterExpiry', 'hidesAdditionalPhotosAfterExpiry', 'disablesViewingRequestsAfterExpiry', 'returnsCardsToPublicView', 'noManualActionRequired: true']) {
  assert.ok(domain.includes(expiry), `Expiry management missing: ${expiry}`);
}
for (const note of ['Verified Access is now active for 72 hours.', 'Your Verified Access expires in 24 hours.', 'Your Verified Access expires in 1 hour.', 'Your Verified Access has expired. Premium information is now locked until new access is purchased.']) {
  assert.ok(domain.includes(note), `Missing notification: ${note}`);
}
assert.ok(domain.includes('cannotManuallyExtend: true'), 'Manual extension must be impossible');
assert.ok(domain.includes('cannotTransferBetweenCustomerAccounts: true'), 'Transfer protection missing');
assert.ok(domain.includes('premiumInformationProtectedWithoutActiveEntitlement: true'), 'Premium info protection missing');
assert.ok(verifiedAccessDomain.includes('intelligence?: VerifiedAccessIntelligenceSnapshot'), 'Verified Access record must carry intelligence snapshot');
assert.ok(service.includes('buildVerifiedAccessIntelligenceSnapshot'), 'Service must build intelligence snapshot');
assert.ok(service.includes('getActiveVerifiedAccessForScope'), 'Purchase protection active scope lookup missing');
assert.ok(service.includes('expireElapsedVerifiedAccessRecords'), 'Expiry handling missing');
assert.ok(service.includes('hasVerifiedAccessToTarget'), 'Target access security check missing');
assert.ok(statusRoute.includes('Verified Access Expired') && statusRoute.includes('remainingTime'), 'Status endpoint must expose indicator and remaining time');
assert.ok(foundation.includes('verifiedAccessIntelligence: VERIFIED_ACCESS_INTELLIGENCE'), 'Foundation snapshot must expose Verified Access intelligence');
assert.ok(foundation.includes('verifiedAccessNotificationSchedule: VERIFIED_ACCESS_NOTIFICATION_SCHEDULE'), 'Foundation snapshot must expose notification schedule');

console.log('PataSpace verified access intelligence checks passed.');
