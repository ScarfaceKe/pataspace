import { NextResponse } from 'next/server';
import { getVerificationRecord } from '@/server/verification/service';

export async function GET(request: Request) {
  const propertyId = new URL(request.url).searchParams.get('propertyId');
  if (!propertyId) return NextResponse.json({ ok: false, message: 'Property ID is required.' }, { status: 400 });
  const record = await getVerificationRecord(propertyId);
  if (!record) return NextResponse.json({ ok: false, message: 'Verification record was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, record });
}
