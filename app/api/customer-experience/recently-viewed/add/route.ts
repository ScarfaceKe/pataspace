import { NextResponse } from 'next/server';
import { addRecentlyViewed } from '@/server/customer-experience/service';
export async function POST(request: Request) { return NextResponse.json({ ok:true, record: await addRecentlyViewed(await request.json()) }); }
