import { NextResponse } from 'next/server';
import { updateVerificationStatus } from '@/server/verification/service';
import type { VerificationStatus } from '@/domain/verification';

const allowed: VerificationStatus[] = ['pending-verification', 'verified', 'waiting-for-verification', 'verification-failed'];

export async function POST(request: Request) {
  const body = await request.json();
  const status = String(body.status ?? '') as VerificationStatus;
  if (!allowed.includes(status)) return NextResponse.json({ ok: false, message: 'Choose a valid verification status.' }, { status: 400 });
  const record = await updateVerificationStatus(String(body.propertyId ?? ''), status, {
    correctionHints: Array.isArray(body.correctionHints) ? body.correctionHints : undefined
  });
  if (!record) return NextResponse.json({ ok: false, message: 'Verification record was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, record });
}
