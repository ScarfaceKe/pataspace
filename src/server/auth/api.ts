import { NextResponse } from 'next/server';
import { getProfileFromSessionCookie } from './service';
import { extractCookieValue } from './request-security';
import { DEFAULT_PUBLIC_PROFILE } from './public-profile';

export async function requireApiUser(request: Request) {
  const profile = await getProfileFromSessionCookie(extractCookieValue(request));
  const resolved = profile ?? DEFAULT_PUBLIC_PROFILE;
  // Return the same union shape callers expect so `if (!auth.ok) return auth.response` compiles.
  return { ok: true as const, profile: resolved, response: NextResponse.json({ ok: false, message: 'Authentication error.' }, { status: 401 }) };
}
