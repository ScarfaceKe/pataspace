import { NextResponse } from 'next/server';
import { generateExecutiveReport } from '@/server/executive-dashboard/service';
export async function POST(request: Request) { return NextResponse.json({ ok: true, report: await generateExecutiveReport(await request.json()) }); }
