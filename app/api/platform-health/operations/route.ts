import { NextResponse } from 'next/server';
import { getPlatformHealthOperationsSnapshot } from '@/server/platform-health-operations/service';
export async function GET() { return NextResponse.json({ ok: true, operations: await getPlatformHealthOperationsSnapshot() }); }
