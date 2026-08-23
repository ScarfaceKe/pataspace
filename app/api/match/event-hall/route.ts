import { NextResponse } from 'next/server';
import { runEventHallMatch } from '@/server/match/event-hall-match-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runEventHallMatch(criteria);
  return NextResponse.json({ ok: true, ...response });
}
