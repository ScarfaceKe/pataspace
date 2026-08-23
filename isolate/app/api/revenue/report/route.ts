import { NextResponse } from 'next/server';
import { generateRevenueReport } from '@/server/revenue/service';
export async function POST(request: Request) { return NextResponse.json({ ok: true, report: await generateRevenueReport(await request.json()) }); }
