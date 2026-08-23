import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const client = readFileSync(new URL('../src/components/auth/supabaseGoogleSignIn.ts', import.meta.url), 'utf8');
const callback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8');
const serverClient = readFileSync(new URL('../src/server/supabase/auth-client.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/auth/service.ts', import.meta.url), 'utf8');
const register = readFileSync(new URL('../src/components/auth/RegisterForm.tsx', import.meta.url), 'utf8');
const login = readFileSync(new URL('../src/components/auth/LoginForm.tsx', import.meta.url), 'utf8');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');

assert.ok(client.includes("provider: 'google'"), 'Google OAuth must use Supabase provider google');
assert.ok(client.includes('supabase.auth.signInWithOAuth'), 'Client must start Supabase OAuth flow');
assert.ok(client.includes('redirectTo') && client.includes('/auth/callback'), 'Client must use app auth callback redirect');
assert.ok(client.includes('NEXT_PUBLIC_SUPABASE_URL') && client.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), 'Client must use public Supabase env vars');
assert.ok(!client.includes('SUPABASE_SECRET_KEY') && !client.includes('GOOGLE_CLIENT_SECRET'), 'Client must not expose server secrets');
assert.ok(callback.includes('exchangeCodeForSession'), 'Callback must exchange Supabase OAuth code for session');
assert.ok(callback.includes('authenticateSupabaseGoogleUser'), 'Callback must create/reuse app profile and session');
assert.ok(callback.includes('SESSION_COOKIE_NAME'), 'Callback must create existing PataSpace session cookie');
assert.ok(callback.includes('error_description') && callback.includes('Google Sign-In was cancelled'), 'Callback must handle cancellation/errors cleanly');
assert.ok(serverClient.includes('persistSession: false') && serverClient.includes('autoRefreshToken: false'), 'Server Supabase Auth client must be server-safe');
assert.ok(service.includes('findUserByEmail') && service.includes('findUserByPhone'), 'Google auth must reuse existing app accounts and avoid duplicates');
assert.ok(service.includes('supabaseUserId'), 'Google auth audit must track Supabase user id without logging tokens');
assert.ok(register.includes('startSupabaseGoogleOAuth') && login.includes('startSupabaseGoogleOAuth'), 'Auth UI must call Supabase Google OAuth implementation');
assert.ok(envExample.includes('NEXT_PUBLIC_SUPABASE_URL=') && envExample.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='), 'Supabase public auth env vars must be documented');
console.log('PataSpace Supabase Google authentication checks passed.');
