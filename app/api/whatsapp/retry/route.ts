import { NextResponse } from 'next/server';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { requireApiUser } from '@/server/auth/api';
import { processDueWhatsAppRetries } from '@/server/whatsapp/service';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  if (auth.profile.role !== 'platform-admin') return NextResponse.json({ ok: false, message: 'Only internal platform administrators can retry WhatsApp deliveries.' }, { status: 403 });
  return NextResponse.json({ ok: true, processed: await processDueWhatsAppRetries() });
}
