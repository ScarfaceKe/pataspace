import { NextResponse } from 'next/server';
import { saveProperty } from '@/server/customer-dashboard/service';
export async function POST(request: Request) { const record = await saveProperty(await request.json()); return NextResponse.json({ ok: true, record }); }
