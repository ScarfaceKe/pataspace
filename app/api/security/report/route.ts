import { NextResponse } from 'next/server';
import { generateSecurityReport } from '@/server/security-operations/service';
export async function POST(request: Request) { return NextResponse.json({ ok:true, report: await generateSecurityReport(await request.json()) }); }
