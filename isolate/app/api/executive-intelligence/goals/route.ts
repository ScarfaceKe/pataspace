import { NextResponse } from 'next/server';
import { recommendBusinessGoals, updateBusinessGoalProgress } from '@/server/executive-intelligence/service';
export async function GET() { return NextResponse.json({ ok: true, recommendations: await recommendBusinessGoals(), activeGoals: await updateBusinessGoalProgress() }); }
