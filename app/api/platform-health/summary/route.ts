import { NextResponse } from 'next/server';
import { getPlatformHealthReport } from '@/server/platform-health/service';
export async function GET() { return NextResponse.json({ ok: true, report: await getPlatformHealthReport() }); }
