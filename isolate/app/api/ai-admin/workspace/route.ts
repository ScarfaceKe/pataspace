import { NextResponse } from 'next/server';
import { buildAiPlatformSummary, buildAiWorkspaceRecommendations, buildCriticalAlerts, buildPlatformHealthOverview } from '@/server/ai-admin-workspace/service';

export async function GET() {
  const [summary, recommendations, criticalAlerts, health] = await Promise.all([
    buildAiPlatformSummary(),
    buildAiWorkspaceRecommendations(),
    buildCriticalAlerts(),
    buildPlatformHealthOverview()
  ]);
  return NextResponse.json({ ok: true, summary, recommendations, criticalAlerts, health });
}
