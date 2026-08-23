import { NextResponse } from 'next/server';
import { extractCookieValue, rejectInvalidOrigin } from '@/server/auth/request-security';
import { logoutAllSessions } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  await logoutAllSessions(extractCookieValue(request));
  const response = NextResponse.json({ ok: true, message: 'You have been logged out on all devices.' });
  response.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
