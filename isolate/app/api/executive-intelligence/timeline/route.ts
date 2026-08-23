import { NextResponse } from 'next/server';
import { getExecutiveIntelligenceDashboard } from '@/server/executive-intelligence/service';
export async function GET() { const data = await getExecutiveIntelligenceDashboard(); return NextResponse.json({ ok: true, timeline: data.founderDecisionTimeline, outcomes: data.outcomeReports }); }
