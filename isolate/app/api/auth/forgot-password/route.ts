import { NextResponse } from 'next/server';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { requestSupportAiPasswordReset } from '@/server/auth/service';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const body = await request.json();
  const result = await requestSupportAiPasswordReset({ phoneNumber: String(body.phoneNumber ?? ''), fullName: body.fullName ? String(body.fullName) : undefined });
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result);
}
