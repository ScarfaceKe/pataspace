import { NextResponse } from 'next/server';
import { runEventHallMatchIntelligence } from '@/server/match/event-hall-match-intelligence-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runEventHallMatchIntelligence(criteria);
  return NextResponse.json({ ok: true, ...response });
}
