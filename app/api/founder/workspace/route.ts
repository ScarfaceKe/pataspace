import { NextResponse } from 'next/server';
import { getFounderWorkspaceSnapshot } from '@/server/founder-admin/workspace-service';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') ?? undefined;
  return NextResponse.json({ ok: true, workspace: await getFounderWorkspaceSnapshot(query) });
}
