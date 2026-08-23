import { NextResponse } from 'next/server';
import { recordViewingFeedback } from '@/server/customer-experience/service';
export async function POST(request: Request) { return NextResponse.json({ ok:true, feedback: await recordViewingFeedback(await request.json()) }); }
