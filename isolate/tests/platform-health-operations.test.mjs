import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/platform-health-operations.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/platform-health-operations/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/admin/health/operations/page.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

assert.ok(domain.includes('invisibleToCustomers: true'), 'Operations Centre must be invisible to customers');
for (const item of ['Overall Platform Health Score','Individual Health Scores','Current Platform Status','Active AI Recovery Tasks','Active Critical Incidents','Open Business Opportunities','System Performance Summary','AI Operational Summary']) assert.ok(domain.includes(item), `Dashboard display missing ${item}`);
for (const serviceName of ['Authentication Service','Property Registration Service','Property Verification Service','House Match Engine','Shop Match Engine','Office Match Engine','Event Hall Match Engine','Payment Service','Unlock This Listing Service','Verified Access Service','Viewing Workflow','Reviews & Ratings','Notification Service','AI Admin Assistant','Platform Analytics','Revenue Intelligence']) assert.ok(domain.includes(serviceName), `Service monitoring missing ${serviceName}`);
for (const severity of ['minor','moderate','critical']) assert.ok(domain.includes(severity), `Incident severity missing ${severity}`);
for (const recovery of ['Notification service restarted','Failed receipts regenerated','Background jobs restarted','Search index refreshed','Payment callback queue recovered','Temporary API connection restored','Database optimisation completed']) assert.ok(domain.includes(recovery), `Recovery example missing ${recovery}`);
for (const metric of ['System uptime','Recovery success rate','Average recovery time','Incident frequency','Service reliability','AI recovery effectiveness','Platform stability trends']) assert.ok(domain.includes(metric), `Reliability analytics missing ${metric}`);
for (const event of ['Critical incidents','Successful recoveries','Platform improvements','Major verification milestones','Payment service events','Significant growth events','Business Opportunity milestones']) assert.ok(domain.includes(event), `Timeline event missing ${event}`);
for (const report of ['Slow-performing services','Frequently failing processes','Improving services','Services requiring optimisation','Operational bottlenecks','Platform stability recommendations']) assert.ok(domain.includes(report), `Diagnostic report missing ${report}`);
for (const trend of ['Verification becoming faster','Payment failures decreasing','Notification reliability improving','Search performance improving','Match accuracy increasing','Vacancy confirmations becoming more consistent']) assert.ok(domain.includes(trend), `Operational trend missing ${trend}`);
assert.ok(domain.includes('routineRecoveriesRemainInvisible: true'), 'Routine recoveries must remain invisible');
assert.ok(domain.includes('criticalChannels'), 'Critical channels missing');
assert.ok(domain.includes('neverAlterFounderApprovedBusinessRules: true'), 'Continuous improvement must not alter Founder rules');
assert.ok(domain.includes('allOperationalActionsAuditable: true'), 'Operational actions must be auditable');

for (const fn of ['classifyIncident','createIncident','recordRecoveryAction','getLiveServiceMonitoring','getReliabilityAnalytics','getRecoveryHistory','getAiDiagnosticReports','getOperationalTrends','getPlatformHealthOperationsSnapshot']) assert.ok(service.includes(fn), `Missing service ${fn}`);
assert.ok(service.includes('customerImpact') && service.includes('founderNotificationRequired'), 'Incident classification must consider customer impact and Founder notification');
assert.ok(service.includes('getPlatformHealthReport'), 'Operations Centre must integrate Platform Health Monitor Foundation');
assert.ok(page.includes('Platform Health Operations Centre'), 'Operations page missing');
assert.ok(page.includes('Live Service Monitoring'), 'Live service monitoring page section missing');
assert.ok(page.includes('AI Diagnostic Reports'), 'Diagnostics page section missing');
assert.ok(page.includes('Business Opportunity Progress'), 'Business opportunity progress page section missing');
assert.ok(page.includes('Founder Health Timeline'), 'Founder timeline page section missing');
assert.ok(foundation.includes('platformHealthOperationsCentre: PLATFORM_HEALTH_OPERATIONS_CENTRE'), 'Foundation snapshot must expose operations centre');
assert.ok(dashboard.includes('/admin/health/operations'), 'Dashboard link missing');

console.log('PataSpace platform health operations checks passed.');
