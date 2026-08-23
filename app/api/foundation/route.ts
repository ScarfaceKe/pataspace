import { NextResponse } from 'next/server';
import { foundationSnapshot } from '@/lib/foundation';

export function GET() {
  return NextResponse.json(foundationSnapshot, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
    }
  });
}
