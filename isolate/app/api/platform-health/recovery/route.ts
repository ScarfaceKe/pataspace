import { NextResponse } from 'next/server';
import { recordRecoveryAction } from '@/server/platform-health-operations/service';
export async function POST(request: Request) { const recovery = await recordRecoveryAction(await request.json()); return NextResponse.json({ ok: true, recovery }); }
