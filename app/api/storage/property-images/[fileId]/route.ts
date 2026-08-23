import { NextResponse } from 'next/server';
import { requireApiUser } from '@/server/auth/api';
import { rejectInvalidOrigin } from '@/server/auth/request-security';
import { deleteStoredFile } from '@/server/storage/supabase-storage';

export async function DELETE(request: Request, context: { params: Promise<{ fileId: string }> }) {
  const rejected = rejectInvalidOrigin(request);
  if (rejected) return rejected;
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const { fileId } = await context.params;
  try {
    return NextResponse.json({ ok: true, ...(await deleteStoredFile({ userId: auth.profile.userId, fileId })) });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'File deletion failed.' }, { status: 404 });
  }
}
