import { NextResponse } from 'next/server';
import { DEFAULT_PUBLIC_PROFILE } from '@/server/auth/public-profile';
import { registerPropertyFoundation } from '@/server/properties/service';

export async function POST(request: Request) {
  const profile = DEFAULT_PUBLIC_PROFILE;
  const result = await registerPropertyFoundation(profile, await request.json());
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json({
    ok: true,
    message: result.message,
    property: result.property,
    nextRoute: result.nextRoute
  });
}
