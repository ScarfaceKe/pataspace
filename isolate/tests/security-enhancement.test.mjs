import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/security-enhancement.ts', import.meta.url), 'utf8');
const validation = readFileSync(new URL('../src/server/security-operations/security-validation.ts', import.meta.url), 'utf8');
const script = readFileSync(new URL('../scripts/security-validation.mjs', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../docs/enterprise-security-enhancement.md', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

assert.ok(domain.includes('permanentExtensionOfMasterPrompt14A: true'), 'Enhancement must extend Master Prompt 14A');
assert.ok(domain.includes('defenseInDepthArchitecture: true'), 'Defense-in-Depth missing');
for (const principle of ['Protect customer information','Protect property owner information','Protect business intelligence','Protect payment integrity','Protect platform availability','Protect Founder administration','Minimize attack surfaces','Validate everything','Trust nothing automatically','Detect suspicious activity early','Respond quickly','Recover safely','Continuously improve security']) assert.ok(domain.includes(principle), `Missing security philosophy ${principle}`);
assert.ok(domain.includes('aiGeneratedCodeNeverReceivesAutomaticTrust: true'), 'AI code trust standard missing');
assert.ok(domain.includes('humanAndAiCodeFollowSameSecurityRequirements: true'), 'Human and AI code equal security missing');
for (const step of ['static-security-analysis','secure-code-analysis','dependency-vulnerability-scanning','secret-detection','credential-detection','malware-scanning','configuration-validation','authentication-validation','authorization-validation','api-security-validation','input-validation-testing','output-validation-testing','payment-workflow-validation','session-security-validation','database-security-validation','logging-validation','security-focused-code-review','automated-testing','staging-environment-testing','final-deployment-approval']) assert.ok(domain.includes(`'${step}'`), `Missing validation step ${step}`);
assert.ok(domain.includes('productionDeploymentStopsOnCriticalFailure: true'), 'Critical failure deployment stop missing');
assert.ok(domain.includes('noRequestUserApiDeviceServiceOrComponentAutomaticallyTrusted: true'), 'Zero Trust missing');
assert.ok(domain.includes('passwordsNeverPlainText: true'), 'Password protection missing');
assert.ok(domain.includes('httpsWithCurrentTlsRequired: true'), 'TLS requirement missing');
assert.ok(domain.includes('Multi-Factor Authentication for Founder and administrative accounts'), 'Admin MFA missing');
assert.ok(domain.includes('roleBasedLeastPrivilege: true'), 'Least privilege missing');
assert.ok(domain.includes('serverVerifiesTrustedPaymentProviderConfirmationBeforeAccess: true'), 'Server-side payment confirmation missing');
for (const attack of ['sql-injection','cross-site-scripting','csrf','ssrf','command-injection','clickjacking','directory-traversal','file-upload-exploits','remote-code-execution','xxe','api-abuse','session-hijacking','cookie-manipulation','header-injection','parameter-tampering']) assert.ok(domain.includes(`'${attack}'`), `Missing attack protection ${attack}`);
for (const login of ['Rate limiting','Progressive delays','Temporary lockouts','IP reputation analysis','Device behaviour analysis','Risk-based authentication']) assert.ok(domain.includes(login), `Missing login protection ${login}`);
for (const monitor of ['Suspicious logins','Privilege escalation','Payment manipulation','Automated attacks','Credential abuse','Data scraping','Bot attacks','API abuse','Unusual traffic patterns','Unauthorized administrative activity','Suspicious property registrations','Account takeover attempts','Security policy violations']) assert.ok(domain.includes(monitor), `Missing threat monitoring ${monitor}`);
assert.ok(domain.includes('auditLogsTamperResistant: true'), 'Tamper-resistant audit missing');
assert.ok(domain.includes('neverHardcoded: true'), 'Secrets hardcoding ban missing');
assert.ok(domain.includes('encryptedBackupsRequired: true'), 'Encrypted backups missing');
assert.ok(domain.includes('continuousVulnerabilityMonitoring: true'), 'Dependency monitoring missing');
for (const control of ['Active sessions','Device management','Login history','Security alerts','Account lock controls','Force logout on all devices','Security audit history','Emergency administrative access recovery']) assert.ok(domain.includes(control), `Founder security control missing ${control}`);
assert.ok(validation.includes('buildSecurityValidationChecklist'), 'Security validation checklist service missing');
assert.ok(validation.includes('deploymentAllowed'), 'Deployment gate helper missing');
assert.ok(script.includes('possible secret pattern'), 'Secret detection script missing');
assert.ok(foundation.includes('enterpriseSecurityEnhancement: ENTERPRISE_SECURITY_ENHANCEMENT'), 'Foundation snapshot must expose security enhancement');
assert.ok(docs.includes('Enterprise Cybersecurity'), 'Security enhancement documentation missing');

console.log('PataSpace enterprise security enhancement checks passed.');
