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
  /** Days after PM non-response before owner is notified */
  ownerNotificationAfterDays: 2,
  /** Days after owner notification before system takes final action */
  finalActionAfterOwnerDays: 7,
  /** Maximum messages per day per person */
  maxMessagesPerDay: 2,
  /** Weekly dormant outreach frequency */
  dormantOutreachFrequencyDays: 7,
};

/** Vacancy confirmation message templates */
export const VACANCY_CONFIRMATION_TEMPLATES = {
  initialPrompt: {
    en: (propertyName: string, units: string[]) =>
      `Hi! Your property "${propertyName}" has ${units.length} vacant unit${units.length > 1 ? 's' : ''} on PataSpace: ${units.join(', ')}.\n\nAre they still available?\n\nReply:\n• "Yes" or "All available" — all still vacant\n• "Some taken" — tell me which ones\n• "All occupied" — none available anymore`,
    sw: (propertyName: string, units: string[]) =>
      `Habari! Nyumba yako "${propertyName}" ina vitengo ${units.length} tupu kwenye PataSpace: ${units.join(', ')}.\n\nBado vinapatikana?\n\nJibu:\n• "Ndiyo" au "vyote bado" — vyote bado tupu\n• "Baadhi vimetwajwa" — ni gani bado\n• "Vyote vimejaa" — hakuna tena`,
  },
  partialClarification: {
    en: (remaining: string[]) =>
      `Which units are still vacant? Reply with the unit numbers, for example: "${remaining.slice(0, 2).join(', ')}"`,
    sw: (remaining: string[]) =>
      `Ni vitengo gani bado tupu? Jibu kwa nambari zauniti, mfano: "${remaining.slice(0, 2).join(', ')}"`,
  },
  confirmationSuccess: {
    en: (vacantCount: number, occupiedCount: number) =>
      `Updated! ${vacantCount} unit${vacantCount !== 1 ? 's' : ''} confirmed as vacant.${occupiedCount > 0 ? ` ${occupiedCount} marked as occupied.` : ''} Your listings stay active.`,
    sw: (vacantCount: number, occupiedCount: number) =>
      `Imesasishwa! Uniti ${vacantCount} imethibitishwa kuwa tupu.${occupiedCount > 0 ? ` ${occupiedCount} imetajwa kuwa na mwenye.` : ''} Orodha zako zinaendelea.`,
  },
  ownerEscalation: {
    en: (propertyName: string, days: number, managerName: string) =>
      `Hi! Your property "${propertyName}" has not had its vacancy confirmed for ${days} days. Your property manager ${managerName} has not responded.\n\nAs the owner, you can:\n• Confirm units are still vacant\n• Mark some as occupied\n• Let us know if the property manager has changed`,
    sw: (propertyName: string, days: number, managerName: string) =>
      `Habari! Nyumba yako "${propertyName}" haijathibitishwa kwa siku ${days}. Meneja wako ${managerName} hawajajibu.\n\nKama mmiliki, unaweza:\n• Kuthibitisha kuwa bado tupu\n• Kuashiria baadhi yamejaa\n• Kutufahamisha kama meneja amebadilika`,
  },
  dormantOutreach: {
    en: (managerName: string) =>
      `Hi ${managerName}! Do you have any new vacant houses, shops, or offices to list on PataSpace? We'd love to help you find tenants. Reply "Yes" to get started.`,
    sw: (managerName: string) =>
      `Habari ${managerName}! Una nyumba, maduka, au ofisi mpya tupu za kuorodhesha kwenye PataSpace? Tungependa kukusaidia kupata wapangaji. Jibu "Ndiyo" kuanza.`,
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
