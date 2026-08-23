import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const authDomain = readFileSync(new URL('../src/domain/auth.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/auth/service.ts', import.meta.url), 'utf8');
const registerForm = readFileSync(new URL('../src/components/auth/RegisterForm.tsx', import.meta.url), 'utf8');
const loginForm = readFileSync(new URL('../src/components/auth/LoginForm.tsx', import.meta.url), 'utf8');
const forgotForm = readFileSync(new URL('../src/components/auth/ForgotPasswordForm.tsx', import.meta.url), 'utf8');
const googleClient = readFileSync(new URL('../src/components/auth/supabaseGoogleSignIn.ts', import.meta.url), 'utf8');
const callbackRoute = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8');

assert.ok(authDomain.includes("loginMethods: ['Phone Number', 'Password', 'Google Sign-In']"), 'Phone and Google must be primary login methods');
assert.ok(authDomain.includes("requiredRegistrationFields: ['Full Name', 'Phone Number', 'Password', 'Confirm Password']"), 'Email must not be required for registration');
for (const pattern of ['/^\\+254[17]\\d{8}$/', '/^254[17]\\d{8}$/', '/^0[17]\\d{8}$/']) assert.ok(authDomain.includes(pattern), `Kenyan phone format missing ${pattern}`);
assert.ok(registerForm.includes('Continue with Google') && loginForm.includes('Continue with Google'), 'Google Sign-In choices must appear on register and login');
assert.ok(registerForm.includes('Customer') && registerForm.includes('Business / Property Professional'), 'Registration must show two initial account choices');
assert.ok(registerForm.includes('Property Owner') && registerForm.includes('Property Manager') && registerForm.includes('Leasing Agent'), 'Business account type selection missing');
assert.ok(!registerForm.includes('Platform Admin'), 'Platform Admin must not be public in registration');
assert.ok(registerForm.includes('👁 Show Password') && registerForm.includes('🙈 Hide Password'), 'Registration password visibility controls missing');
assert.ok(loginForm.includes('phoneNumber') && loginForm.includes('👁 Show Password') && loginForm.includes('🙈 Hide Password'), 'Phone login with password visibility missing');
assert.ok(forgotForm.includes('PataSpace Support AI') && forgotForm.includes('never reveal or retrieve your existing password'), 'Password recovery must use Support AI and never reveal old password');
assert.ok(service.includes('requestSupportAiPasswordReset') && service.includes('resetRecord.usedAt') && service.includes('expiresAt'), 'Support AI password reset tokens must be one-use and expiring');
assert.ok(googleClient.includes('signInWithOAuth') && callbackRoute.includes('exchangeCodeForSession'), 'Google Sign-In must use Supabase OAuth callback flow');
assert.ok(service.includes('authenticateSupabaseGoogleUser'), 'Supabase Google callback must synchronize application user/profile');
assert.ok(service.includes('internalEmailForPhone'), 'Phone-first auth must not require customer email while preserving DB compatibility');
assert.ok(service.includes('requiresEmailVerification: false') && service.includes('Email verification is not required'), 'Email verification must be removed from auth experience');
console.log('PataSpace Kenya-first authentication experience checks passed.');
