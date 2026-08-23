import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/founder-workspace.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/founder-admin/workspace-service.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/admin/founder/workspace/page.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const section of ['dashboard','ai-summary','approval-centre','properties','users','verification','payments','viewings','reviews','notifications','reports','platform-health','settings','audit-logs']) assert.ok(domain.includes(`'${section}'`), `Missing workspace section ${section}`);
assert.ok(domain.includes('reducesAdministrativeWorkload: true'), 'Workspace should reduce workload');
assert.ok(domain.includes('highlightsMeaningfulInsightsOnly: true'), 'AI summary should highlight meaningful insights');
assert.ok(domain.includes('avoidsRawDataOverload: true'), 'AI summary should avoid raw overload');
for (const insight of ['Platform performance','Verification progress','Customer activity','Property growth','Payment performance','Vacancy confirmation compliance','Review trends','Security observations','Operational recommendations']) assert.ok(domain.includes(insight), `Missing AI summary insight ${insight}`);
assert.ok(domain.includes('onlyCasesRequiringFounderApproval: true'), 'Approval centre must contain only Founder approval cases');
for (const field of ['Case summary','Timeline','Supporting evidence','AI recommendation','Confidence level','Recommended action']) assert.ok(domain.includes(field), `Missing approval field ${field}`);
for (const action of ['Approve','Reject','Request further investigation']) assert.ok(domain.includes(action), `Missing approval action ${action}`);
for (const mgmt of ['Search properties','View property details','View verification history','View vacancy history','View viewing history','View review history','View registration history','Monitor property performance']) assert.ok(domain.includes(mgmt), `Missing property management ${mgmt}`);
for (const user of ['Customers','Property Owners','Property Managers','Leasing Agents']) assert.ok(domain.includes(user), `Missing user management ${user}`);
for (const payment of ['Successful payments','Failed payments','Payment recovery events','Transaction history','Revenue summaries','Payment anomalies detected by AI']) assert.ok(domain.includes(payment), `Missing payment workspace ${payment}`);
assert.ok(domain.includes('aiResolvesRoutineWhenAppropriate: true'), 'AI should resolve routine support');
assert.ok(domain.includes('founderSeesOnlyComplexOrSensitiveCases: true'), 'Founder should see complex support only');
for (const search of ['Properties','Users','Payments','Reviews','Viewing requests','Notifications','Verification cases','AI recommendations']) assert.ok(domain.includes(search), `Missing operational search ${search}`);
for (const notify of ['Critical security events','Approval requests','Platform outages','Payment anomalies','Major operational issues','AI summaries']) assert.ok(domain.includes(notify), `Missing Founder notification ${notify}`);
assert.ok(domain.includes('protectedFromModification: true'), 'Audit logs must be protected');
assert.ok(domain.includes('founderExclusiveToolsOnlyForFounder: true'), 'Founder exclusive security missing');
assert.ok(domain.includes('aiOperationsOfficerMustNotExceedAuthorityFromPrompt22A: true'), 'AI authority limit missing');
assert.ok(service.includes('getFounderWorkspaceSnapshot'), 'Workspace snapshot service missing');
assert.ok(service.includes('buildFounderWorkspaceSummary'), 'Workspace summary service missing');
assert.ok(page.includes('Founder Management Workspace & AI Operations Centre'), 'Workspace page missing');
assert.ok(page.includes('AI Summary Workspace'), 'AI Summary Workspace page section missing');
assert.ok(page.includes('Approval Centre'), 'Approval Centre page section missing');
assert.ok(page.includes('Operational Search'), 'Operational Search page section missing');
assert.ok(page.includes('Audit Logs'), 'Audit Logs page section missing');
assert.ok(foundation.includes('founderManagementWorkspace: FOUNDER_MANAGEMENT_WORKSPACE'), 'Foundation snapshot must expose Founder Workspace');
assert.ok(dashboard.includes('/admin/founder/workspace'), 'Dashboard link missing');

console.log('PataSpace Founder Management Workspace checks passed.');
