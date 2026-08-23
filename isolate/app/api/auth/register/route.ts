import { NextResponse } from 'next/server';
import { registerUser } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { rejectInvalidOrigin } from '@/server/auth/request-security';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const result = await registerUser(await request.json());
  if (!result.ok) return NextResponse.json(result, { status: result.status });

  const response = NextResponse.json({
    ok: true,
    message: result.requiresEmailVerification
      ? 'Your PataSpace account has been created. Please verify your email address before logging in.'
      : 'Your PataSpace account has been created successfully.',
    profile: result.profile,
    dashboardRoute: result.dashboardRoute,
    requiresEmailVerification: result.requiresEmailVerification,
    verificationToken: result.verificationToken
  });
  if (result.sessionCookie && result.sessionExpiresAt) {
    response.cookies.set(SESSION_COOKIE_NAME, result.sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.sessionExpiresAt
    });
  }
  return response;
}
