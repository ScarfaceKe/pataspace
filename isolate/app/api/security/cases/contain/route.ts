import { NextResponse } from 'next/server';
import { containImmediateThreat } from '@/server/security-operations/service';
export async function POST(request: Request) { const body = await request.json(); const securityCase = await containImmediateThreat({ caseId: String(body.caseId ?? ''), action: body.action, reason: String(body.reason ?? '') }); if (!securityCase) return NextResponse.json({ ok:false, message:'Security case not found.' }, { status:404 }); return NextResponse.json({ ok:true, case: securityCase }); }
