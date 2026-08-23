import { NextResponse } from 'next/server';
import { founderUpsertLocation } from '@/server/unified-platform/geography-service';
export async function POST(request: Request) { const location = await founderUpsertLocation(await request.json()); return NextResponse.json({ ok: true, location }); }
