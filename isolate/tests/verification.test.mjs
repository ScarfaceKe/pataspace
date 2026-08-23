import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const verificationDomain = readFileSync(new URL('../src/domain/verification.ts', import.meta.url), 'utf8');
const propertyDomain = readFileSync(new URL('../src/domain/property-registration.ts', import.meta.url), 'utf8');
const verificationService = readFileSync(new URL('../src/server/verification/service.ts', import.meta.url), 'utf8');
const propertyService = readFileSync(new URL('../src/server/properties/service.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const adminPage = readFileSync(new URL('../app/admin/verification/page.tsx', import.meta.url), 'utf8');

for (const category of ['houses', 'shops', 'offices', 'event-halls']) {
  assert.ok(verificationDomain.includes(`'${category}'`), `Verification must support ${category}`);
}
for (const status of ['pending-verification', 'verified', 'waiting-for-verification', 'verification-failed']) {
  assert.ok(verificationDomain.includes(`'${status}'`), `Missing verification status ${status}`);
}

assert.ok(propertyDomain.includes('verificationStatus: VerificationStatus'), 'Every registered property must have verification status');
assert.ok(propertyService.includes("verificationStatus: 'waiting-for-verification'"), 'Registration must begin verification workflow');
assert.ok(propertyService.includes('createVerificationWorkflow(property)'), 'Registration must create verification record automatically');
assert.ok(verificationDomain.includes('PataSpace Verified'), 'Official verified badge missing');
assert.ok(verificationDomain.includes('dailyVacancyConfirmationRemainsSeparate: true'), 'Daily vacancy confirmation must remain separate');
assert.ok(verificationDomain.includes('Never feel like punishment'), 'Verification philosophy must avoid punishment');
assert.ok(verificationDomain.includes('failOnlyAfterExhaustingCorrection: true'), 'High first-time success philosophy missing');

for (const check of ['required-registration-information', 'logical-consistency', 'duplicate-registration-check', 'unit-identification-check']) {
  assert.ok(verificationService.includes(check), `Missing pre-verification check: ${check}`);
}
assert.ok(verificationService.includes('electricity-information-check'), 'Electricity pre-check for required categories missing');
assert.ok(verificationService.includes("property.category !== 'event-halls'"), 'Event halls should not require electricity pre-check');
assert.ok(verificationService.includes('automatedRetryCount'), 'Automated retry preparation missing');
assert.ok(verificationService.includes('correctionHints'), 'Correction hints missing');
assert.ok(verificationService.includes('requestVerificationAgain'), 'Request verification again workflow missing');

for (const note of [
  'Your property is awaiting verification.',
  'Your property has been verified.',
  'Your verification requires attention.',
  'Your property verification was unsuccessful.',
  'Your property has returned to Waiting for Verification.'
]) {
  assert.ok(verificationDomain.includes(note), `Missing notification: ${note}`);
}

assert.ok(verificationDomain.includes('prioritiseVerificationQueues: true'), 'AI Admin queue prioritisation missing');
assert.ok(verificationDomain.includes('detectDuplicateRegistrations: true'), 'AI Admin duplicate detection missing');
assert.ok(verificationDomain.includes('flagUnusualVerificationPatterns: true'), 'AI Admin unusual pattern flagging missing');
assert.ok(verificationDomain.includes('makesFinalVerificationDecision: false'), 'AI Admin must not make final decisions');
assert.ok(verificationDomain.includes('platformAdministratorRemainsInControl: true'), 'Platform Admin must remain in control');
assert.ok(verificationDomain.includes('monitorWaitingForVerification: true'), 'Health Monitor waiting monitoring missing');
assert.ok(verificationDomain.includes('monitorCompletionRates: true'), 'Health Monitor completion rates missing');
assert.ok(verificationDomain.includes('monitorFrequentlyFailingAttempts: true'), 'Health Monitor failure monitoring missing');
assert.ok(verificationDomain.includes('monitorAreasWithManyUnverifiedProperties: true'), 'Health Monitor unverified area monitoring missing');
assert.ok(verificationDomain.includes('automaticallyChangesVerificationDecisions: false'), 'Health Monitor must not change decisions');
assert.ok(foundationSource.includes('verification: VERIFICATION_FOUNDATION'), 'Foundation snapshot must expose verification foundation');
assert.ok(adminPage.includes('Property Verification Queue'), 'Admin verification queue page missing');

console.log('PataSpace verification checks passed.');
