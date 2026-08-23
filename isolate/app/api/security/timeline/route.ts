import { NextResponse } from 'next/server';
import { getSecurityTimeline } from '@/server/security-operations/service';
export async function GET() { return NextResponse.json({ ok:true, timeline: await getSecurityTimeline() }); }
