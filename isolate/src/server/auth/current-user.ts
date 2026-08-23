import { cookies } from 'next/headers';
import { getProfileFromSessionCookie } from './service';
import { SESSION_COOKIE_NAME } from './session';
import { DEFAULT_PUBLIC_PROFILE } from './public-profile';

export async function requireCurrentUser(expectedRoute?: string) {
  const cookieStore = await cookies();
  const profile = await getProfileFromSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  return profile ?? DEFAULT_PUBLIC_PROFILE;
}
