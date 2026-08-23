import { createHmac, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'pataspace_session';
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;
export const REMEMBERED_SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
export const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 30;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? process.env.JWT_SECRET ?? process.env.PATASPACE_AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET or JWT_SECRET must be configured.');
  return 'development-only-change-pataspace-auth-secret';
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHmac('sha256', getSessionSecret()).update(token).digest('hex');
}

export function createSessionCookieValue(sessionId: string, token: string): string {
  const payload = `${sessionId}.${token}`;
  const signature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function parseSessionCookieValue(cookieValue?: string): { sessionId: string; token: string } | null {
  if (!cookieValue) return null;
  const [sessionId, token, signature] = cookieValue.split('.');
  if (!sessionId || !token || !signature) return null;
  const payload = `${sessionId}.${token}`;
  const expectedSignature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  if (signature !== expectedSignature) return null;
  return { sessionId, token };
}
