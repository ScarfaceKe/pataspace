import { NextResponse } from 'next/server';
import { recordFounderSecurityDecision } from '@/server/security-operations/service';
export async function POST(request: Request) { const body = await request.json(); const securityCase = await recordFounderSecurityDecision({ caseId: String(body.caseId ?? ''), founderUserId: String(body.founderUserId ?? ''), action: body.action, note: String(body.note ?? '') }); if (!securityCase) return NextResponse.json({ ok:false, message:'Security case not found.' }, { status:404 }); return NextResponse.json({ ok:true, case: securityCase }); }
