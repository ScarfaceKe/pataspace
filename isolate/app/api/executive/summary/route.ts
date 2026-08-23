import { NextResponse } from 'next/server';
import { getFounderExecutiveDashboard } from '@/server/executive-dashboard/service';
export async function GET() { return NextResponse.json({ ok: true, executive: await getFounderExecutiveDashboard() }); }
