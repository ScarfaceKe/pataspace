import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const authSource = readFileSync(new URL('../src/domain/auth.ts', import.meta.url), 'utf8');
const serviceSource = readFileSync(new URL('../src/server/auth/service.ts', import.meta.url), 'utf8');
const passwordSource = readFileSync(new URL('../src/server/auth/password.ts', import.meta.url), 'utf8');
const sessionSource = readFileSync(new URL('../src/server/auth/session.ts', import.meta.url), 'utf8');
const registerFormSource = readFileSync(new URL('../src/components/auth/RegisterForm.tsx', import.meta.url), 'utf8');
const loginFormSource = readFileSync(new URL('../src/components/auth/LoginForm.tsx', import.meta.url), 'utf8');
const forgotFormSource = readFileSync(new URL('../src/components/auth/ForgotPasswordForm.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const role of ['customer', 'property-owner', 'property-manager', 'leasing-agent']) assert.ok(authSource.includes(`id: '${role}'`), `Missing public registration role ${role}`);
assert.ok(authSource.includes('platformAdminPublicRegistration: false'), 'Platform Admin must not be publicly registered');
assert.ok(!authSource.includes("id: 'platform-admin',\n    icon"), 'Platform Admin must not be a public role card');
for (const field of ['Full Name', 'Phone Number', 'Password', 'Confirm Password']) assert.ok(authSource.includes(field), `Missing registration field standard: ${field}`);
assert.ok(!authSource.includes("requiredRegistrationFields: ['Full Name', 'Phone Number', 'Email Address'"), 'Email must not be required for Kenya-first registration');
assert.ok(authSource.includes("customer: '/customer/home'"), 'Customer route missing');
assert.ok(authSource.includes("'property-owner': '/owner/dashboard'"), 'Owner route missing');
assert.ok(authSource.includes("'property-manager': '/manager/dashboard'"), 'Manager route missing');
assert.ok(authSource.includes("'leasing-agent': '/agent/dashboard'"), 'Agent route missing');
assert.ok(authSource.includes("'platform-admin': '/admin/dashboard'"), 'Admin route missing internally');
assert.ok(authSource.includes('normaliseKenyanPhoneNumber'), 'Kenyan phone validation must be present');
assert.ok(authSource.includes('Google Sign-In'), 'Google Sign-In must be supported');
assert.ok(authSource.includes('validatePassword'), 'Password validation must be present');
assert.ok(passwordSource.includes('bcrypt.hash') && passwordSource.includes('bcrypt.compare'), 'Passwords must be hashed with bcrypt');
assert.ok(sessionSource.includes('SESSION_COOKIE_NAME'), 'Session cookie foundation must be present');
assert.ok(serviceSource.includes('failedLoginAttempts'), 'Failed login attempts must be tracked');
assert.ok(serviceSource.includes('revokedAt'), 'Duplicate active sessions should be revoked where appropriate');
assert.ok(serviceSource.includes('passwordResets'), 'Support AI reset records must be supported');
assert.ok(serviceSource.includes('genericMessage'), 'Login failures must use safe generic messages');
assert.ok(serviceSource.includes('requestSupportAiPasswordReset'), 'Password recovery must use PataSpace Support AI');
for (const source of [registerFormSource, loginFormSource, forgotFormSource]) {
  assert.ok(source.includes('Show Password') && source.includes('Hide Password'), 'Auth forms must support show/hide password');
  assert.ok(source.includes('aria-live="polite"'), 'Auth forms must include friendly status feedback');
}
assert.ok(registerFormSource.includes('progress-steps'), 'Registration must use clear step progress');
assert.ok(foundationSource.includes('authentication: AUTHENTICATION_STANDARDS'), 'Foundation snapshot must include auth standards');
console.log('PataSpace authentication checks passed.');
