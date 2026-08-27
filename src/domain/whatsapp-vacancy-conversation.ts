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
  /** Escalation tracking: 0=initial, 1=first reminder, 2=AI chat, 3=owner, 4=phase3, 10=permanently removed */
  escalationLevel: number;
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

/** Escalation rules — FULL 30-DAY FLOW */
export const ESCALATION_RULES = {
  // === PHASE 1: Property Manager (Days 1-7) ===
  /** Step 1: First message at 9 AM */
  firstMessageHour: 9,
  /** Step 2: Hours after first link before resending with insistence */
  resendLinkAfterHours: 12,
  /** Step 3: Hours after insistence before AI asks specific units */
  aiChatAfterHours: 24,
  /** Daily morning reminders continue from Day 2 to Day 7 */
  dailyReminderEnabled: true,
  /** Phase 1 ends: Days after PM non-response before owner is notified */
  ownerNotificationAfterDays: 7,
  
  // === PHASE 2: Owner (Days 7-14) ===
  /** Owner notification time: 9 AM EAT (not 6:30 AM) */
  ownerNotificationHour: 9,
  /** Owner gets same 12h/24h escalation as PM */
  ownerResendAfterHours: 12,
  ownerAiChatAfterHours: 24,
  /** Phase 2 ends: Listing paused after owner also fails to verify */
  listingPausedAfterDays: 14,
  
  // === PHASE 3: Repeated Outreach (Days 14-30) ===
  /** Every 3 days, message ALL contacts (owner, PM, leasing agent) */
  phase3RepeatDays: 3,
  /** Phase 3 ends: Stop contacting after 30 days */
  maxContactDays: 30,
  /** After 30 days: Remove listings forever */
  permanentRemovalAfterDays: 30,
  
  // === General ===
  /** Maximum messages per day per person */
  maxMessagesPerDay: 15,
  /** Weekly dormant outreach frequency */
  dormantOutreachFrequencyDays: 7,
  /** Maximum messages per single conversation */
  maxMessagesPerConversation: 12,
};

/** Vacancy confirmation message templates — NEW FLOW: Link → Insist → AI Chat → Owner */
export const VACANCY_CONFIRMATION_TEMPLATES = {
  /** Step 1: First message with verification link (9 AM) */
  appFirstPrompt: {
    en: (propertyName: string, unitCount: number, quickVerifyUrl: string) =>
      `${propertyName}: ${unitCount} unit${unitCount > 1 ? 's' : ''} need${unitCount === 1 ? 's' : ''} confirmation.

Tap to verify now:
${quickVerifyUrl}`,
    sw: (propertyName: string, unitCount: number, quickVerifyUrl: string) =>
      `${propertyName}: Vitengo ${unitCount} vinahitaji uthibitisho.

Bonyeza kuthibitisha sasa:
${quickVerifyUrl}`,
  },
  /** Step 2: Resend same link with insistence (9 PM — 12h later) */
  insistentReminder: {
    en: (propertyName: string, unitCount: number, quickVerifyUrl: string) =>
      `${propertyName}: Important — your ${unitCount} unit${unitCount > 1 ? 's' : ''} must be verified to appear in customer searches.

Tap to verify now:
${quickVerifyUrl}`,
    sw: (propertyName: string, unitCount: number, quickVerifyUrl: string) =>
      `${propertyName}: Muhimu — vitengo vyako ${unitCount} vinahitaji kuthibitishwa ili kuonekana kwenye utafutaji.

Bonyeza kuthibitisha sasa:
${quickVerifyUrl}`,
  },
  /** Step 3: AI asks specific units via WhatsApp chat (9 AM next day — 24h later) */
  aiChatPrompt: {
    en: (propertyName: string, units: string[], category: string) =>
      `${propertyName}: Your ${category} listing is at risk of being removed.

Tell me which units are still vacant:
${units.join(', ')}

Reply like: "A1, A3" or "all still vacant" or "all occupied"

I can verify them directly for you right here.`,
    sw: (propertyName: string, units: string[], category: string) =>
      `${propertyName}: Orodha yako ya ${category} iko hatarini kuondolewa.

Niambii ni vitengo gani bado tupu:
${units.join(', ')}

Jibu kama: "A1, A3" au "vyote bado" au "vyote vimetwajwa"

Naweza kuthibitisha moja kwa moja hapa.`,
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
  /** Step 4: Owner notification at 9 AM — gender-neutral */
  ownerEscalation: {
    en: (propertyName: string, days: number, quickVerifyUrl: string) =>
      `${propertyName}: No vacancy confirmation for ${days} days. Your listing is no longer visible in customer searches.

As the property owner, please verify your units:
${quickVerifyUrl}`,
    sw: (propertyName: string, days: number, quickVerifyUrl: string) =>
      `${propertyName}: Hakuna uthibitisho kwa siku ${days}. Orodha yako haijaonekana kwenye utafutaji.

Kama mmiliki wa nyumba, tafadhali kuthibitisha vitengo vyako:
${quickVerifyUrl}`,
  },
  /** Phase 2: Owner insistent reminder (12h after first owner message) */
  ownerInsistentReminder: {
    en: (propertyName: string, unitCount: number, quickVerifyUrl: string) =>
      `${propertyName}: Important — your ${unitCount} unit${unitCount > 1 ? 's' : ''} must be verified to appear in customer searches.

Verify your listing now:
${quickVerifyUrl}`,
    sw: (propertyName: string, unitCount: number, quickVerifyUrl: string) =>
      `${propertyName}: Muhimu — vitengo vyako ${unitCount} vinahitaji kuthibitishwa ili kuonekana kwenye utafutaji.

Kuthibitisha orodha yako sasa:
${quickVerifyUrl}`,
  },
  /** Phase 2: Owner AI chat (24h after first owner message) */
  ownerAiChatPrompt: {
    en: (propertyName: string, units: string[]) =>
      `${propertyName}: Tell me which units are still vacant:
${units.join(', ')}

Reply like: "A1, A3" or "all still vacant" or "all occupied"

I can verify them directly for you right here.`,
    sw: (propertyName: string, units: string[]) =>
      `${propertyName}: Niambii ni vitengo gani bado tupu:
${units.join(', ')}

Jibu kama: "A1, A3" au "vyote bado" au "vyote vimetwajwa"

Naweza kuthibitisha moja kwa moja hapa.`,
  },
  /** Phase 2: Daily reminder to owner (Days 8-14) */
  ownerDailyReminder: {
    en: (propertyName: string, quickVerifyUrl: string) =>
      `${propertyName}: Please verify your listing to appear in customer searches.

Verify here:
${quickVerifyUrl}`,
    sw: (propertyName: string, quickVerifyUrl: string) =>
      `${propertyName}: Tafadhali kuthibitisha orodha yako ili kuonekana kwenye utafutaji.

Kuthibitisha hapa:
${quickVerifyUrl}`,
  },
  /** Phase 3: Message ALL contacts every 3 days (Days 14-30) */
  phase3RepeatOutreach: {
    en: (propertyName: string, role: string, quickVerifyUrl: string) =>
      `${propertyName}: Your listing is paused and not visible in searches.

As the ${role}, please verify your vacancy:
${quickVerifyUrl}

Verify to be ranked again in searches.`,
    sw: (propertyName: string, role: string, quickVerifyUrl: string) =>
      `${propertyName}: Orodha yako imesimamishwa na haijaonekana kwenye utafutaji.

Kama ${role}, tafadhali kuthibitisha nafasi yako tupu:
${quickVerifyUrl}

Kuthibitisha ili upate nafasi tena kwenye utafutaji.`,
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
