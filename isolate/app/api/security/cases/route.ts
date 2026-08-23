import { NextResponse } from 'next/server';
import { listSecurityCases, runSecurityIntelligenceScan, getSecurityAnalytics } from '@/server/security-operations/service';
export async function GET() { await runSecurityIntelligenceScan(); return NextResponse.json({ ok: true, cases: await listSecurityCases(), analytics: await getSecurityAnalytics() }); }
