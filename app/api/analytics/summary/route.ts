import { NextResponse } from 'next/server';
import { getAnalyticsSummary, listAnalyticsEvents } from '@/server/analytics/service';
export async function GET() { return NextResponse.json({ ok: true, summary: await getAnalyticsSummary(), recentEvents: (await listAnalyticsEvents()).slice(0, 25) }); }
