import { NextResponse } from 'next/server';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { requireApiUser } from '@/server/auth/api';
import { createSupportTicket, listSupportTickets, updateSupportTicket } from '@/server/support/service';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  const profile = auth.ok ? auth.profile : undefined;
  const body = await request.json();
  const result = await createSupportTicket({ submittedBy: profile?.userId, subject: String(body.subject ?? ''), shortSummary: String(body.shortSummary ?? ''), detailedDescription: String(body.detailedDescription ?? '') });
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  if (auth.profile.role !== 'platform-admin') return NextResponse.json({ ok: false, message: 'Only internal platform administrators can view support tickets.' }, { status: 403 });
  return NextResponse.json({ ok: true, tickets: await listSupportTickets() });
}

export async function PATCH(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  if (auth.profile.role !== 'platform-admin') return NextResponse.json({ ok: false, message: 'Only internal platform administrators can update support tickets.' }, { status: 403 });
  const body = await request.json();
  const result = await updateSupportTicket({ ticketId: String(body.ticketId ?? ''), status: String(body.status ?? ''), founderReply: body.founderReply ? String(body.founderReply) : undefined });
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
