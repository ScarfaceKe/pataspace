import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/executive-dashboard.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/executive-dashboard/service.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/admin/executive/page.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const kpi of ['Active Customers','Active Property Owners','Active Property Managers','Active Leasing Agents','Total Registered Properties','Total Verified Properties','Active Unlock This Listing Purchases','Active Verified Access Purchases','Pending Property Verifications','Pending Viewing Requests','Payment Success Rate','Daily Vacancy Confirmation Compliance','Platform Health Score']) assert.ok(domain.includes(kpi), `Missing KPI ${kpi}`);
for (const growth of ['New Customers Today','New Properties Registered Today','New Verified Properties Today','New Unlock This Listing Purchases Today','New Verified Access Purchases Today','Completed Viewings Today','Reviews Submitted Today']) assert.ok(domain.includes(growth), `Missing growth metric ${growth}`);
for (const prop of ['Most Viewed Property','Most Unlocked Property','Most Requested Property Viewing','Highest Rated Property','Most Reviewed Property']) assert.ok(domain.includes(prop), `Missing property performance ${prop}`);
for (const hall of ['Most Booked Event Hall','Most Viewed Event Hall','Highest Rated Event Hall','Event Hall Booking Trends']) assert.ok(domain.includes(hall), `Missing event hall intelligence ${hall}`);
for (const geo of ['Most Active County','Fastest Growing County','Most Searched County','Most Active Town','Fastest Growing Town','Most Searched Town','Most Active Estate','Fastest Growing Estate','Most Searched Estate']) assert.ok(domain.includes(geo), `Missing geographic intelligence ${geo}`);
for (const category of ['Registration Growth','Verification Rate','Search Activity','Unlock Activity','Verified Access Activity','Revenue Contribution','Customer Demand']) assert.ok(domain.includes(category), `Missing category intelligence ${category}`);
for (const behaviour of ['Most searched property categories','Most popular price ranges','Most popular locations','Most common search filters','Most saved properties','Unlock purchasing behaviour','Verified Access purchasing behaviour','Viewing request behaviour']) assert.ok(domain.includes(behaviour), `Missing customer behaviour ${behaviour}`);
for (const ai of ['Fastest-growing business opportunities','Slower-performing areas','Emerging customer trends','Seasonal demand','Geographic opportunities','Property supply gaps','Customer demand patterns']) assert.ok(domain.includes(ai), `Missing AI business intelligence ${ai}`);
for (const rec of ['Counties needing additional property supply','Property categories experiencing high demand','Operational improvements','Revenue growth opportunities','Platform optimisation opportunities','Customer experience improvements']) assert.ok(domain.includes(rec), `Missing AI strategic recommendation ${rec}`);
for (const report of ['Daily Performance','Weekly Performance','Monthly Performance','Quarterly Performance','Annual Performance','Custom Date Range']) assert.ok(domain.includes(report), `Missing executive report ${report}`);
for (const personal of ['Preferred KPI order','Favourite dashboard widgets','Default reporting period','Preferred landing dashboard']) assert.ok(domain.includes(personal), `Missing personalisation ${personal}`);
assert.ok(domain.includes('personalisationAffectsOnlyFounderDashboard: true'), 'Personalisation scope missing');
assert.ok(domain.includes('personalisationAltersBusinessLogic: false'), 'Personalisation must not alter business logic');
assert.ok(domain.includes('onlyFounderMayAccess: true'), 'Founder-only access missing');
assert.ok(domain.includes('aiRecommendationsOnly: true'), 'AI recommendations-only missing');
assert.ok(domain.includes('founderRetainsFinalAuthority: true'), 'Founder final authority missing');
assert.ok(domain.includes('executiveAnalyticsProtected: true'), 'Executive analytics protection missing');

for (const fn of ['getFounderExecutiveKpis','getBusinessGrowthAnalytics','getPropertyPerformanceIntelligence','getEventHallExecutiveIntelligence','getGeographicIntelligence','getPropertyCategoryIntelligence','getCustomerBehaviourIntelligence','getAiBusinessIntelligence','getFounderExecutiveDashboard','generateExecutiveReport','saveFounderDashboardPersonalisation']) assert.ok(service.includes(fn), `Missing service ${fn}`);
assert.ok(service.includes('getRevenueDashboard'), 'Executive dashboard must integrate Revenue Intelligence');
assert.ok(service.includes('readAnalyticsStore'), 'Executive dashboard must integrate Platform Analytics');
assert.ok(page.includes('Founder Executive Dashboard'), 'Executive dashboard page missing');
assert.ok(page.includes('Founder Insights Panel'), 'Founder Insights Panel missing');
assert.ok(foundation.includes('founderExecutiveDashboard: FOUNDER_EXECUTIVE_DASHBOARD'), 'Foundation snapshot must expose Executive Dashboard');
assert.ok(dashboard.includes('/admin/executive'), 'Admin dashboard link missing');

console.log('PataSpace Founder Executive Dashboard checks passed.');
