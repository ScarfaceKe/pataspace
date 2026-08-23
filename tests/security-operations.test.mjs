import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/security-operations.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/security-operations/service.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/admin/security/page.tsx', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

assert.ok(domain.includes('invisibleToNormalUsers: true'), 'Security operations must be invisible to normal users');
assert.ok(domain.includes('investigateFirstRecommendSecond: true'), 'Investigate first principle missing');
assert.ok(domain.includes('interruptFounderOnlyWhenGenuinelyNecessary: true'), 'Founder interruption rule missing');
for (const display of ['Active Security Status','Active Investigations','Critical Security Alerts','Fraud Cases Awaiting Review','AI Recommendations','Repeat Offender Monitoring','Security Trends','Platform Protection Status']) assert.ok(domain.includes(display), `Dashboard display missing ${display}`);
for (const category of ['Account Impersonation','Property Impersonation','Unlock This Listing bypass attempts','Verified Access bypass attempts','Protected information access attempts','Platform manipulation','Multiple account abuse','Suspicious registration behaviour','Malicious platform activity','Security attacks']) assert.ok(domain.includes(category), `Fraud category missing ${category}`);
for (const step of ['Detect the activity','Collect evidence','Analyse behaviour','Compare against historical activity','Calculate confidence','Recommend an action','Explain reasoning']) assert.ok(domain.includes(step), `AI workflow step missing ${step}`);
for (const action of ['Approve recommendation','Reject recommendation','Request additional investigation','Continue monitoring','Close case']) assert.ok(domain.includes(action), `Founder action missing ${action}`);
assert.ok(domain.includes('immediateThreatContainmentAllowed: true'), 'Immediate containment missing');
for (const protect of ['Blocking malicious requests','Preventing unauthorised access','Protecting customer information','Protecting payment services','Protecting platform infrastructure']) assert.ok(domain.includes(protect), `Protection action missing ${protect}`);
for (const repeat of ['Repeated platform manipulation','Repeated impersonation','Repeated bypass attempts','Repeated malicious registrations','Repeated security violations']) assert.ok(domain.includes(repeat), `Repeat offender signal missing ${repeat}`);
assert.ok(domain.includes('continuesLearningSilently: true'), 'Trust intelligence learning missing');
assert.ok(domain.includes('usersIncludingFounderCannotSeeOrEditInternalTrustAssessment: true'), 'Trust assessment invisibility missing');
assert.ok(domain.includes('maintainsOperationalHistoryForEveryProperty: true'), 'Property reputation history missing');
assert.ok(domain.includes('improvesAiDecisionMakingWithoutUnfairlyAffectingLegitimateProperties: true'), 'Fair property reputation rule missing');
for (const metric of ['Number of investigations','Investigations resolved','Active investigations','Security incidents over time','Fraud categories','AI investigation accuracy','Repeat offender trends','Platform protection performance']) assert.ok(domain.includes(metric), `Security analytics missing ${metric}`);
for (const principle of ['Protect legitimate users','Investigate before accusing','Gather evidence before recommending action','Minimise false positives','Preserve Founder authority','Maintain platform integrity']) assert.ok(domain.includes(principle), `Enforcement principle missing ${principle}`);
assert.ok(domain.includes('permanentEnforcementNormallyRequiresFounderApproval: true'), 'Permanent enforcement Founder approval missing');
assert.ok(domain.includes('immediateContainmentAllowedForPlatformProtection: true'), 'Immediate containment permission missing');
for (const learn of ['learnsFromFounderDecisions','learnsFromResolvedInvestigations','learnsFromFalsePositives','learnsFromConfirmedFraudCases','learnsFromOperationalHistory','neverModifiesFounderApprovedBusinessRulesOrPolicies']) assert.ok(domain.includes(`${learn}: true`), `AI learning rule missing ${learn}`);
for (const report of ['Security Summary','Fraud Investigation Report','Investigation History','Repeat Offender Report','Platform Protection Report','Security Trend Report','Custom Date Range Report']) assert.ok(domain.includes(report), `Report missing ${report}`);
assert.ok(domain.includes('reportsSecurelyProtected: true'), 'Report security missing');
assert.ok(domain.includes('timelineSearchable: true'), 'Timeline searchability missing');
assert.ok(domain.includes('fullyAuditable: true'), 'Auditability missing');

for (const fn of ['createSecurityCase','containImmediateThreat','recordFounderSecurityDecision','runSecurityIntelligenceScan','listSecurityCases','getSecurityAnalytics','getSecurityTimeline','generateSecurityReport']) assert.ok(service.includes(fn), `Service missing ${fn}`);
assert.ok(service.includes('readReviewStore'), 'Review intelligence integration missing');
assert.ok(service.includes('readUnlockStore'), 'Unlock bypass monitoring missing');
assert.ok(service.includes('readVerifiedAccessStore'), 'Verified Access bypass monitoring missing');
assert.ok(service.includes('readAuthStore'), 'Account abuse monitoring missing');
assert.ok(page.includes('Security Operations Centre'), 'Security page missing');
assert.ok(page.includes('Fraud Case Management'), 'Fraud case page section missing');
assert.ok(page.includes('Approve') && page.includes('Reject') && page.includes('Request additional investigation') && page.includes('Continue monitoring') && page.includes('Close case'), 'Founder decision actions missing');
assert.ok(foundation.includes('securityOperationsCentre: SECURITY_OPERATIONS_CENTRE'), 'Foundation snapshot must expose Security Operations Centre');
assert.ok(dashboard.includes('/admin/security'), 'Dashboard link missing');

console.log('PataSpace security operations checks passed.');
