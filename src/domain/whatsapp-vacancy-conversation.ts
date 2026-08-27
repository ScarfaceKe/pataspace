/**
 * WhatsApp Vacancy Conversation — Domain Model
 *
 * Two-way WhatsApp conversations for vacancy confirmation.
 * Property managers/owners receive messages, reply naturally,
 * and AI parses their responses to update vacancy records.
 *
 * Escalation chain: Property Manager → Owner (after 2 days no response)
 */

export type ConversationState =
  | 'idle'
  | 'app-prompt-sent'
  | 'app-prompt-responded'
  | 'awaiting-vacancy-response'
  | 'awaiting-partial-specification'
  | 'awaiting-owner-action'
  | 'dormant-outreach-sent'
  | 'dormant-awaiting-response'
  | 'completed'
  | 'escalated-to-owner';

export type ConversationType =
  | 'daily-vacancy-confirmation'
  | 'weekly-dormant-outreach'
  | 'owner-escalation';

export type GreetingType = 'morning' | 'afternoon' | 'evening' | 'night';

export type VacancyParseAction =
  | 'all-vacant'
  | 'partial-vacant'
  | 'all-occupied'
  | 'unclear'
  | 'add-new-vacancy';

export interface WhatsAppVacancyConversation {
  id: string;
  propertyId: string;
  propertyCategory: 'houses' | 'shops' | 'offices';
  propertyName: string;
  unitIdentifiers: string[];
  /** Who we're currently talking to */
  currentRecipientUserId: string;
  currentRecipientRole: 'property-manager' | 'property-owner';
  currentRecipientPhone: string;
  /** The original property manager (for escalation) */
  originalPropertyManagerUserId?: string;
  originalPropertyManagerPhone?: string;
  /** The property owner (for escalation) */
  propertyOwnerUserId?: string;
  propertyOwnerPhone?: string;
  conversationType: ConversationType;
  state: ConversationState;
  messageHistory: ConversationMessage[];
  /** For partial updates — which units they said are vacant */
  confirmedVacantUnits: string[];
  confirmedOccupiedUnits: string[];
  /** Escalation tracking */
  escalationLevel: 0 | 1 | 2;
  escalationTriggeredAt?: string;
  daysSinceLastResponse: number;
  /** Timing */
  createdAt: string;
  lastMessageAt: string;
  lastResponseAt?: string;
  completedAt?: string;
}

export interface ConversationMessage {
  id: string;
  direction: 'outbound' | 'inbound';
  senderRole: 'system' | 'property-manager' | 'property-owner';
  content: string;
  language: 'en' | 'sw' | 'mixed';
  timestamp: string;
  /** AI parsed result (for inbound messages) */
  parsedResult?: {
    action: VacancyParseAction;
    vacantUnits: string[];
    occupiedUnits: string[];
    confidence: number;
    rawInput: string;
  };
}

export interface SmartGreeting {
  type: GreetingType;
  greeting: string;
  swahiliGreeting: string;
}

/** Time-of-day aware greetings */
export const SMART_GREETINGS: Record<GreetingType, { en: string; sw: string }> = {
  morning: {
    en: 'Good morning',
    sw: 'Habari za asubuhi',
  },
  afternoon: {
    en: 'Good afternoon',
    sw: 'Habari za mchana',
  },
  evening: {
    en: 'Good evening',
    sw: 'Habari za jioni',
  },
  night: {
    en: 'Good evening',
    sw: 'Habari za jioni',
  },
};

/** Quiet hours: 9:30 PM to 6:30 AM EAT */
export const QUIET_HOURS = {
  startHour: 21,
  startMinute: 30,
  endHour: 6,
  endMinute: 30,
  timezone: 'Africa/Nairobi',
};

/** Escalation rules */
export const ESCALATION_RULES = {
  /** Hours after app prompt before asking about specific units */
  unitDetailAfterHours: 12,
  /** Days after PM non-response before owner is notified */
  ownerNotificationAfterDays: 2,
  /** Days after owner notification before system takes final action */
  finalActionAfterOwnerDays: 7,
  /** Maximum messages per day per person — keeps costs low */
  maxMessagesPerDay: 15,
  /** Weekly dormant outreach frequency */
  dormantOutreachFrequencyDays: 7,
  /** Maximum messages per single conversation */
  maxMessagesPerConversation: 5,
};

/** Vacancy confirmation message templates — LEAN: short, precise, cost-efficient */
export const VACANCY_CONFIRMATION_TEMPLATES = {
  /** Step 1: Ask if they can verify on the app (1 message, short) */
  appFirstPrompt: {
    en: (propertyName: string, unitCount: number) =>
      `${propertyName}: ${unitCount} unit${unitCount > 1 ? 's' : ''} need${unitCount === 1 ? 's' : ''} confirmation. Verify on PataSpace today?`,
    sw: (propertyName: string, unitCount: number) =>
      `${propertyName}: Vitengo ${unitCount} vinahitaji uthibitisho. Kuthibitisha kwenye PataSpace leo?`,
  },
  /** Step 2: If no app action after 12h, ask about specific units */
  unitDetailPrompt: {
    en: (propertyName: string, units: string[]) =>
      `${propertyName}: Which of ${units.join(', ')} still vacant? Reply the numbers.`,
    sw: (propertyName: string, units: string[]) =>
      `${propertyName}: Ni ${units.join(', ')} gani bado tupu? Jibu nambari.`,
  },
  /** Short confirmation prompt */
  initialPrompt: {
    en: (propertyName: string, units: string[]) =>
      `${propertyName}: ${units.join(', ')} — still vacant? Reply Y, N, or PARTIAL.`,
    sw: (propertyName: string, units: string[]) =>
      `${propertyName}: ${units.join(', ')} — bado? Jibu NDIYO, HAPANA, au BAADHI.`,
  },
  partialClarification: {
    en: (remaining: string[]) =>
      `Which ones? Reply numbers: ${remaining.join(', ')}`,
    sw: (remaining: string[]) =>
      `Ni gani? Jibu nambari: ${remaining.join(', ')}`,
  },
  confirmationSuccess: {
    en: (vacantCount: number, occupiedCount: number) =>
      `Done! ${vacantCount} vacant, ${occupiedCount} occupied. Listings updated.`,
    sw: (vacantCount: number, occupiedCount: number) =>
      `Imekamilika! ${vacantCount} tupu, ${occupiedCount} na mwenye. Orodha zimesasishwa.`,
  },
  ownerEscalation: {
    en: (propertyName: string, days: number) =>
      `${propertyName}: No vacancy confirmation for ${days} days. Manager hasn't responded. Please verify your units on PataSpace.`,
    sw: (propertyName: string, days: number) =>
      `${propertyName}: Hakuna uthibitisho kwa siku ${days}. Meneja hawajajibu. Tafadhali kuthibitisha kwenye PataSpace.`,
  },
  dormantOutreach: {
    en: (managerName: string) =>
      `${managerName}: Any new vacant spaces to list on PataSpace? Reply YES to start.`,
    sw: (managerName: string) =>
      `${managerName}: Una nafasi mpya tupu za kuorodhesha? Jibu NDIYO kuanza.`,
  },
};

/** Convert UTC hour to EAT (UTC+3) and determine greeting type */
export function getGreetingType(utcDate: Date = new Date()): GreetingType {
  const eatHour = (utcDate.getUTCHours() + 3) % 24;
  if (eatHour >= 6 && eatHour < 12) return 'morning';
  if (eatHour >= 12 && eatHour < 17) return 'afternoon';
  if (eatHour >= 17 && eatHour < 21) return 'evening';
  return 'night';
}

/** Check if current EAT time is within quiet hours */
export function isQuietHours(utcDate: Date = new Date()): boolean {
  const eatHour = (utcDate.getUTCHours() + 3) % 24;
  const eatMinute = utcDate.getUTCMinutes();
  const timeMinutes = eatHour * 60 + eatMinute;
  const startMinutes = QUIET_HOURS.startHour * 60 + QUIET_HOURS.startMinute;
  const endMinutes = QUIET_HOURS.endHour * 60 + QUIET_HOURS.endMinute;

  // Quiet hours span midnight (9:30 PM → 6:30 AM)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

/** Detect language of a message (simple heuristic) */
export function detectMessageLanguage(text: string): 'en' | 'sw' | 'mixed' {
  const swahiliWords = [
    'ndiyo', 'hapana', 'bado', 'voipi', 'sawa', 'niaje', 'mambo',
    'habari', 'asante', 'karibu', 'twajwa', 'jaa', 'tupu', 'zote',
    'baadhi', 'kide', 'kila', 'hii', 'hiyo', 'ile', 'hizi',
    'kwa', 'na', 'ya', 'wa', 'la', 'ni', 'kwenye', 'pia',
    'nina', 'una', 'kuna', 'hatuna', 'tuko', 'mko',
    'nzuri', 'mbaya', 'sawa', 'pole', 'shida',
  ];
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  let swCount = 0;
  for (const word of words) {
    if (swahiliWords.includes(word)) swCount++;
  }
  const ratio = swCount / words.length;
  if (ratio > 0.3) return 'sw';
  if (ratio > 0.1) return 'mixed';
  return 'en';
}

/** Get the appropriate greeting for the current time and language */
export function getSmartGreeting(language: 'en' | 'sw' | 'mixed', utcDate: Date = new Date()): string {
  const greetingType = getGreetingType(utcDate);
  const greetings = SMART_GREETINGS[greetingType];
  if (language === 'sw') return greetings.sw;
  if (language === 'mixed') return `${greetings.en} / ${greetings.sw}`;
  return greetings.en;
}
