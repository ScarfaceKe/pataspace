import { NextResponse } from 'next/server';
import { explainRecommendation, getSearchRecoveryPlan, interpretSearchDescription } from '@/server/recommendations/service';
export async function POST(request: Request) { const body = await request.json(); return NextResponse.json({ ok: true, ...(await explainRecommendation(body.signals ?? [])), interpretedDescription: body.description ? await interpretSearchDescription(String(body.description)) : undefined, recoveryPlan: body.location ? await getSearchRecoveryPlan(String(body.location)) : undefined }); }
