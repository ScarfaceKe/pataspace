import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/platform-health.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/platform-health/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/admin/health/page.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

assert.ok(domain.includes('invisibleToCustomers: true'), 'Health Monitor must be invisible to customers');
for (const item of ['Keep the platform stable','Detect operational issues early','Recover from minor failures automatically','Protect customer experience','Support Founder decision-making']) assert.ok(domain.includes(item), `Missing philosophy ${item}`);
assert.ok(domain.includes('overallHealthScore: true'), 'Overall health score missing');
for (const component of ['Server Health','Database Health','Payment System Health','Match Engine Health','Search Performance','Property Verification Health','Daily Vacancy Confirmation Health','Notification Delivery Health','AI Operations Health','API & Integration Health']) assert.ok(domain.includes(component), `Missing health component ${component}`);
for (const healing of ['Failed notification delivery','Background job failures','Temporary synchronisation problems','Receipt regeneration','Cache refresh','Search indexing delays','Temporary API interruptions','Minor AI processing failures']) assert.ok(domain.includes(healing), `Missing AI self-healing ${healing}`);
for (const alert of ['Platform outage','Payment gateway failure','Security breach','Critical database failure','AI unable to recover an important service','Customer-impacting operational failures']) assert.ok(domain.includes(alert), `Missing Founder alert ${alert}`);
assert.ok(domain.includes("channels: ['Founder Dashboard', 'WhatsApp']"), 'Founder alert channels missing');
assert.ok(domain.includes('routineOperationalIssuesInterruptFounder: false'), 'Routine issues must not interrupt Founder');
assert.ok(domain.includes('objectiveIsUnmetDemandNotPopularity: true'), 'Opportunity intelligence objective missing');
for (const signal of ['Property Category','Property Type','County','Town','Estate or Neighbourhood','Price Range','Search Frequency','Matching Properties Available','Verified Properties Available','Failed Search Count']) assert.ok(domain.includes(signal), `Missing opportunity signal ${signal}`);
assert.ok(domain.includes('critical:') && domain.includes('growing:') && domain.includes('emerging:'), 'Opportunity ranking missing');
for (const ai of ['Market demand','Property supply','Customer behaviour','Geographic trends','Vacancy trends','Registration growth','Verification trends','Platform performance']) assert.ok(domain.includes(ai), `AI business intelligence missing ${ai}`);
assert.ok(domain.includes('recommendationsNeverModifyFounderRules: true'), 'AI recommendations must never modify Founder rules');
for (const report of ['Platform Health','Operational Health','AI Performance','Payment Health','Search Health','Verification Health','Notification Health','Opportunity Queue','Opportunity Progress']) assert.ok(domain.includes(report), `Health reporting missing ${report}`);
assert.ok(domain.includes('neverExposeCustomerInformationUnnecessarily: true'), 'Customer info privacy missing');
assert.ok(domain.includes('founderAdministrationOnly: true'), 'Founder-only business intelligence missing');
assert.ok(domain.includes('monitoringDataSecurelyProtected: true'), 'Monitoring security missing');

assert.ok(service.includes('calculateHealthScores'), 'Health score service missing');
assert.ok(service.includes("overall-platform-health"), 'Overall score service missing');
assert.ok(service.includes('analyseSearchOpportunities'), 'Opportunity analysis service missing');
assert.ok(service.includes('BusinessOpportunity'), 'Business opportunity persistence missing');
assert.ok(service.includes('updateBusinessOpportunityStatus'), 'Opportunity history/status update missing');
assert.ok(service.includes('getPlatformHealthReport'), 'Health reporting service missing');
assert.ok(foundation.includes('platformHealthMonitor: PLATFORM_HEALTH_MONITOR_FOUNDATION'), 'Foundation snapshot must expose Platform Health Monitor');
assert.ok(page.includes('Overall Platform Health'), 'Health page must show overall health');
assert.ok(page.includes('Business Opportunity Queue'), 'Health page must show opportunity queue');
assert.ok(dashboard.includes('/admin/health'), 'Dashboard must link Platform Health');

console.log('PataSpace platform health monitor checks passed.');
