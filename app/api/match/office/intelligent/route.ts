import { NextResponse } from 'next/server';
import { runOfficeMatchIntelligence } from '@/server/match/office-match-intelligence-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runOfficeMatchIntelligence(criteria);
  return NextResponse.json({ ok: true, ...response });
}
