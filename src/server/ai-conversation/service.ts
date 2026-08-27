/**
 * AI Conversation Parser Service
 *
 * Uses Google Gemini to parse WhatsApp messages about vacancy status.
 * Understands English, Swahili, and Sheng (mixed).
 * Generates context-aware replies with appropriate greetings.
 */

import { detectMessageLanguage, getSmartGreeting, type VacancyParseAction } from '@/domain/whatsapp-vacancy-conversation';

interface ParsedVacancyResponse {
  action: VacancyParseAction;
  vacantUnits: string[];
  occupiedUnits: string[];
  confidence: number;
  rawInput: string;
  detectedLanguage: 'en' | 'sw' | 'mixed';
  suggestedReply: string;
}

export interface ParseContext {
  propertyCategory: 'houses' | 'shops' | 'offices';
  propertyName: string;
  unitIdentifiers: string[];
  conversationType: 'daily-vacancy-confirmation' | 'weekly-dormant-outreach' | 'owner-escalation';
  recipientName?: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey(): string | null {
  return process.env.GOOGLE_API_KEY || null;
}

/**
 * Parse a WhatsApp message about vacancy status using AI.
 * Falls back to rule-based parsing if AI is unavailable.
 */
export async function parseVacancyResponse(
  message: string,
  context: ParseContext,
): Promise<ParsedVacancyResponse> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      return await parseWithGemini(message, context, apiKey);
    } catch (error) {
      console.error('Gemini parsing failed, falling back to rule-based:', error);
    }
  }

  // Fallback: rule-based parsing
  return parseWithRules(message, context);
}

async function parseWithGemini(
  message: string,
  context: ParseContext,
  apiKey: string,
): Promise<ParsedVacancyResponse> {
  const systemPrompt = `You are PataSpace's WhatsApp vacancy assistant for Kenyan property managers and owners.

TASK: Parse the user's reply about their property vacancy status.

CONTEXT:
- Property: "${context.propertyName}" (${context.propertyCategory})
- Available units: ${context.unitIdentifiers.join(', ')}
- Conversation type: ${context.conversationType}

MIXED-USE BUILDING INTELLIGENCE:
This property may be a mixed-use building with different unit types:
- Residential units: apartments, bedsitters, single rooms, maisonettes
- Commercial units: shops, offices, stalls, kiosks
- The user may refer to units by type ("the shops are full", "apartments still vacant")
- Parse unit types and map them to the actual unit identifiers
- Example: If units are [Shop-A1, Shop-A2, Apt-B1, Apt-B2] and user says "shops full, apartments ok"
  → occupied: [Shop-A1, Shop-A2], vacant: [Apt-B1, Apt-B2]

RULES:
1. The user may reply in English, Swahili, or Sheng (mixed).
2. Understand casual language, abbreviations, and Kenyan expressions.
3. Common patterns:
   - "yes", "ndiyo", "all available", "vyote bado" → all units vacant
   - "no", "hapana", "all occupied", "vyote vimejaa" → all occupied
   - "2 taken", "3 zimeenda", "A1 na A2 zimejaa" → partial (parse which units)
   - "only B2 left", "bado A1 na A3" → only those are vacant
   - "new shop available", "nina duka jipya" → new vacancy to add
   - "shops full but flats still there" → mixed-use: shops occupied, residential vacant
   - "ukaaji bado, biashara imetwajwa" → residential vacant, commercial occupied
4. If the message is unclear, set action to "unclear".
5. Generate a natural, friendly reply in the SAME language the user used.
6. Use appropriate Kenyan greetings based on time context.

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no code blocks):
{
  "action": "all-vacant" | "partial-vacant" | "all-occupied" | "unclear" | "add-new-vacancy",
  "vacantUnits": ["unit_id"],
  "occupiedUnits": ["unit_id"],
  "confidence": 0.0 to 1.0,
  "detectedLanguage": "en" | "sw" | "mixed",
  "suggestedReply": "Natural reply message"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\nUser message: "${message}"` }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');

  const parsed = JSON.parse(text);

  // Validate units exist
  const validVacant = (parsed.vacantUnits || []).filter((u: string) =>
    context.unitIdentifiers.includes(u),
  );
  const validOccupied = (parsed.occupiedUnits || []).filter((u: string) =>
    context.unitIdentifiers.includes(u),
  );

  return {
    action: parsed.action || 'unclear',
    vacantUnits: validVacant,
    occupiedUnits: validOccupied,
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
    rawInput: message,
    detectedLanguage: parsed.detectedLanguage || detectMessageLanguage(message),
    suggestedReply: parsed.suggestedReply || generateFallbackReply(parsed.action, validVacant, validOccupied),
  };
}

/** Rule-based fallback when AI is unavailable */
function parseWithRules(
  message: string,
  context: ParseContext,
): ParsedVacancyResponse {
  const lower = message.toLowerCase().trim();
  const lang = detectMessageLanguage(message);

  // All vacant indicators
  const allVacantPatterns = [
    /^yes$/, /^yea$/, /^yup$/, /^yeah$/,
    /^ndiyo$/, /^ndio$/, /^bado$/,
    /^all\s*(available|vacant|still)$/,
    /^vyote\s*(bado|tupu|vinapatikana)$/,
    /^all\s*of\s*them$/,
    /^zote\s*bado$/,
  ];

  // All occupied indicators (including short N)
  const allOccupiedPatterns = [
    /^n$/i, /^no$/i, /^nah$/i, /^nope$/i,
    /^hapana$/i, /^la$/i,
    /^all\s*(occupied|taken|rented|gone)$/i,
    /^vyote\s*(vimejaa|vimetwajwa|vimeisha)$/i,
    /^none\s*(left|available|vacant)$/i,
    /^hakuna\s*(tena|aliye)/i,
  ];

  // Partial indicators (including PARTIAL keyword)
  const partialPatterns = [
    /^partial$/i,
    /^baadhi$/i,
    /some\s*(taken|occupied|rented|gone|available|vacant)/i,
    /baadhi\s*(vimetwajwa|vimejaa|vinapatikana)/i,
    /(\d+)\s*(taken|occupied|rented|gone)/i,
    /(\d+)\s*(available|vacant|remaining|still)/i,
  ];

  // Check all vacant
  for (const pattern of allVacantPatterns) {
    if (pattern.test(lower)) {
      return {
        action: 'all-vacant',
        vacantUnits: [...context.unitIdentifiers],
        occupiedUnits: [],
        confidence: 0.9,
        rawInput: message,
        detectedLanguage: lang,
        suggestedReply: lang === 'sw'
          ? 'Sawa! Vyote vimethibitishwa kuwa bado tupu. Asante!'
          : 'Great! All units confirmed as still vacant. Thank you!',
      };
    }
  }

  // Check all occupied
  for (const pattern of allOccupiedPatterns) {
    if (pattern.test(lower)) {
      return {
        action: 'all-occupied',
        vacantUnits: [],
        occupiedUnits: [...context.unitIdentifiers],
        confidence: 0.9,
        rawInput: message,
        detectedLanguage: lang,
        suggestedReply: lang === 'sw'
          ? 'Sawa, nimeweka vyote kuwa na mwenye. Asante kwa taarifa!'
          : 'Got it! All units marked as occupied. Thanks for letting us know!',
      };
    }
  }

  // Check partial
  for (const pattern of partialPatterns) {
    if (pattern.test(lower)) {
      // Try to extract unit names mentioned
      const mentionedUnits = context.unitIdentifiers.filter((u) =>
        lower.includes(u.toLowerCase()),
      );
      return {
        action: mentionedUnits.length > 0 ? 'partial-vacant' : 'unclear',
        vacantUnits: mentionedUnits,
        occupiedUnits: context.unitIdentifiers.filter((u) => !mentionedUnits.includes(u)),
        confidence: mentionedUnits.length > 0 ? 0.7 : 0.3,
        rawInput: message,
        detectedLanguage: lang,
        suggestedReply: lang === 'sw'
          ? `Ni vitengo gani bado tupu? Jibu kwa nambari zauniti.`
          : `Which specific units are still vacant? Please reply with the unit numbers.`,
      };
    }
  }

  // New vacancy indicators
  const newVacancyPatterns = [
    /new\s*(vacant|vacancy|unit|shop|office|house)/i,
    /mpya\s*(tupu|tupia)/i,
    /nina\s*(nyumba|duka|ofisi)\s*mpya/i,
    /add\s*(new|another)/i,
  ];

  for (const pattern of newVacancyPatterns) {
    if (pattern.test(lower)) {
      return {
        action: 'add-new-vacancy',
        vacantUnits: [],
        occupiedUnits: [],
        confidence: 0.7,
        rawInput: message,
        detectedLanguage: lang,
        suggestedReply: lang === 'sw'
          ? 'Tafadhali nielezee kuhusu kipengele kipya. Ni aina gani na iko wapi?'
          : 'Tell me more about the new vacancy. What type is it and where is it located?',
      };
    }
  }

  // Unclear — ask for clarification
  return {
    action: 'unclear',
    vacantUnits: [],
    occupiedUnits: [],
    confidence: 0.2,
    rawInput: message,
    detectedLanguage: lang,
    suggestedReply: lang === 'sw'
      ? `Pole, sijaelewa vizuri. Je, bado vitengo ${context.unitIdentifiers.join(', ')} vinafuatana? Jibu "Ndiyo" kwa vyote, au nielezee ni gani bado.`
      : `Sorry, I didn't quite understand. Are units ${context.unitIdentifiers.join(', ')} still available? Reply "Yes" for all, or tell me which ones.`,
  };
}

function generateFallbackReply(
  action: VacancyParseAction,
  vacant: string[],
  occupied: string[],
): string {
  switch (action) {
    case 'all-vacant':
      return 'All units confirmed as still vacant. Thank you!';
    case 'all-occupied':
      return 'All units marked as occupied. Thanks for the update!';
    case 'partial-vacant':
      return `Updated! ${vacant.length} vacant, ${occupied.length} occupied. Thank you!`;
    default:
      return 'Thank you for your response!';
  }
}
