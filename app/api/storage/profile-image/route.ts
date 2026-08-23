import { NextResponse } from 'next/server';
import { requireApiUser } from '@/server/auth/api';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { getCurrentProfileImage, uploadProfileImage } from '@/server/storage/supabase-storage';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'Profile image file is required.' }, { status: 400 });
  }
  try {
    const metadata = await uploadProfileImage({ userId: auth.profile.userId, file });
    return NextResponse.json({ ok: true, file: metadata });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Profile image upload failed.' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const file = await getCurrentProfileImage(auth.profile.userId);
  return NextResponse.json({ ok: true, file });
}
