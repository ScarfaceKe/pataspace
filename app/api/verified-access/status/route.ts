import { NextResponse } from 'next/server';
import { getActiveVerifiedAccessForScope } from '@/server/verified-access/service';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customerId || !body.scope) return NextResponse.json({ ok: false, message: 'Customer and Verified Access scope are required.' }, { status: 400 });
  const record = await getActiveVerifiedAccessForScope(String(body.customerId), body.scope);
  return NextResponse.json({
    ok: true,
    active: Boolean(record),
    indicator: record?.intelligence?.activeAccessIndicator ?? 'Verified Access Expired',
    remainingTime: record?.intelligence?.remainingTime ?? null,
    record
  });
}
