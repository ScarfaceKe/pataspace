import { NextResponse } from 'next/server';
import { getRequestContext, rejectInvalidOrigin } from '@/server/auth/request-security';
import { requireApiUser } from '@/server/auth/api';
import { initiateStkPushPayment } from '@/server/payments/service';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const body = await request.json();
  if (String(body.customerId ?? auth.profile.userId) !== auth.profile.userId) {
    return NextResponse.json({ ok: false, message: 'You can only initiate payments for your own account.' }, { status: 403 });
  }
  const result = await initiateStkPushPayment({ ...body, customerId: auth.profile.userId }, getRequestContext(request));
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
