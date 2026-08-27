import { NextRequest, NextResponse } from 'next/server';
import { confirmVacancy, closeVacancy, getVacancyConfirmationRecordsForProperty } from '@/server/vacancy-confirmation/service';

/**
 * POST /api/quick-verify
 * 
 * Quick vacancy confirmation — property managers confirm or close units with one tap.
 * Body: { propertyId: string, updates: { unitId: string; action: 'confirm' | 'close' }[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, updates } = body;

    if (!propertyId || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, updates[]' },
        { status: 400 },
      );
    }

    const records = await getVacancyConfirmationRecordsForProperty(propertyId);
    let confirmed = 0;
    let closed = 0;

    for (const update of updates) {
      const record = records.find((r) => r.unitIdentifier === update.unitId);
      if (!record) continue;

      if (update.action === 'confirm') {
        await confirmVacancy(record.id);
        confirmed++;
      } else if (update.action === 'close') {
        await closeVacancy(record.id);
        closed++;
      }
    }

    return NextResponse.json({
      success: true,
      confirmed,
      closed,
      message: `Done! ${confirmed} confirmed as vacant, ${closed} marked as occupied.`,
    });
  } catch (error) {
    console.error('Quick verify error:', error);
    return NextResponse.json(
      { error: 'Failed to update vacancies' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/quick-verify?propertyId=xxx
 * 
 * Get vacancy records for a property (for the quick verify page).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Missing query parameter: propertyId' },
        { status: 400 },
      );
    }

    const records = await getVacancyConfirmationRecordsForProperty(propertyId);

    return NextResponse.json({
      success: true,
      propertyId,
      records: records.map((r) => ({
        id: r.id,
        unitIdentifier: r.unitIdentifier,
        category: r.category,
        status: r.status,
        activeUntil: r.activeUntil,
        visibleInCustomerSearch: r.visibleInCustomerSearch,
      })),
    });
  } catch (error) {
    console.error('Quick verify GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vacancy records' },
      { status: 500 },
    );
  }
}
