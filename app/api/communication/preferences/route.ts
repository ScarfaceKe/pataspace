import { NextResponse } from 'next/server';
import { requireApiUser } from '@/server/auth/api';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { getCustomerNotificationPreferences, updateCustomerNotificationPreferences } from '@/server/communication/service';

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, preferences: await getCustomerNotificationPreferences(auth.profile.userId) });
}

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, preferences: await updateCustomerNotificationPreferences({ ...(await request.json()), customerId: auth.profile.userId }) });
}
