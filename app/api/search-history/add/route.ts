import { NextResponse } from 'next/server';
import { addSearchHistory } from '@/server/customer-dashboard/service';
export async function POST(request: Request) { const record = await addSearchHistory(await request.json()); return NextResponse.json({ ok: true, record }); }
