import { NextResponse } from 'next/server';
import { getVacancyConfirmationRecordsForProperty } from '@/server/vacancy-confirmation/service';

export async function GET(request: Request) {
  const propertyId = new URL(request.url).searchParams.get('propertyId');
  if (!propertyId) return NextResponse.json({ ok: false, message: 'Property ID is required.' }, { status: 400 });
  const records = await getVacancyConfirmationRecordsForProperty(propertyId);
  return NextResponse.json({ ok: true, records });
}
