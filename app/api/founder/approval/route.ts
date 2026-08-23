import { NextResponse } from 'next/server';
import { decideFounderApproval } from '@/server/founder-admin/service';

export async function POST(request: Request) {
  const body = await request.json();
  const entry = await decideFounderApproval({ founderUserId: String(body.founderUserId ?? ''), caseId: String(body.caseId ?? ''), decision: body.decision, summary: String(body.summary ?? '') });
  return NextResponse.json({ ok: true, auditEntry: entry });
}
