import { NextResponse } from 'next/server';
import { analyseSearchOpportunities } from '@/server/platform-health/service';
export async function GET() { return NextResponse.json({ ok: true, opportunities: await analyseSearchOpportunities() }); }
