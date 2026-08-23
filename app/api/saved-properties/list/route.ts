import { NextResponse } from 'next/server';
import { listSavedProperties } from '@/server/customer-dashboard/service';
export async function GET(request: Request) { const customerId = new URL(request.url).searchParams.get('customerId'); if (!customerId) return NextResponse.json({ ok:false, message:'Customer ID is required.' }, { status:400 }); return NextResponse.json({ ok:true, savedProperties: await listSavedProperties(customerId) }); }
