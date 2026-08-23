import { NextResponse } from 'next/server';
import { getActiveUnlockForTarget } from '@/server/unlock/service';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customerId || !body.target) return NextResponse.json({ ok: false, message: 'Customer and selected property or unit are required.' }, { status: 400 });
  const unlock = await getActiveUnlockForTarget(String(body.customerId), body.target);
  return NextResponse.json({ ok: true, unlocked: Boolean(unlock), unlock });
}
