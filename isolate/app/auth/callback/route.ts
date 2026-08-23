import { NextResponse } from 'next/server';
import { authenticateSupabaseGoogleUser } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { createSupabaseServerAuthClient } from '@/server/supabase/auth-client';
import type { PublicRegistrationRoleId } from '@/domain/auth';

const publicRoles = new Set(['customer', 'property-owner', 'property-manager', 'leasing-agent']);

function redirectWithMessage(request: Request, pathname: string, message: string) {
  const url = new URL(pathname, request.url);
  url.searchParams.set('authMessage', message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error') || url.searchParams.get('error_code');
  const errorDescription = url.searchParams.get('error_description');
  const mode = url.searchParams.get('mode') === 'register' ? 'register' : 'login';

  if (error) {
    return redirectWithMessage(request, mode === 'register' ? '/auth/register' : '/auth/login', errorDescription || 'Google Sign-In was cancelled or could not be completed.');
  }

  const code = url.searchParams.get('code');
  if (!code) return redirectWithMessage(request, mode === 'register' ? '/auth/register' : '/auth/login', 'Google Sign-In did not return a valid response. Please try again.');

  try {
    const supabase = createSupabaseServerAuthClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !data.user) {
      return redirectWithMessage(request, mode === 'register' ? '/auth/register' : '/auth/login', 'Google Sign-In could not establish a session. Please try again.');
    }

    const rawRole = url.searchParams.get('role') || undefined;
    const role = rawRole && publicRoles.has(rawRole) ? rawRole as PublicRegistrationRoleId : undefined;
    const result = await authenticateSupabaseGoogleUser({
      email: data.user.email ?? undefined,
      fullName: url.searchParams.get('fullName') || (typeof data.user.user_metadata?.full_name === 'string' ? data.user.user_metadata.full_name : typeof data.user.user_metadata?.name === 'string' ? data.user.user_metadata.name : undefined),
      phoneNumber: url.searchParams.get('phoneNumber') || undefined,
      role,
      supabaseUserId: data.user.id
    });

    if (!result.ok) return redirectWithMessage(request, mode === 'register' ? '/auth/register' : '/auth/login', result.message);

    const destination = new URL(result.dashboardRoute, request.url);
    const response = NextResponse.redirect(destination);
    response.cookies.set(SESSION_COOKIE_NAME, result.sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.sessionExpiresAt
    });
    return response;
  } catch {
    return redirectWithMessage(request, mode === 'register' ? '/auth/register' : '/auth/login', 'Google Sign-In is not configured correctly yet. Please use Phone Number + Password for now.');
  }
}
