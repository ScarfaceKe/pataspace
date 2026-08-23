import { NextResponse } from 'next/server';
import { logoutSession } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { extractCookieValue, rejectInvalidOrigin } from '@/server/auth/request-security';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  await logoutSession(extractCookieValue(request));
  const response = NextResponse.json({ ok: true, message: 'You have been logged out safely.' });
  response.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
