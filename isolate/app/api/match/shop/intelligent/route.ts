import { NextResponse } from 'next/server';
import { runShopMatchIntelligence } from '@/server/match/shop-match-intelligence-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runShopMatchIntelligence(criteria);
  return NextResponse.json({ ok: true, ...response });
}
