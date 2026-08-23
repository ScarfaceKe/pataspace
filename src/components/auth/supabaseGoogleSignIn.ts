import { createClient } from '@supabase/supabase-js';
import type { PublicRegistrationRoleId } from '@/domain/auth';

function getSupabaseBrowserConfig(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error('Google Sign-In is not configured yet. Please use Phone Number + Password for now.');
  }
  return { url, publishableKey };
}

export async function startSupabaseGoogleOAuth(input: { mode: 'login' | 'register'; phoneNumber?: string; role?: PublicRegistrationRoleId; fullName?: string }) {
  const config = getSupabaseBrowserConfig();
  const supabase = createClient(config.url, config.publishableKey);
  const callback = new URL('/auth/callback', window.location.origin);
  callback.searchParams.set('mode', input.mode);
  if (input.phoneNumber) callback.searchParams.set('phoneNumber', input.phoneNumber);
  if (input.role) callback.searchParams.set('role', input.role);
  if (input.fullName) callback.searchParams.set('fullName', input.fullName);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callback.toString(),
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) throw new Error(error.message || 'Google Sign-In could not start.');
}
