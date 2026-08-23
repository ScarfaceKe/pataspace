import { NextResponse } from 'next/server';
import { getRevenueDashboard } from '@/server/revenue/service';
export async function GET() { return NextResponse.json({ ok: true, revenue: await getRevenueDashboard() }); }
