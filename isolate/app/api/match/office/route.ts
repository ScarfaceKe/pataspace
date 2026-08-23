import { NextResponse } from 'next/server';
import { runOfficeMatch } from '@/server/match/office-match-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runOfficeMatch(criteria);
  return NextResponse.json({ ok: true, ...response });
}
