import { NextRequest, NextResponse } from 'next/server';
import { checkAndEscalateToOwner, checkAndEscalateToUnitDetail } from '@/server/whatsapp-conversation/service';

/**
 * POST /api/cron/vacancy-check
 * 
 * Cron job endpoint — called daily by an external scheduler (e.g., Vercel Cron, cron-job.org, or GitHub Actions).
 * 
 * Tasks:
 * 1. Check for app-prompt conversations that need unit-level detail (12h escalation)
 * 2. Check for PM non-response that needs owner escalation (2 days)
 * 
 * Security: Validate CRON_SECRET to prevent unauthorized calls.
 * 
 * To set up a free cron scheduler:
 * - Go to https://cron-job.org (free, no credit card)
 * - Create a job pointing to POST https://your-domain.com/api/cron/vacancy-check
 * - Set to run daily at 9:00 AM EAT (6:00 AM UTC)
 * - Add header: Authorization: Bearer YOUR_CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    // 1. Escalate app-prompt conversations to unit detail (12h after initial prompt)
    const unitDetailCount = await checkAndEscalateToUnitDetail();
    if (unitDetailCount > 0) {
      results.push(`Escalated ${unitDetailCount} conversations to unit-level detail`);
    }

    // 2. Escalate to owner (2 days PM non-response)
    const ownerEscalationCount = await checkAndEscalateToOwner();
    if (ownerEscalationCount > 0) {
      results.push(`Escalated ${ownerEscalationCount} conversations to property owners`);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: results.length > 0 ? results : ['No escalations needed at this time'],
    });
  } catch (error) {
    console.error('Cron vacancy check error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cron/vacancy-check
 * 
 * Health check for the cron endpoint.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'vacancy-check',
    timestamp: new Date().toISOString(),
  });
}
