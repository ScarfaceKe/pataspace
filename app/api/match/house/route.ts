import { NextResponse } from 'next/server';
import { runHouseMatch } from '@/server/match/house-match-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runHouseMatch(criteria);
  return NextResponse.json({ ok: true, ...response });
}
