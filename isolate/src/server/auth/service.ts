import { randomUUID } from 'node:crypto';
import {
  DASHBOARD_ROUTES,
  normaliseEmail,
  normaliseKenyanPhoneNumber,
  validateLoginInput,
  validateRegistrationInput,
  validatePassword,
  type AuthProfileFoundation,
  type LoginInput,
  type PublicRegistrationRoleId,
  type RegistrationInput
} from '@/domain/auth';
import type { UserRoleId } from '@/domain/types';
import { query } from '@/server/database/client';
import { hashPassword, verifyPassword } from './password';
import { createOpaqueToken, createSessionCookieValue, hashToken, parseSessionCookieValue, REMEMBERED_SESSION_DURATION_MS, SESSION_DURATION_MS, SESSION_REFRESH_THRESHOLD_MS } from './session';
import { accountTypeForRole, findUserByEmail, readAuthStore, writeAuthStore, type StoredAuthUser } from './store';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 1000 * 60 * 15;
const PASSWORD_RESET_DURATION_MS = 1000 * 60 * 20;

function nowIso(): string { return new Date().toISOString(); }
function normaliseIpAddress(value?: string | null): string | null { return value?.split(',')[0]?.trim() || null; }
function internalEmailForPhone(phoneNumber: string): string { return `${phoneNumber.replace('+', '')}@phone.pataspace.local`; }
function findUserByPhone(data: { users: StoredAuthUser[] }, phoneNumber: string): StoredAuthUser | undefined { return data.users.find((user) => user.phoneNumber === phoneNumber); }

async function recordSecurityEvent(input: { severity: 'info' | 'warning' | 'critical'; eventType: string; userId?: string; ipAddress?: string | null; userAgent?: string | null; details?: Record<string, unknown> }): Promise<void> {
  await query('insert into security_logs (severity, event_type, actor_user_id, ip_address, user_agent, details) values ($1,$2,$3,$4,$5,$6)', [input.severity, input.eventType, input.userId ?? null, normaliseIpAddress(input.ipAddress), input.userAgent ?? null, input.details ?? {}]);
}

async function enforceLoginRateLimit(identifier: string, ipAddress?: string | null): Promise<{ ok: true } | { ok: false; message: string }> {
  const ip = normaliseIpAddress(ipAddress);
  const result = await query<{ failed_count: string }>(
    `select count(*)::text as failed_count from login_history where success = false and login_at > now() - interval '10 minutes' and ($1::inet is null or ip_address = $1::inet)`,
    [ip]
  );
  if (Number(result.rows[0]?.failed_count ?? 0) >= 20) {
    await recordSecurityEvent({ severity: 'warning', eventType: 'auth.login.ip-rate-limited', ipAddress: ip, details: { identifier } });
    return { ok: false, message: 'Too many login attempts from this connection. Please wait a few minutes and try again.' };
  }
  return { ok: true };
}

async function recordLoginHistory(userId: string, success: boolean, reason?: string, ipAddress?: string | null, userAgent?: string | null): Promise<void> {
  await query('insert into login_history (user_id, success, reason, ip_address, user_agent) values ($1, $2, $3, $4, $5)', [userId, success, reason ?? null, normaliseIpAddress(ipAddress), userAgent ?? null]);
}

function toProfile(user: StoredAuthUser): AuthProfileFoundation {
  return { userId: user.id, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, role: user.role, status: user.status, county: user.county, profilePhoto: user.profilePhoto, accountType: user.accountType, lastLoginAt: user.lastLoginAt, emailVerifiedAt: user.emailVerifiedAt, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

function createSessionForUser(user: StoredAuthUser, rememberMe = false): { cookieValue: string; expiresAt: Date; rememberMe: boolean } {
  const now = Date.now();
  const expiresAt = new Date(now + (rememberMe ? REMEMBERED_SESSION_DURATION_MS : SESSION_DURATION_MS));
  const sessionId = randomUUID();
  const token = createOpaqueToken();
  user.sessions = user.sessions.filter((session) => new Date(session.expiresAt).getTime() > now || session.revokedAt);
  user.sessions.push({ id: sessionId, userId: user.id, tokenHash: hashToken(token), createdAt: nowIso(), expiresAt: expiresAt.toISOString() });
  return { cookieValue: createSessionCookieValue(sessionId, token), expiresAt, rememberMe };
}

function createStoredUser(input: { role: PublicRegistrationRoleId; fullName: string; phoneNumber: string; email?: string; passwordHash: string; county?: string }): StoredAuthUser {
  const timestamp = nowIso();
  return { id: randomUUID(), fullName: input.fullName.trim().replace(/\s+/g, ' '), phoneNumber: input.phoneNumber, email: input.email ? normaliseEmail(input.email) : internalEmailForPhone(input.phoneNumber), role: input.role, status: 'active', passwordHash: input.passwordHash, createdAt: timestamp, updatedAt: timestamp, failedLoginAttempts: 0, sessions: [], passwordResets: [], county: input.county?.trim(), accountType: accountTypeForRole(input.role), emailVerifiedAt: timestamp };
}

export async function registerUser(input: RegistrationInput): Promise<
  | { ok: true; profile: AuthProfileFoundation; dashboardRoute: string; sessionCookie?: string; sessionExpiresAt?: Date; requiresEmailVerification?: boolean; verificationToken?: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  const validation = validateRegistrationInput(input);
  if (!validation.valid) return { ok: false, status: 400, message: 'Please check the highlighted details and try again.', fieldErrors: validation.errors };
  const data = await readAuthStore();
  const phoneNumber = normaliseKenyanPhoneNumber(input.phoneNumber);
  if (!phoneNumber) return { ok: false, status: 400, message: 'Please enter a valid Kenyan phone number.' };
  if (findUserByPhone(data, phoneNumber)) return { ok: false, status: 409, message: 'This phone number is already linked to an account. Please log in instead.' };
  const email = input.email ? normaliseEmail(input.email) : internalEmailForPhone(phoneNumber);
  if (findUserByEmail(data, email)) return { ok: false, status: 409, message: 'This account already exists. Please log in instead.' };

  const user = createStoredUser({ role: input.role, fullName: input.fullName, phoneNumber, email, passwordHash: await hashPassword(input.password), county: input.county });
  const session = createSessionForUser(user, true);
  data.users.push(user);
  await writeAuthStore(data);
  await recordLoginHistory(user.id, true);
  await recordSecurityEvent({ severity: 'info', eventType: 'auth.phone-registration.created', userId: user.id });
  return { ok: true, profile: toProfile(user), dashboardRoute: DASHBOARD_ROUTES[user.role], sessionCookie: session.cookieValue, sessionExpiresAt: session.expiresAt, requiresEmailVerification: false };
}

export async function loginUser(input: LoginInput, context?: { ipAddress?: string | null; userAgent?: string | null }): Promise<
  | { ok: true; profile: AuthProfileFoundation; dashboardRoute: string; sessionCookie: string; sessionExpiresAt: Date }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  const validation = validateLoginInput(input);
  if (!validation.valid) return { ok: false, status: 400, message: 'Please enter your phone number and password.', fieldErrors: validation.errors };
  const phoneNumber = normaliseKenyanPhoneNumber(input.phoneNumber)!;
  const rateLimit = await enforceLoginRateLimit(phoneNumber, context?.ipAddress);
  if (!rateLimit.ok) return { ok: false, status: 429, message: rateLimit.message };
  const data = await readAuthStore();
  const user = findUserByPhone(data, phoneNumber);
  const genericMessage = 'We could not sign you in. Please check your phone number and password.';
  if (!user) return { ok: false, status: 401, message: genericMessage };
  if (user.status !== 'active') return { ok: false, status: 403, message: 'This account is not active. Please contact PataSpace support.' };
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) return { ok: false, status: 429, message: 'Too many failed attempts. Please wait a few minutes and try again.' };
  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) { user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString(); user.failedLoginAttempts = 0; }
    user.updatedAt = nowIso();
    await writeAuthStore(data);
    await recordLoginHistory(user.id, false, 'invalid-password', context?.ipAddress, context?.userAgent);
    await recordSecurityEvent({ severity: user.lockedUntil ? 'warning' : 'info', eventType: user.lockedUntil ? 'auth.login.locked' : 'auth.login.failed', userId: user.id, ipAddress: context?.ipAddress, userAgent: context?.userAgent });
    return { ok: false, status: 401, message: genericMessage };
  }
  user.failedLoginAttempts = 0; user.lockedUntil = undefined; user.lastLoginAt = nowIso(); user.updatedAt = nowIso();
  const session = createSessionForUser(user, Boolean(input.rememberMe));
  await writeAuthStore(data);
  await recordLoginHistory(user.id, true, undefined, context?.ipAddress, context?.userAgent);
  await recordSecurityEvent({ severity: 'info', eventType: 'auth.phone-login.success', userId: user.id, ipAddress: context?.ipAddress, userAgent: context?.userAgent });
  return { ok: true, profile: toProfile(user), dashboardRoute: DASHBOARD_ROUTES[user.role], sessionCookie: session.cookieValue, sessionExpiresAt: session.expiresAt };
}

export async function authenticateSupabaseGoogleUser(input: { email?: string; fullName?: string; phoneNumber?: string; role?: PublicRegistrationRoleId; supabaseUserId: string }, context?: { ipAddress?: string | null; userAgent?: string | null }): Promise<
  | { ok: true; profile: AuthProfileFoundation; dashboardRoute: string; sessionCookie: string; sessionExpiresAt: Date }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  const data = await readAuthStore();
  const email = input.email ? normaliseEmail(input.email) : undefined;
  const phoneNumber = input.phoneNumber ? normaliseKenyanPhoneNumber(input.phoneNumber) : null;
  let user = email ? findUserByEmail(data, email) : undefined;
  if (!user && phoneNumber) user = findUserByPhone(data, phoneNumber);

  if (!user) {
    if (!phoneNumber || !input.role) {
      return {
        ok: false,
        status: 400,
        message: 'Complete your phone number and account type before creating a Google account.',
        fieldErrors: { phoneNumber: !phoneNumber ? 'Enter a valid Kenyan phone number before continuing with Google.' : '' }
      };
    }
    user = createStoredUser({
      role: input.role,
      fullName: input.fullName || email?.split('@')[0] || 'PataSpace User',
      phoneNumber,
      email,
      passwordHash: await hashPassword(createOpaqueToken())
    });
    data.users.push(user);
  } else {
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    if (input.role) {
      user.role = input.role;
      user.accountType = accountTypeForRole(input.role);
    }
    if (input.fullName && (!user.fullName || user.fullName === 'PataSpace User')) user.fullName = input.fullName;
    user.updatedAt = nowIso();
  }

  user.lastLoginAt = nowIso();
  user.emailVerifiedAt = user.emailVerifiedAt ?? nowIso();
  const session = createSessionForUser(user, true);
  await writeAuthStore(data);
  await recordLoginHistory(user.id, true, undefined, context?.ipAddress, context?.userAgent);
  await recordSecurityEvent({ severity: 'info', eventType: 'auth.supabase-google.success', userId: user.id, ipAddress: context?.ipAddress, userAgent: context?.userAgent, details: { supabaseUserId: input.supabaseUserId } });
  return { ok: true, profile: toProfile(user), dashboardRoute: DASHBOARD_ROUTES[user.role], sessionCookie: session.cookieValue, sessionExpiresAt: session.expiresAt };
}

export async function requestSupportAiPasswordReset(input: { phoneNumber: string; fullName?: string }): Promise<{ ok: true; message: string; resetToken?: string; escalated?: boolean } | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }> {
  const phoneNumber = normaliseKenyanPhoneNumber(input.phoneNumber);
  if (!phoneNumber) return { ok: false, status: 400, message: 'Please enter a valid Kenyan phone number.', fieldErrors: { phoneNumber: 'Enter a valid Kenyan phone number, for example 0712345678.' } };
  const data = await readAuthStore();
  const user = findUserByPhone(data, phoneNumber);
  const safeMessage = 'PataSpace Support AI will help verify account ownership before allowing a password reset.';
  if (!user) return { ok: true, message: `${safeMessage} If we cannot confirm the account, we will escalate to support.`, escalated: true };
  const nameOk = input.fullName && user.fullName.toLowerCase().trim() === input.fullName.toLowerCase().trim();
  if (!nameOk) {
    await recordSecurityEvent({ severity: 'warning', eventType: 'auth.support-ai-reset.escalated', userId: user.id });
    return { ok: true, message: 'Support AI could not confidently verify ownership. This request has been escalated to the PataSpace support team for manual review.', escalated: true };
  }
  const token = createOpaqueToken();
  user.passwordResets.push({ tokenHash: hashToken(token), userId: user.id, createdAt: nowIso(), expiresAt: new Date(Date.now() + PASSWORD_RESET_DURATION_MS).toISOString() });
  user.updatedAt = nowIso();
  await writeAuthStore(data);
  await recordSecurityEvent({ severity: 'info', eventType: 'auth.support-ai-reset.token-created', userId: user.id });
  return { ok: true, message: 'Support AI verified your account. Use the secure reset token to create a new password. The token expires shortly and can only be used once.', resetToken: process.env.NODE_ENV === 'production' ? undefined : token };
}

export async function resetPassword(input: { phoneNumber: string; token: string; password: string; confirmPassword: string }): Promise<{ ok: true; message: string } | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }> {
  const fieldErrors: Record<string, string> = {};
  const phoneNumber = normaliseKenyanPhoneNumber(input.phoneNumber);
  if (!phoneNumber) fieldErrors.phoneNumber = 'Enter a valid Kenyan phone number, for example 0712345678.';
  const passwordErrors = validatePassword(input.password);
  if (passwordErrors.length) fieldErrors.password = passwordErrors.join(' ');
  if (input.password !== input.confirmPassword) fieldErrors.confirmPassword = 'Passwords do not match.';
  if (!input.token) fieldErrors.token = 'Enter the reset token from PataSpace Support AI.';
  if (Object.keys(fieldErrors).length) return { ok: false, status: 400, message: 'Please check the highlighted details and try again.', fieldErrors };
  const data = await readAuthStore();
  const user = findUserByPhone(data, phoneNumber!);
  const genericMessage = 'This reset token is invalid or has expired. Please ask PataSpace Support AI for a new review.';
  if (!user) return { ok: false, status: 400, message: genericMessage };
  const tokenHash = hashToken(input.token);
  const resetRecord = user.passwordResets.find((record) => record.tokenHash === tokenHash && !record.usedAt && new Date(record.expiresAt).getTime() > Date.now());
  if (!resetRecord) return { ok: false, status: 400, message: genericMessage };
  user.passwordHash = await hashPassword(input.password);
  user.sessions = user.sessions.map((session) => (!session.revokedAt ? { ...session, revokedAt: nowIso() } : session));
  resetRecord.usedAt = nowIso(); user.updatedAt = nowIso();
  await writeAuthStore(data);
  await recordSecurityEvent({ severity: 'info', eventType: 'auth.support-ai-reset.completed', userId: user.id });
  return { ok: true, message: 'Your password has been reset. You can now log in with your phone number and new password.' };
}

export async function requestPasswordReset(phoneNumber: string) { return requestSupportAiPasswordReset({ phoneNumber }); }
export async function requestEmailVerification(): Promise<{ ok: true; message: string }> { return { ok: true, message: 'Email verification is not required for PataSpace Kenya-first authentication.' }; }
export async function verifyEmail(): Promise<{ ok: true; message: string }> { return { ok: true, message: 'Email verification is not required for PataSpace Kenya-first authentication.' }; }

export async function logoutSession(cookieValue?: string): Promise<void> {
  const parsed = parseSessionCookieValue(cookieValue); if (!parsed) return; const data = await readAuthStore();
  for (const user of data.users) { const session = user.sessions.find((item) => item.id === parsed.sessionId && item.tokenHash === hashToken(parsed.token)); if (session && !session.revokedAt) { session.revokedAt = nowIso(); user.updatedAt = nowIso(); } }
  await writeAuthStore(data);
}

export async function logoutAllSessions(cookieValue?: string): Promise<void> {
  const parsed = parseSessionCookieValue(cookieValue); if (!parsed) return; const data = await readAuthStore(); const now = nowIso();
  for (const user of data.users) { const current = user.sessions.find((item) => item.id === parsed.sessionId && item.tokenHash === hashToken(parsed.token)); if (!current) continue; user.sessions = user.sessions.map((session) => (!session.revokedAt ? { ...session, revokedAt: now } : session)); user.updatedAt = now; await recordSecurityEvent({ severity: 'info', eventType: 'auth.sessions.revoked-all', userId: user.id }); break; }
  await writeAuthStore(data);
}

export async function refreshSession(cookieValue?: string): Promise<{ ok: true; profile: AuthProfileFoundation; sessionCookie: string; sessionExpiresAt: Date } | { ok: false }> {
  const parsed = parseSessionCookieValue(cookieValue); if (!parsed) return { ok: false }; const data = await readAuthStore(); const now = Date.now();
  for (const user of data.users) { const session = user.sessions.find((item) => item.id === parsed.sessionId && item.tokenHash === hashToken(parsed.token)); if (!session || session.revokedAt || user.status !== 'active') continue; const currentExpiry = new Date(session.expiresAt).getTime(); if (currentExpiry <= now) return { ok: false }; const duration = currentExpiry - new Date(session.createdAt).getTime() > SESSION_DURATION_MS ? REMEMBERED_SESSION_DURATION_MS : SESSION_DURATION_MS; if (currentExpiry - now > SESSION_REFRESH_THRESHOLD_MS) return { ok: true, profile: toProfile(user), sessionCookie: cookieValue!, sessionExpiresAt: new Date(currentExpiry) }; session.expiresAt = new Date(now + duration).toISOString(); user.updatedAt = nowIso(); await writeAuthStore(data); return { ok: true, profile: toProfile(user), sessionCookie: createSessionCookieValue(session.id, parsed.token), sessionExpiresAt: new Date(session.expiresAt) }; }
  return { ok: false };
}

export async function getProfileFromSessionCookie(cookieValue?: string): Promise<AuthProfileFoundation | null> {
  const parsed = parseSessionCookieValue(cookieValue); if (!parsed) return null; const data = await readAuthStore(); const now = Date.now();
  for (const user of data.users) { const session = user.sessions.find((item) => item.id === parsed.sessionId && item.tokenHash === hashToken(parsed.token)); if (!session || session.revokedAt) continue; if (new Date(session.expiresAt).getTime() <= now) return null; if (user.status !== 'active') return null; return toProfile(user); }
  return null;
}
