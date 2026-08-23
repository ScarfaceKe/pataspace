import { NextResponse } from 'next/server';
import { confirmVacancy } from '@/server/vacancy-confirmation/service';

export async function POST(request: Request) {
  const body = await request.json();
  const record = await confirmVacancy(String(body.recordId ?? ''));
  if (!record) return NextResponse.json({ ok: false, message: 'Vacancy confirmation record was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'Vacancy confirmed for another 24 hours.', record });
}
