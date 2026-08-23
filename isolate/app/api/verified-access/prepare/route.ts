import { NextResponse } from 'next/server';
import { prepareVerifiedAccessPurchase } from '@/server/verified-access/service';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customerId || !body.scope) return NextResponse.json({ ok: false, message: 'Customer and Verified Access scope are required.' }, { status: 400 });
  const checkout = await prepareVerifiedAccessPurchase(String(body.customerId), body.scope);
  return NextResponse.json({ ok: true, checkout });
}
