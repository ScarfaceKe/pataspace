import { NextRequest, NextResponse } from 'next/server';
import { startVacancyConfirmationConversation } from '@/server/whatsapp-conversation/service';
import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';

/**
 * POST /api/cron/send-daily-messages
 * 
 * Daily cron job — sends vacancy confirmation messages to property managers/owners.
 * 
 * Tasks:
 * 1. Find all active vacant units
 * 2. Group by property
 * 3. Send app-first prompt to responsible person
 * 4. Respects quiet hours, message frequency limits
 * 
 * Schedule: Run daily at 9:00 AM EAT (6:00 AM UTC) on weekdays
 * 
 * To set up free cron scheduler:
 * - https://cron-job.org (free, no credit card)
 * - POST to: https://your-domain.com/api/cron/send-daily-messages
 * - Header: Authorization: Bearer YOUR_CRON_SECRET
 * - Schedule: Monday-Friday, 6:00 AM UTC
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active vacant records
    const records = await getAllVacancyConfirmationRecords();
    const activeVacant = records.filter((r) => r.status === 'confirmed-vacancy' || r.status === 'grace-period');

    if (activeVacant.length === 0) {
      return NextResponse.json({
        success: true,
        messagesSent: 0,
        message: 'No active vacant units to confirm',
      });
    }

    // Group by property
    const byProperty = new Map<string, typeof activeVacant>();
    for (const record of activeVacant) {
      const existing = byProperty.get(record.propertyId) || [];
      existing.push(record);
      byProperty.set(record.propertyId, existing);
    }

    let sent = 0;
    const errors: string[] = [];

    // Send one conversation per property
    for (const [propertyId, propertyRecords] of byProperty) {
      try {
        const category = propertyRecords[0].category as 'houses' | 'shops' | 'offices';
        const unitIdentifiers = propertyRecords.map((r) => r.unitIdentifier);

        const conversation = await startVacancyConfirmationConversation({
          propertyId,
          propertyCategory: category,
          propertyName: `Property ${propertyId.slice(0, 8)}`,
          unitIdentifiers,
        });

        if (conversation) sent++;
      } catch (error) {
        errors.push(`Property ${propertyId}: ${String(error)}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      messagesSent: sent,
      totalProperties: byProperty.size,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Daily message sender error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 },
    );
  }
}
