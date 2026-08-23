import { NextResponse } from 'next/server';
import { founderQuickSearch } from '@/server/founder-admin/service';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') ?? '';
  return NextResponse.json({ ok: true, results: await founderQuickSearch(query) });
}
