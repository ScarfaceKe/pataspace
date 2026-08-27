import { NextRequest, NextResponse } from 'next/server';
import { parseVacancyResponse, type ParseContext } from '@/server/ai-conversation/service';

/**
 * POST /api/ai/test-conversation
 * 
 * Test the AI parser with various vacancy-related messages.
 * Body: { message: string, units?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, units = ['A1', 'A2', 'A3', 'B1', 'B2'] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: message (string)' },
        { status: 400 },
      );
    }

    const context: ParseContext = {
      propertyCategory: 'houses',
      propertyName: 'Sunrise Apartments',
      unitIdentifiers: units,
      conversationType: 'daily-vacancy-confirmation',
      recipientName: 'Test Manager',
    };

    const result = await parseVacancyResponse(message, context);

    return NextResponse.json({
      success: true,
      input: message,
      parsed: {
        action: result.action,
        vacantUnits: result.vacantUnits,
        occupiedUnits: result.occupiedUnits,
        confidence: result.confidence,
        detectedLanguage: result.detectedLanguage,
        suggestedReply: result.suggestedReply,
      },
    });
  } catch (error) {
    console.error('AI test error:', error);
    return NextResponse.json(
      { error: 'Failed to parse message', details: String(error) },
      { status: 500 },
    );
  }
}
