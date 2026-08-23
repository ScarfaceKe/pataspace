import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/founder-admin.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/founder-admin/service.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/admin/founder/page.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

assert.ok(domain.includes('founderIsHighestAuthority: true'), 'Founder highest authority missing');
for (const authority of ['Change business rules','Change Unlock This Listing pricing','Change Verified Access pricing','Change AI operational behaviour','Change platform policies','Manage administrator permissions','Override AI recommendations','Approve critical platform decisions','View complete platform analytics','Configure system-wide settings']) assert.ok(domain.includes(authority), `Founder authority missing ${authority}`);
assert.ok(domain.includes('AI Operations Officer'), 'AI Operations Officer concept missing');
assert.ok(domain.includes('alwaysUnderFounderSupervision: true'), 'AI must be under Founder supervision');
assert.ok(domain.includes('neverBypassesFounderPermissions: true'), 'AI must not bypass Founder permissions');
for (const level of ['level1AiActsAutomatically','level2AiInvestigatesAndRecommends','level3FounderExclusiveDecisions']) assert.ok(domain.includes(level), `AI authority level missing ${level}`);
for (const silent of ['Notification retries','Receipt regeneration','Routine monitoring','Spam filtering','Minor customer support','Background platform optimisation','Routine operational health checks']) assert.ok(domain.includes(silent), `Level 1 operation missing ${silent}`);
for (const sensitive of ['Property verification decisions','Suspicious payment activity','Reported reviews','Potential fraudulent accounts','Disputed viewing requests','Verification inconsistencies']) assert.ok(domain.includes(sensitive), `Level 2 case missing ${sensitive}`);
for (const exclusive of ['Business rules','Platform pricing','Founder-approved workflows','Platform policies','AI operational rules','Security permissions','Permanent account bans','Platform-wide configuration','Founder Blueprint decisions']) assert.ok(domain.includes(exclusive), `Founder exclusive decision missing ${exclusive}`);
for (const metric of ['activeCustomers','activePropertyOwners','activePropertyManagers','activeLeasingAgents','registeredProperties','verifiedProperties','pendingVerifications','activeUnlockThisListingPurchases','activeVerifiedAccessPurchases','viewingRequests','reviewsAwaitingAttention','dailyVacancyConfirmationCompliance','platformHealthStatus']) assert.ok(domain.includes(metric), `Overview metric missing ${metric}`);
for (const decision of ['approve','reject','request-further-review']) assert.ok(domain.includes(decision), `Founder decision missing ${decision}`);
for (const audit of ['Approvals','Rejections','Pricing changes','Business rule changes','Security actions','Manual overrides']) assert.ok(domain.includes(audit), `Audit action missing ${audit}`);
assert.ok(domain.includes('highestLevelPlatformSecurity: true'), 'Highest security missing');
assert.ok(domain.includes('aiOperationsOfficerCannotOverrideFounderAuthority: true'), 'AI cannot override founder missing');

assert.ok(service.includes('getFounderDashboardOverview'), 'Founder overview service missing');
assert.ok(service.includes('getFounderAiSummary'), 'AI Summary service missing');
assert.ok(service.includes('getFounderApprovalCases'), 'Approval Centre service missing');
assert.ok(service.includes('founderQuickSearch'), 'Founder quick search missing');
assert.ok(service.includes('recordFounderAuditAction'), 'Audit trail recording missing');
assert.ok(service.includes('decideFounderApproval'), 'Founder approval decision service missing');
assert.ok(service.includes('getFounderAuditTrail'), 'Audit trail retrieval missing');

assert.ok(page.includes('Founder Administration Dashboard'), 'Founder Dashboard page missing');
assert.ok(page.includes('AI Summary Panel'), 'AI Summary Panel missing');
assert.ok(page.includes('Founder Approval Centre'), 'Founder Approval Centre missing');
assert.ok(page.includes('Audit Trail'), 'Audit Trail section missing');
assert.ok(page.includes('Approve') && page.includes('Reject') && page.includes('Request further review'), 'Approval actions missing');
assert.ok(page.includes('AI Operations Officer assists but never overrides Founder decisions'), 'AI governance wording missing');
assert.ok(foundation.includes('founderAdminDashboard: FOUNDER_ADMIN_DASHBOARD'), 'Foundation snapshot must expose Founder Dashboard');
assert.ok(dashboard.includes('/admin/founder'), 'Admin dashboard must link Founder Dashboard');

console.log('PataSpace Founder Administration Dashboard checks passed.');
