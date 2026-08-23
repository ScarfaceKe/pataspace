import { NextResponse } from 'next/server';
import { listRecentlyViewed } from '@/server/customer-experience/service';
export async function GET(request: Request) { const customerId = new URL(request.url).searchParams.get('customerId'); if (!customerId) return NextResponse.json({ ok:false, message:'Customer ID is required.' }, { status:400 }); return NextResponse.json({ ok:true, recentlyViewed: await listRecentlyViewed(customerId) }); }
