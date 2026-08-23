import { NextResponse } from 'next/server';
import { hasVerifiedAccessToTarget } from '@/server/verified-access/service';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customerId || !body.target) return NextResponse.json({ ok: false, message: 'Customer and target property or unit are required.' }, { status: 400 });
  const active = await hasVerifiedAccessToTarget(String(body.customerId), body.target);
  return NextResponse.json({ ok: true, active });
}
