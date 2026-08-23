import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/customer-home.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/customer/home/page.tsx', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/CustomerHomeStart.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const customerDashboard = readFileSync(new URL('../app/dashboard/customer/page.tsx', import.meta.url), 'utf8');
const matchComponents = [
  readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/ShopMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/OfficeMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/EventHallMatchSearch.tsx', import.meta.url), 'utf8')
].join('\n');

assert.ok(domain.includes('What would you like us to help you find today?'), 'Customer home question missing');
assert.ok(domain.includes('firstScreenIsDashboardOrActivityFeed: false'), 'Customer home must not be dashboard/activity first');
for (const label of ['🏠 Find a Home','🏪 Find a Shop','🏢 Find an Office','🎉 Find an Event Hall']) assert.ok(domain.includes(label), `Missing choice ${label}`);
assert.ok(domain.includes('selectedCategoryImmediatelyEntersAiMatchWorkflow: true'), 'Category should enter AI Match workflow');
assert.ok(domain.includes('matchWorkflowsUseToggleFiltersAndAiSearchDescription: true'), 'Match workflow filter/AI description rule missing');
assert.ok(domain.includes('dashboardStillAvailableButNotFirstScreen: true'), 'Dashboard should remain available but not first');
for (const section of ['Saved Searches','Saved Properties','Recently Viewed','Active Unlock This Listing','Active Verified Access','Viewing Requests','Notifications','Settings']) assert.ok(domain.includes(section), `Dashboard section missing ${section}`);
assert.ok(domain.includes('futurePromptsMayReplaceWithDashboardFeed: false'), 'Future prompts must not replace customer home');
assert.ok(page.includes('CustomerHomeStart'), 'Customer home page must render CustomerHomeStart not DashboardShell');
assert.ok(!page.includes('DashboardShell'), 'Customer home page must not be dashboard shell');
assert.ok(component.includes('Open My Dashboard'), 'Customer dashboard should remain accessible');
assert.ok(foundation.includes('customerHomeScreen: CUSTOMER_HOME_SCREEN_STANDARD'), 'Foundation snapshot must expose customer home standard');
assert.ok(customerDashboard.includes('My Saved Properties') && customerDashboard.includes('My Verified Access'), 'Customer dashboard sections must remain organized separately');
assert.ok(matchComponents.includes('Tell us more to help us find your ideal property.'), 'Match workflows must include Search Description');

console.log('PataSpace customer home screen checks passed.');
