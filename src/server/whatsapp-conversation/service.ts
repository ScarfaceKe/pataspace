/**
 * WhatsApp Vacancy Conversation Service
 *
 * Manages two-way WhatsApp conversations for vacancy confirmation.
 * Handles: daily confirmations, dormant outreach, owner escalation.
 * Respects quiet hours, smart greetings, and message frequency limits.
 */

import { randomUUID } from 'node:crypto';
import {
  type WhatsAppVacancyConversation,
  type ConversationMessage,
  type ConversationState,
  type ConversationType,
  isQuietHours,
  getSmartGreeting,
  detectMessageLanguage,
  ESCALATION_RULES,
  VACANCY_CONFIRMATION_TEMPLATES,
} from '@/domain/whatsapp-vacancy-conversation';
import { parseVacancyResponse, type ParseContext } from '@/server/ai-conversation/service';
import { confirmVacancy, closeVacancy, getVacancyConfirmationRecordsForProperty } from '@/server/vacancy-confirmation/service';
import { queueImportantWhatsAppNotification } from '@/server/whatsapp/service';
import { readConversationStore, writeConversationStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

/**
 * Start a daily vacancy confirmation conversation for a property.
 * Sends the initial prompt to the property manager (or owner if no PM).
 */
export async function startVacancyConfirmationConversation(input: {
  propertyId: string;
  propertyCategory: 'houses' | 'shops' | 'offices';
  propertyName: string;
  unitIdentifiers: string[];
  propertyManagerUserId?: string;
  propertyManagerPhone?: string;
  propertyManagerName?: string;
  propertyOwnerUserId?: string;
  propertyOwnerPhone?: string;
}): Promise<WhatsAppVacancyConversation | null> {
  if (isQuietHours()) return null;

  const recipientUserId = input.propertyManagerUserId || input.propertyOwnerUserId;
  const recipientPhone = input.propertyManagerPhone || input.propertyOwnerPhone;
  const recipientRole = input.propertyManagerUserId ? 'property-manager' as const : 'property-owner' as const;

  if (!recipientUserId || !recipientPhone) return null;

  const store = await readConversationStore();

  // Check message frequency
  const today = new Date().toISOString().split('T')[0];
  const recentMessages = store.conversations.filter(
    (c) =>
      c.currentRecipientUserId === recipientUserId &&
      c.lastMessageAt.startsWith(today),
  );
  if (recentMessages.length >= ESCALATION_RULES.maxMessagesPerDay) return null;

  const greeting = getSmartGreeting('en');
  const appUrl = process.env.APP_URL || 'https://pataspace.freebuff.app';
  const quickVerifyUrl = `${appUrl}/quick-verify?propertyId=${encodeURIComponent(input.propertyId)}&name=${encodeURIComponent(input.propertyName)}`;
  const template = VACANCY_CONFIRMATION_TEMPLATES.appFirstPrompt.en(
    input.propertyName,
    input.unitIdentifiers.length,
    quickVerifyUrl,
  );
  const messageText = `${greeting} ${input.propertyManagerName || ''}\n\n${template}`.trim();

  const conversation: WhatsAppVacancyConversation = {
    id: randomUUID(),
    propertyId: input.propertyId,
    propertyCategory: input.propertyCategory,
    propertyName: input.propertyName,
    unitIdentifiers: input.unitIdentifiers,
    currentRecipientUserId: recipientUserId,
    currentRecipientRole: recipientRole,
    currentRecipientPhone: recipientPhone,
    originalPropertyManagerUserId: input.propertyManagerUserId,
    originalPropertyManagerPhone: input.propertyManagerPhone,
    propertyOwnerUserId: input.propertyOwnerUserId,
    propertyOwnerPhone: input.propertyOwnerPhone,
    conversationType: 'daily-vacancy-confirmation',
    state: 'app-prompt-sent',
    messageHistory: [],
    confirmedVacantUnits: [],
    confirmedOccupiedUnits: [],
    escalationLevel: 0,
    daysSinceLastResponse: 0,
    createdAt: nowIso(),
    lastMessageAt: nowIso(),
  };

  // Send via WhatsApp
  await sendWhatsAppMessage(conversation, messageText);

  conversation.messageHistory.push({
    id: randomUUID(),
    direction: 'outbound',
    senderRole: 'system',
    content: messageText,
    language: 'en',
    timestamp: nowIso(),
  });

  store.conversations.push(conversation);
  await writeConversationStore(store);
  return conversation;
}

/**
 * Process an incoming WhatsApp message reply.
 * Parses with AI, updates vacancies, sends appropriate response.
 */
export async function processIncomingMessage(
  senderPhone: string,
  messageText: string,
): Promise<{ conversationId: string; reply: string } | null> {
  const store = await readConversationStore();

  // Find the active conversation for this phone number
  const conversation = store.conversations.find(
    (c) =>
      c.currentRecipientPhone === senderPhone &&
      c.state !== 'completed' &&
      c.state !== 'idle',
  );

  if (!conversation) return null;

  // Parse the message with AI
  const parseContext: ParseContext = {
    propertyCategory: conversation.propertyCategory,
    propertyName: conversation.propertyName,
    unitIdentifiers: conversation.unitIdentifiers,
    conversationType: conversation.conversationType,
  };

  const parsed = await parseVacancyResponse(messageText, parseContext);

  // Record the inbound message
  const inboundMessage: ConversationMessage = {
    id: randomUUID(),
    direction: 'inbound',
    senderRole: conversation.currentRecipientRole,
    content: messageText,
    language: parsed.detectedLanguage,
    timestamp: nowIso(),
    parsedResult: {
      action: parsed.action,
      vacantUnits: parsed.vacantUnits,
      occupiedUnits: parsed.occupiedUnits,
      confidence: parsed.confidence,
      rawInput: parsed.rawInput,
    },
  };

  conversation.messageHistory.push(inboundMessage);
  conversation.lastResponseAt = nowIso();
  conversation.lastMessageAt = nowIso();

  let reply = '';
  let newState: ConversationState = 'completed';

  switch (parsed.action) {
    case 'all-vacant': {
      // Confirm all units as vacant
      for (const unit of conversation.unitIdentifiers) {
        const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
        const record = records.find((r) => r.unitIdentifier === unit);
        if (record) await confirmVacancy(record.id);
      }
      conversation.confirmedVacantUnits = [...conversation.unitIdentifiers];
      conversation.confirmedOccupiedUnits = [];
      reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.confirmationSuccess.en(
        conversation.unitIdentifiers.length,
        0,
      );
      newState = 'completed';
      break;
    }

    case 'all-occupied': {
      // Mark all units as occupied
      for (const unit of conversation.unitIdentifiers) {
        const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
        const record = records.find((r) => r.unitIdentifier === unit);
        if (record) await closeVacancy(record.id);
      }
      conversation.confirmedVacantUnits = [];
      conversation.confirmedOccupiedUnits = [...conversation.unitIdentifiers];
      reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.confirmationSuccess.en(
        0,
        conversation.unitIdentifiers.length,
      );
      newState = 'completed';
      break;
    }

    case 'partial-vacant': {
      if (parsed.vacantUnits.length > 0) {
        // Confirm vacant units, close occupied ones
        for (const unit of parsed.vacantUnits) {
          const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
          const record = records.find((r) => r.unitIdentifier === unit);
          if (record) await confirmVacancy(record.id);
        }
        for (const unit of parsed.occupiedUnits) {
          const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
          const record = records.find((r) => r.unitIdentifier === unit);
          if (record) await closeVacancy(record.id);
        }
        conversation.confirmedVacantUnits = parsed.vacantUnits;
        conversation.confirmedOccupiedUnits = parsed.occupiedUnits;
        reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.confirmationSuccess.en(
          parsed.vacantUnits.length,
          parsed.occupiedUnits.length,
        );
        newState = 'completed';
      } else {
        // Need clarification on which units
        newState = 'awaiting-partial-specification';
        reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.partialClarification.en(
          conversation.unitIdentifiers,
        );
      }
      break;
    }

    case 'add-new-vacancy': {
      reply = parsed.suggestedReply || 'Tell me more about the new vacancy. What type is it and where is it located?';
      newState = 'awaiting-vacancy-response';
      break;
    }

    case 'unclear':
    default: {
      newState = 'awaiting-vacancy-response';
      reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.partialClarification.en(
        conversation.unitIdentifiers,
      );
      break;
    }
  }

  // Update conversation state
  conversation.state = newState;
  if (newState === 'completed') {
    conversation.completedAt = nowIso();
  }

  // Send reply
  await sendWhatsAppMessage(conversation, reply);

  conversation.messageHistory.push({
    id: randomUUID(),
    direction: 'outbound',
    senderRole: 'system',
    content: reply,
    language: parsed.detectedLanguage,
    timestamp: nowIso(),
  });

  // Update store
  const index = store.conversations.findIndex((c) => c.id === conversation.id);
  if (index >= 0) store.conversations[index] = conversation;
  await writeConversationStore(store);

  return { conversationId: conversation.id, reply };
}

/**
 * FULL 30-DAY ESCALATION FLOW
 * 
 * Phase 1 (Days 1-7): Property Manager
 * Phase 2 (Days 7-14): Owner takes over
 * Phase 3 (Days 14-30): Every 3 days to ALL contacts
 * After 30 days: Remove listings forever
 */
export async function checkAndEscalateToOwner(): Promise<number> {
  const store = await readConversationStore();
  const now = Date.now();
  const currentHour = (new Date().getUTCHours() + 3) % 24; // EAT
  let escalated = 0;
  const appUrl = process.env.APP_URL || 'https://pataspace.freebuff.app';

  for (const conversation of store.conversations) {
    const createdAt = new Date(conversation.createdAt).getTime();
    const daysSinceCreation = Math.floor((now - createdAt) / (24 * 60 * 60 * 1000));
    const quickVerifyUrl = `${appUrl}/quick-verify?propertyId=${encodeURIComponent(conversation.propertyId)}&name=${encodeURIComponent(conversation.propertyName)}`;

    // === PHASE 1: Daily reminders to PM (Days 2-7) ===
    if (
      conversation.state === 'awaiting-vacancy-response' &&
      conversation.currentRecipientRole === 'property-manager' &&
      daysSinceCreation >= 2 && daysSinceCreation < 7 &&
      currentHour === ESCALATION_RULES.firstMessageHour &&
      !isQuietHours()
    ) {
      // Send daily reminder with link
      const lastMsgDay = conversation.lastMessageAt ? 
        Math.floor((now - new Date(conversation.lastMessageAt).getTime()) / (24 * 60 * 60 * 1000)) : 99;
      
      if (lastMsgDay >= 1) { // Only send if last message was yesterday or more
        const greeting = getSmartGreeting('en');
        const template = VACANCY_CONFIRMATION_TEMPLATES.insistentReminder.en(
          conversation.propertyName,
          conversation.unitIdentifiers.length,
          quickVerifyUrl,
        );
        const messageText = `${greeting}\n\n${template}`;

        await sendWhatsAppMessage(conversation, messageText);
        conversation.messageHistory.push({
          id: randomUUID(),
          direction: 'outbound',
          senderRole: 'system',
          content: messageText,
          language: 'en',
          timestamp: nowIso(),
        });
        conversation.lastMessageAt = nowIso();
        escalated++;
      }
    }

    // === PHASE 2: Owner escalation at 9 AM (Day 7) ===
    if (
      conversation.state === 'awaiting-vacancy-response' &&
      conversation.currentRecipientRole === 'property-manager' &&
      conversation.propertyOwnerUserId &&
      conversation.propertyOwnerPhone &&
      conversation.escalationLevel === 0 &&
      daysSinceCreation >= ESCALATION_RULES.ownerNotificationAfterDays &&
      currentHour === ESCALATION_RULES.ownerNotificationHour &&
      !isQuietHours()
    ) {
      // Create owner conversation at 9 AM
      const greeting = getSmartGreeting('en');
      const template = VACANCY_CONFIRMATION_TEMPLATES.ownerEscalation.en(
        conversation.propertyName,
        daysSinceCreation,
        quickVerifyUrl,
      );
      const messageText = `${greeting}\n\n${template}`;

      const ownerConversation: WhatsAppVacancyConversation = {
        ...conversation,
        id: randomUUID(),
        currentRecipientUserId: conversation.propertyOwnerUserId,
        currentRecipientRole: 'property-owner',
        currentRecipientPhone: conversation.propertyOwnerPhone,
        conversationType: 'owner-escalation',
        state: 'escalated-to-owner',
        escalationLevel: 1,
        escalationTriggeredAt: nowIso(),
        daysSinceLastResponse: daysSinceCreation,
        messageHistory: [],
        createdAt: nowIso(),
        lastMessageAt: nowIso(),
      };

      await sendWhatsAppMessage(ownerConversation, messageText);
      ownerConversation.messageHistory.push({
        id: randomUUID(),
        direction: 'outbound',
        senderRole: 'system',
        content: messageText,
        language: 'en',
        timestamp: nowIso(),
      });

      conversation.escalationLevel = 1;
      conversation.escalationTriggeredAt = nowIso();
      conversation.daysSinceLastResponse = daysSinceCreation;

      store.conversations.push(ownerConversation);
      escalated++;
    }

    // === PHASE 2: Owner 12h/24h escalation (Days 7-14) ===
    if (
      conversation.state === 'escalated-to-owner' &&
      conversation.currentRecipientRole === 'property-owner' &&
      !isQuietHours()
    ) {
      const ownerCreatedAt = new Date(conversation.createdAt).getTime();
      const hoursSinceOwner = (now - ownerCreatedAt) / (60 * 60 * 1000);

      // 12h: Insistent reminder to owner
      if (hoursSinceOwner >= ESCALATION_RULES.ownerResendAfterHours && hoursSinceOwner < ESCALATION_RULES.ownerAiChatAfterHours && conversation.escalationLevel === 1) {
        const greeting = getSmartGreeting('en');
        const template = VACANCY_CONFIRMATION_TEMPLATES.ownerInsistentReminder.en(
          conversation.propertyName,
          conversation.unitIdentifiers.length,
          quickVerifyUrl,
        );
        const messageText = `${greeting}\n\n${template}`;

        await sendWhatsAppMessage(conversation, messageText);
        conversation.messageHistory.push({
          id: randomUUID(),
          direction: 'outbound',
          senderRole: 'system',
          content: messageText,
          language: 'en',
          timestamp: nowIso(),
        });
        conversation.escalationLevel = 2;
        conversation.lastMessageAt = nowIso();
        escalated++;
      }

      // 24h: AI asks owner specific units
      if (hoursSinceOwner >= ESCALATION_RULES.ownerAiChatAfterHours && conversation.escalationLevel <= 2) {
        const greeting = getSmartGreeting('en');
        const template = VACANCY_CONFIRMATION_TEMPLATES.ownerAiChatPrompt.en(
          conversation.propertyName,
          conversation.unitIdentifiers,
        );
        const messageText = `${greeting}\n\n${template}`;

        await sendWhatsAppMessage(conversation, messageText);
        conversation.messageHistory.push({
          id: randomUUID(),
          direction: 'outbound',
          senderRole: 'system',
          content: messageText,
          language: 'en',
          timestamp: nowIso(),
        });
        conversation.escalationLevel = 3;
        conversation.lastMessageAt = nowIso();
        escalated++;
      }
    }

    // === PHASE 3: Every 3 days, message ALL contacts (Days 14-30) ===
    if (
      daysSinceCreation >= ESCALATION_RULES.listingPausedAfterDays &&
      daysSinceCreation < ESCALATION_RULES.permanentRemovalAfterDays &&
      conversation.escalationLevel >= 1 &&
      currentHour === ESCALATION_RULES.firstMessageHour &&
      !isQuietHours()
    ) {
      // Check if we sent a Phase 3 message recently (within 2 days)
      const lastPhase3Msg = conversation.messageHistory.find(
        (m) => m.direction === 'outbound' && 
        m.content.includes('paused and not visible') &&
        (now - new Date(m.timestamp).getTime()) < (2 * 24 * 60 * 60 * 1000)
      );

      if (!lastPhase3Msg) {
        // Send to ALL contacts for this property
        const contacts = [
          { userId: conversation.propertyOwnerUserId, phone: conversation.propertyOwnerPhone, role: 'property owner' },
          { userId: conversation.originalPropertyManagerUserId, phone: conversation.originalPropertyManagerPhone, role: 'property manager' },
        ].filter((c) => c.userId && c.phone);

        for (const contact of contacts) {
          const greeting = getSmartGreeting('en');
          const template = VACANCY_CONFIRMATION_TEMPLATES.phase3RepeatOutreach.en(
            conversation.propertyName,
            contact.role,
            quickVerifyUrl,
          );
          const messageText = `${greeting}\n\n${template}`;

          const phase3Conversation: WhatsAppVacancyConversation = {
            ...conversation,
            id: randomUUID(),
            currentRecipientUserId: contact.userId!,
            currentRecipientRole: contact.role.includes('owner') ? 'property-owner' : 'property-manager',
            currentRecipientPhone: contact.phone!,
            conversationType: 'owner-escalation',
            state: 'escalated-to-owner',
            escalationLevel: 4,
            messageHistory: [],
            createdAt: nowIso(),
            lastMessageAt: nowIso(),
          };

          await sendWhatsAppMessage(phase3Conversation, messageText);
          phase3Conversation.messageHistory.push({
            id: randomUUID(),
            direction: 'outbound',
            senderRole: 'system',
            content: messageText,
            language: 'en',
            timestamp: nowIso(),
          });

          store.conversations.push(phase3Conversation);
          escalated++;
        }
      }
    }

    // === AFTER 30 DAYS: Mark for permanent removal ===
    if (daysSinceCreation >= ESCALATION_RULES.permanentRemovalAfterDays && conversation.escalationLevel < 10) {
      conversation.escalationLevel = 10; // Mark as permanently removed
      conversation.state = 'completed';
      escalated++;
    }
  }

  if (escalated > 0) await writeConversationStore(store);
  return escalated;
}

/**
 * Send dormant outreach to property managers with no active vacancies.
 * Called weekly.
 */
export async function sendDormantOutreach(input: {
  userId: string;
  phone: string;
  name: string;
}): Promise<boolean> {
  if (isQuietHours()) return false;

  const store = await readConversationStore();
  const today = new Date().toISOString().split('T')[0];

  // Check if we already messaged this person recently
  const recentOutreach = store.conversations.find(
    (c) =>
      c.currentRecipientUserId === input.userId &&
      c.conversationType === 'weekly-dormant-outreach' &&
      c.createdAt.startsWith(today),
  );
  if (recentOutreach) return false;

  const greeting = getSmartGreeting('en');
  const template = VACANCY_CONFIRMATION_TEMPLATES.dormantOutreach.en(input.name);
  const messageText = `${greeting} ${input.name}\n\n${template}`;

  const conversation: WhatsAppVacancyConversation = {
    id: randomUUID(),
    propertyId: '',
    propertyCategory: 'houses',
    propertyName: '',
    unitIdentifiers: [],
    currentRecipientUserId: input.userId,
    currentRecipientRole: 'property-manager',
    currentRecipientPhone: input.phone,
    conversationType: 'weekly-dormant-outreach',
    state: 'dormant-outreach-sent',
    messageHistory: [],
    confirmedVacantUnits: [],
    confirmedOccupiedUnits: [],
    escalationLevel: 0,
    daysSinceLastResponse: 0,
    createdAt: nowIso(),
    lastMessageAt: nowIso(),
  };

  await sendWhatsAppMessage(conversation, messageText);
  conversation.messageHistory.push({
    id: randomUUID(),
    direction: 'outbound',
    senderRole: 'system',
    content: messageText,
    language: 'en',
    timestamp: nowIso(),
  });

  store.conversations.push(conversation);
  await writeConversationStore(store);
  return true;
}

/** Send a WhatsApp message */
async function sendWhatsAppMessage(
  conversation: WhatsAppVacancyConversation,
  message: string,
): Promise<void> {
  try {
    await queueImportantWhatsAppNotification({
      recipientUserId: conversation.currentRecipientUserId,
      recipientRole: conversation.currentRecipientRole === 'property-manager'
        ? 'property-manager'
        : 'property-owner',
      eventType: 'daily-vacancy-confirmation-reminder',
      destinationPhoneNumber: conversation.currentRecipientPhone,
      title: 'PataSpace Vacancy',
      shortDescription: message,
      idempotencyKey: randomUUID(),
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}

/**
 * NEW FLOW: Check for conversations that need escalation.
 * 
 * Step 2 (12h): Resend same link with insistence
 * Step 3 (24h): AI asks specific units via WhatsApp chat
 */
export async function checkAndEscalateToUnitDetail(): Promise<number> {
  const store = await readConversationStore();
  const now = Date.now();
  let escalated = 0;

  for (const conversation of store.conversations) {
    if (
      conversation.state === 'app-prompt-sent' &&
      conversation.currentRecipientPhone &&
      !isQuietHours()
    ) {
      const createdAt = new Date(conversation.createdAt).getTime();
      const hoursSince = (now - createdAt) / (60 * 60 * 1000);
      const appUrl = process.env.APP_URL || 'https://pataspace.freebuff.app';
      const quickVerifyUrl = `${appUrl}/quick-verify?propertyId=${encodeURIComponent(conversation.propertyId)}&name=${encodeURIComponent(conversation.propertyName)}`;

      // Step 2: After 12h — Resend link with insistence
      if (hoursSince >= ESCALATION_RULES.resendLinkAfterHours && hoursSince < ESCALATION_RULES.aiChatAfterHours && conversation.escalationLevel === 0) {
        const greeting = getSmartGreeting('en');
        const template = VACANCY_CONFIRMATION_TEMPLATES.insistentReminder.en(
          conversation.propertyName,
          conversation.unitIdentifiers.length,
          quickVerifyUrl,
        );
        const messageText = `${greeting}\n\n${template}`;

        await sendWhatsAppMessage(conversation, messageText);
        conversation.messageHistory.push({
          id: randomUUID(),
          direction: 'outbound',
          senderRole: 'system',
          content: messageText,
          language: 'en',
          timestamp: nowIso(),
        });

        conversation.escalationLevel = 1;
        conversation.lastMessageAt = nowIso();
        escalated++;
      }

      // Step 3: After 24h — AI asks specific units via WhatsApp chat
      if (hoursSince >= ESCALATION_RULES.aiChatAfterHours && conversation.escalationLevel <= 1) {
        const greeting = getSmartGreeting('en');
        const categoryLabel = conversation.propertyCategory === 'houses' ? 'residential' 
          : conversation.propertyCategory === 'shops' ? 'commercial' 
          : 'office';
        const template = VACANCY_CONFIRMATION_TEMPLATES.aiChatPrompt.en(
          conversation.propertyName,
          conversation.unitIdentifiers,
          categoryLabel,
        );
        const messageText = `${greeting}\n\n${template}`;

        await sendWhatsAppMessage(conversation, messageText);
        conversation.messageHistory.push({
          id: randomUUID(),
          direction: 'outbound',
          senderRole: 'system',
          content: messageText,
          language: 'en',
          timestamp: nowIso(),
        });

        conversation.state = 'awaiting-vacancy-response';
        conversation.escalationLevel = 2;
        conversation.lastMessageAt = nowIso();
        escalated++;
      }
    }
  }

  if (escalated > 0) await writeConversationStore(store);
  return escalated;
}
