import { NextResponse } from 'next/server';
import { getExecutiveIntelligenceDashboard } from '@/server/executive-intelligence/service';
export async function GET() { return NextResponse.json({ ok: true, executiveIntelligence: await getExecutiveIntelligenceDashboard() }); }
