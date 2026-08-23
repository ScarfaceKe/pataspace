import { NextResponse } from 'next/server';
import { loginUser } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { getRequestContext, rejectInvalidOrigin } from '@/server/auth/request-security';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const result = await loginUser(await request.json(), getRequestContext(request));
  if (!result.ok) return NextResponse.json(result, { status: result.status });

  const response = NextResponse.json({
    ok: true,
    message: 'Welcome back to PataSpace.',
    profile: result.profile,
    dashboardRoute: result.dashboardRoute
  });
  response.cookies.set(SESSION_COOKIE_NAME, result.sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: result.sessionExpiresAt
  });
  return response;
}
