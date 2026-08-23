import { NextResponse } from 'next/server';
import { DEFAULT_PUBLIC_PROFILE } from '@/server/auth/public-profile';
import { registerOfficeFoundation } from '@/server/offices/service';

export async function POST(request: Request) {
  const profile = DEFAULT_PUBLIC_PROFILE;
  const result = await registerOfficeFoundation(profile, await request.json());
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
