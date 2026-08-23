import { NextResponse } from 'next/server';
import { updateAiAdminRecommendationStatus } from '@/server/ai-admin/service';
import type { AiAdminRecommendationStatus } from '@/domain/ai-admin-assistant';

const statuses: AiAdminRecommendationStatus[] = ['open', 'acknowledged', 'resolved', 'dismissed'];

export async function POST(request: Request) {
  const body = await request.json();
  const status = String(body.status ?? '') as AiAdminRecommendationStatus;
  if (!statuses.includes(status)) return NextResponse.json({ ok: false, message: 'Choose a valid recommendation status.' }, { status: 400 });
  const recommendation = await updateAiAdminRecommendationStatus(String(body.id ?? ''), status);
  if (!recommendation) return NextResponse.json({ ok: false, message: 'Recommendation was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, recommendation });
}
