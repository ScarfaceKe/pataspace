import { NextResponse } from 'next/server';
import { requestVerificationAgain } from '@/server/verification/service';

export async function POST(request: Request) {
  const body = await request.json();
  const record = await requestVerificationAgain(String(body.propertyId ?? ''));
  if (!record) return NextResponse.json({ ok: false, message: 'Verification record was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'Your property has returned to Waiting for Verification.', record });
}
