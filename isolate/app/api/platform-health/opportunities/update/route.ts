import { NextResponse } from 'next/server';
import { updateBusinessOpportunityStatus } from '@/server/platform-health/service';
export async function POST(request: Request) { const body = await request.json(); const opportunity = await updateBusinessOpportunityStatus(String(body.id ?? ''), body.status, String(body.note ?? 'Founder updated opportunity status.')); if (!opportunity) return NextResponse.json({ ok:false, message:'Opportunity not found.' }, { status:404 }); return NextResponse.json({ ok:true, opportunity }); }
