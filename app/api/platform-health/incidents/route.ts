import { NextResponse } from 'next/server';
import { createIncident } from '@/server/platform-health-operations/service';
export async function POST(request: Request) { const incident = await createIncident(await request.json()); return NextResponse.json({ ok: true, incident }); }
