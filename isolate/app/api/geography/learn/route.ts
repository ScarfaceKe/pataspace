import { NextResponse } from 'next/server';
import { learnGeographicLocation } from '@/server/unified-platform/geography-service';
export async function POST(request: Request) { const location = await learnGeographicLocation(await request.json()); return NextResponse.json({ ok: true, location }); }
