import { NextResponse } from 'next/server';
import { requireApiUser } from '@/server/auth/api';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { listPropertyImages, uploadPropertyImage } from '@/server/storage/supabase-storage';

export async function POST(request: Request) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const form = await request.formData();
  const file = form.get('file');
  const propertyId = String(form.get('propertyId') ?? '');
  const roleInput = String(form.get('role') ?? 'property-gallery-image');
  const role = roleInput === 'property-cover-image' ? 'property-cover-image' : 'property-gallery-image';
  if (!(file instanceof File) || !propertyId) {
    return NextResponse.json({ ok: false, message: 'Property and image file are required.' }, { status: 400 });
  }
  try {
    const metadata = await uploadPropertyImage({ userId: auth.profile.userId, propertyId, file, role });
    return NextResponse.json({ ok: true, file: metadata });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Image upload failed.' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const propertyId = new URL(request.url).searchParams.get('propertyId');
  if (!propertyId) return NextResponse.json({ ok: false, message: 'Property is required.' }, { status: 400 });
  const files = await listPropertyImages({ userId: auth.profile.userId, propertyId });
  return NextResponse.json({ ok: true, files });
}
