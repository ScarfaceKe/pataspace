import { NextResponse } from 'next/server';
import { runHouseMatchIntelligence } from '@/server/match/house-match-intelligence-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runHouseMatchIntelligence(criteria);
  return NextResponse.json({ ok: true, ...response });
}
