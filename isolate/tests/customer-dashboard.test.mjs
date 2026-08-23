import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/customer-dashboard.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/customer-dashboard/service.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/dashboard/customer/page.tsx', import.meta.url), 'utf8');
const api = readFileSync(new URL('../app/api/dashboard/customer/route.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const section of ['My Profile','My Saved Properties','My Unlocked Properties','My Verified Access','My Viewing Requests','My Reviews','My Notifications','My Payments','My Receipts','My Account Settings','Search History']) {
  assert.ok(domain.includes(section), `Missing dashboard quick access section ${section}`);
  assert.ok(page.includes(section) || section === 'My Account Settings', `Dashboard page should expose ${section}`);
}
assert.ok(domain.includes('myVerifiedAccessDisplay'), 'My Verified Access display standard missing');
for (const field of ['purchaseDate', 'expiryDate', 'remainingTimeLiveCountdown', 'coveredPropertyCategory', 'quickAccessToEligibleProperties', 'inactiveStateClearlyDisplayed']) {
  assert.ok(domain.includes(`${field}: true`), `My Verified Access missing ${field}`);
}
assert.ok(page.includes('Purchased') && page.includes('access.intelligence?.remainingTime.display'), 'Customer dashboard must display Verified Access purchase date and remaining time');
assert.ok(service.includes('expireElapsedVerifiedAccessRecords'), 'Customer dashboard must refresh Verified Access expiry state');
assert.ok(domain.includes('myUnlockedPropertiesDisplay'), 'My Unlocked Properties display standard missing');
for (const field of ['propertyOrUnitIdentifier', 'propertyCategory', 'unlockDate', 'unlockExpiryDate', 'remainingUnlockTimeLiveCountdown', 'currentPropertyStatus', 'contactInformationAfterAccess', 'quickCall', 'quickWhatsApp', 'quickRequestViewing']) {
  assert.ok(domain.includes(`${field}: true`), `My Unlocked Properties missing ${field}`);
}
assert.ok(domain.includes("expiredUnlockDisplayStatus: 'Unlock Expired'"), 'Unlock Expired display status missing');
assert.ok(page.includes('Expires') && page.includes('remainingUnlockTime'), 'Customer dashboard must display unlock expiry and remaining time');
assert.ok(page.includes('displayStatus'), 'Customer dashboard must display Unlock/Unlock Expired status');
assert.ok(service.includes('expireElapsedUnlockAccessRecords'), 'Customer dashboard must refresh expired unlock access records');
assert.ok(domain.includes('savedPropertiesNeverUnlockPremiumInformation: true'), 'Saved properties must never unlock premium info');
for (const field of ['twoCoverPhotos','propertySummary','currentPropertyStatus','unlockThisListingAvailable','verifiedAccessRecommendationAvailable','premiumInformationUnlocked: false']) {
  assert.ok(domain.includes(field), `Saved property field missing ${field}`);
}
for (const field of ['unlockedProperties','verifiedAccess','viewingRequests','reviews','notifications','payments','receipts','searchHistory']) {
  assert.ok(domain.includes(field), `Dashboard snapshot missing ${field}`);
  assert.ok(service.includes(field), `Dashboard service missing ${field}`);
}
assert.ok(domain.includes('preferredNotificationSettingsPrepared: true'), 'Notification settings preparation missing');
assert.ok(domain.includes('passwordManagementPrepared: true'), 'Password management preparation missing');
assert.ok(domain.includes('privateToCustomer: true'), 'Search history privacy missing');
assert.ok(service.includes('filter((item) => item.customerId === profile.userId)'), 'Customer data must be filtered by own user id');
assert.ok(api.includes("profile.role !== 'customer'"), 'Dashboard API must restrict to customer role');
for (const rule of ['neverViewOtherCustomersPurchases','neverViewOtherCustomersNotifications','neverViewOtherCustomersReceipts','neverViewOtherCustomersViewingRequests','neverViewOtherCustomersSavedProperties','neverViewOtherCustomersReviews','neverViewOtherCustomersSearchHistory']) {
  assert.ok(domain.includes(`${rule}: true`), `Missing dashboard security rule ${rule}`);
}
for (const monitor of ['detectMissingPaymentRecords','detectFailedReceiptGeneration','detectBrokenViewingLinks','detectNotificationDeliveryFailures','detectSynchronisationIssues','assistsAdministratorsWithoutInterruptingCustomers']) {
  assert.ok(domain.includes(`${monitor}: true`), `Missing AI Admin dashboard health monitor ${monitor}`);
}
assert.ok(foundation.includes('customerDashboard: CUSTOMER_DASHBOARD_FOUNDATION'), 'Foundation snapshot must expose customer dashboard');
assert.ok(dashboardShell.includes('/dashboard/customer'), 'Customer dashboard link missing');

console.log('PataSpace customer dashboard checks passed.');
