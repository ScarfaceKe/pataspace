import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/customer-experience.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/customer-experience/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const customerHome = readFileSync(new URL('../src/domain/customer-home.ts', import.meta.url), 'utf8');

for (const category of ['Houses','Shops','Offices','Event Halls']) assert.ok(domain.includes(category), `Customer experience applies to ${category}`);
assert.ok(customerHome.includes('What would you like us to help you find today?'), 'Customer home standard must remain');
assert.ok(domain.includes('customerNeverLandsOnDashboardImmediatelyAfterSignIn: true'), 'Customers must not land on dashboard first');
for (const option of ['🏠 Find a Home','🏪 Find a Shop','🏢 Find an Office','🎉 Find an Event Hall']) assert.ok(domain.includes(option), `Missing home option ${option}`);
for (const step of ['Intelligent toggle filters','AI Search Description','AI Match Engine','Category-specific Match workflow']) assert.ok(domain.includes(step), `Search journey missing ${step}`);
for (const section of ['Saved Searches','Saved Properties','Recently Viewed','Active Unlock This Listing','Active Verified Access','Viewing Requests','Notifications','Settings']) assert.ok(domain.includes(section), `Dashboard section missing ${section}`);
assert.ok(domain.includes('neverBypassCustomerAccessControl: true'), 'Saved properties must not bypass access control');
assert.ok(domain.includes('expiredAccessReturnsToPublicInformationOnly: true'), 'Recently viewed expired access rule missing');
assert.ok(domain.includes('unlockRemainingTimeShown: true'), 'Active unlock remaining time missing');
assert.ok(domain.includes('verifiedAccessRemainingTimeShown: true'), 'Verified Access remaining time missing');
assert.ok(domain.includes('remainingTimeUpdatesAutomatically: true'), 'Remaining time auto-update missing');
assert.ok(domain.includes("We couldn't find an exact match for your recent search"), 'Smart search recovery prompt missing');
assert.ok(domain.includes('acceptanceCreatesSavedSearch: true'), 'Search recovery should create saved search');
assert.ok(domain.includes('monitoredByAiPersonalPropertyAssistant: true'), 'AI Personal Property Assistant missing');
assert.ok(domain.includes('Consider increasing your budget slightly.'), 'Minimal AI budget guidance missing');
assert.ok(domain.includes('Try expanding your search to nearby estates.'), 'Minimal AI nearby guidance missing');
assert.ok(domain.includes('neverInterruptsCustomer: true'), 'AI must not interrupt customer');
assert.ok(domain.includes('Was your viewing successful?'), 'Viewing feedback question missing');
for (const principle of ['Fast','Simple','Clear','Helpful','Consistent','Intelligent','Non-intrusive']) assert.ok(domain.includes(principle), `Customer principle missing ${principle}`);
assert.ok(domain.includes('onlyAccountOwnerMayAccess: true'), 'Customer privacy/account owner rule missing');
assert.ok(service.includes('addRecentlyViewed'), 'Recently viewed service missing');
assert.ok(service.includes('recordViewingFeedback'), 'Viewing feedback service missing');
assert.ok(service.includes('getActivePropertyAccess'), 'Active access service missing');
assert.ok(service.includes('getSmartSearchRecovery'), 'Smart search recovery service missing');
assert.ok(service.includes('trackAnalyticsEvent'), 'Analytics integration missing');
assert.ok(foundation.includes('customerExperience: CUSTOMER_EXPERIENCE_FOUNDATION'), 'Foundation snapshot must expose customer experience');

console.log('PataSpace customer experience foundation checks passed.');
