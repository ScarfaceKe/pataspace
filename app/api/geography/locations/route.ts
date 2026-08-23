import { NextResponse } from 'next/server';
import { listKenyaGeographicLocations } from '@/server/unified-platform/geography-service';
export async function GET() { return NextResponse.json({ ok: true, locations: await listKenyaGeographicLocations() }); }
