import { NextResponse } from 'next/server';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { requireApiUser } from '@/server/auth/api';
import { verifyPaymentServerSide } from '@/server/payments/service';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const body = await request.json();
  const result = await verifyPaymentServerSide({ paymentId: body.paymentId, transactionReference: body.transactionReference });
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
