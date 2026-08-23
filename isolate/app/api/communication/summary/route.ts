import { NextResponse } from 'next/server';
import { prepareNotificationSummary } from '@/server/communication/service';
export async function POST(request: Request) { const body = await request.json(); return NextResponse.json({ ok:true, summary: prepareNotificationSummary(Array.isArray(body.messages) ? body.messages : []) }); }
