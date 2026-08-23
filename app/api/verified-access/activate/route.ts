import { NextResponse } from 'next/server';
import { activateVerifiedAccessAfterSuccessfulPayment } from '@/server/verified-access/service';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customerId || !body.scope || !body.paymentReference) {
    return NextResponse.json({ ok: false, message: 'Customer, Verified Access scope, and payment reference are required after successful payment.' }, { status: 400 });
  }
  const record = await activateVerifiedAccessAfterSuccessfulPayment({
    customerId: String(body.customerId),
    scope: body.scope,
    paymentReference: String(body.paymentReference)
  });
  return NextResponse.json({ ok: true, message: 'Verified Access is active for 72 hours.', record });
}
