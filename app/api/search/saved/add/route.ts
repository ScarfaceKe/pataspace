import { NextResponse } from 'next/server';
import { saveCustomerSearch } from '@/server/search-optimization/service';
export async function POST(request: Request) { const savedSearch = await saveCustomerSearch(await request.json()); return NextResponse.json({ ok: true, savedSearch }); }
