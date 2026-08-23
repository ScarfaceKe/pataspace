import { NextResponse } from 'next/server';
import { trackAnalyticsEvent } from '@/server/analytics/service';
export async function POST(request: Request) { const event = await trackAnalyticsEvent(await request.json()); return NextResponse.json({ ok: true, event }); }
