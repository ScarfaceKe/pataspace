import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const register = readFileSync(new URL('../src/components/auth/RegisterForm.tsx', import.meta.url), 'utf8');
const login = readFileSync(new URL('../src/components/auth/LoginForm.tsx', import.meta.url), 'utf8');
const google = readFileSync(new URL('../src/components/auth/supabaseGoogleSignIn.ts', import.meta.url), 'utf8');
const matchHook = readFileSync(new URL('../src/components/match/usePersistentMatchState.ts', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const supportForm = readFileSync(new URL('../src/components/support/SupportTicketForm.tsx', import.meta.url), 'utf8');
const supportService = readFileSync(new URL('../src/server/support/service.ts', import.meta.url), 'utf8');
const supportMigration = readFileSync(new URL('../supabase/migrations/0009_support_tickets.sql', import.meta.url), 'utf8');
const locationForm = readFileSync(new URL('../src/components/properties/PropertyLocationVerificationStep.tsx', import.meta.url), 'utf8');

assert.ok(register.includes('Kenyan Phone Number') && register.includes('Password') && register.includes('Use this number for important WhatsApp notifications'), 'Phone registration fields and WhatsApp preference must be visible');
assert.ok(register.includes('submitGoogleRegistration') && login.includes('submitGoogleLogin') && google.includes('signInWithOAuth'), 'Google Sign-In must launch Supabase OAuth or clear config message');
assert.ok(google.includes('Google Sign-In is not configured yet'), 'Unconfigured Google Sign-In must show friendly message');
assert.ok(matchHook.includes('sessionStorage'), 'Form state must persist and not reset unexpectedly');
assert.ok(!layout.includes('SessionRefresh') && !layout.includes('OfflineResilience') && !layout.includes('PremiumMotion'), 'Global refresh/mutation components must not be mounted during QA reset stabilization');
for (const link of ['About PataSpace','Privacy Policy','Terms of Service','Contact Support','Facebook','Instagram','X','LinkedIn','TikTok']) assert.ok(footer.includes(link), `Footer missing ${link}`);
assert.ok(footer.includes('new Date().getFullYear()'), 'Footer copyright year must update automatically');
assert.ok(footer.includes('/support'), 'Contact Support must open real support page');
assert.ok(supportForm.includes('Subject') && supportForm.includes('Short problem summary') && supportForm.includes('Detailed description') && supportForm.includes('Submit support ticket'), 'Support form fields missing');
assert.ok(supportService.includes('aiAcknowledgement') && supportService.includes('listSupportTickets'), 'Support system must create AI acknowledgement and expose admin tickets');
assert.ok(supportMigration.includes('support_tickets') && supportMigration.includes('status') && supportMigration.includes('founder_reply'), 'Support ticket database table/status/reply missing');
assert.ok(locationForm.includes('Property Location Verification'), 'Location verification remains available');
console.log('PataSpace QA Round 2 addendum checks passed.');
