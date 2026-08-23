import { NextResponse } from 'next/server';
import { requireApiUser } from '@/server/auth/api';
import { getReceipt } from '@/server/payments/service';

export async function GET(request: Request, context: { params: Promise<{ paymentId: string }> }) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const { paymentId } = await context.params;
  const result = await getReceipt(paymentId, auth.profile.userId);
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
