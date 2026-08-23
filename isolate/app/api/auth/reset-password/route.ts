import { NextResponse } from 'next/server';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { resetPassword } from '@/server/auth/service';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const result = await resetPassword(await request.json());
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
