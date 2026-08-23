import { NextResponse } from 'next/server';
import { listAiAdminRecommendations, runAiAdminFoundationScan } from '@/server/ai-admin/service';

export async function GET() {
  await runAiAdminFoundationScan();
  return NextResponse.json({ ok: true, recommendations: await listAiAdminRecommendations() });
}
