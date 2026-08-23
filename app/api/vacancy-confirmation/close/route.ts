import { NextResponse } from 'next/server';
import { closeVacancy } from '@/server/vacancy-confirmation/service';

export async function POST(request: Request) {
  const body = await request.json();
  const record = await closeVacancy(String(body.recordId ?? ''));
  if (!record) return NextResponse.json({ ok: false, message: 'Vacancy confirmation record was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'This vacancy has been marked as occupied.', record });
}
