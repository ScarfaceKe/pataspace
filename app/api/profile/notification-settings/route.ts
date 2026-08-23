import { NextResponse } from 'next/server';
import { requireApiUser } from '@/server/auth/api';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { getWhatsAppPreferences, updateWhatsAppPreferences } from '@/server/whatsapp/service';

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, preferences: await getWhatsAppPreferences(auth.profile.userId) });
}

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const preferences = await updateWhatsAppPreferences({
      userId: auth.profile.userId,
      whatsappSameAsPrimary: Boolean(body.whatsappSameAsPrimary),
      whatsappPhoneNumber: body.whatsappPhoneNumber ? String(body.whatsappPhoneNumber) : undefined,
      inAppNotificationsEnabled: body.inAppNotificationsEnabled !== false,
      whatsappNotificationsEnabled: body.whatsappNotificationsEnabled !== false
    });
    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Notification preferences could not be updated.' }, { status: 400 });
  }
}
