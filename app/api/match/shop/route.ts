import { NextResponse } from 'next/server';
import { runShopMatch } from '@/server/match/shop-match-service';

export async function POST(request: Request) {
  const criteria = await request.json();
  const response = await runShopMatch(criteria);
  return NextResponse.json({ ok: true, ...response });
}
