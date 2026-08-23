import { NextResponse } from 'next/server';
import { extractCookieValue, rejectInvalidOrigin } from '@/server/auth/request-security';
import { refreshSession } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const result = await refreshSession(extractCookieValue(request));
  if (!result.ok) return NextResponse.json({ ok: false, message: 'Session refresh failed.' }, { status: 401 });
  const response = NextResponse.json({ ok: true, profile: result.profile });
  response.cookies.set(SESSION_COOKIE_NAME, result.sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: result.sessionExpiresAt
  });
  return response;
}
