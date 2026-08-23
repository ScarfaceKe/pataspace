import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { buildWhatsAppMessage, normaliseWhatsAppPhoneNumber, shouldSendWhatsAppNotification, type WhatsAppDeliveryRequest, type WhatsAppNotificationPreferences } from '@/domain/whatsapp-notifications';
import { query } from '@/server/database/client';

function whatsappConfig() {
  return {
    baseUrl: process.env.WHATSAPP_API_BASE_URL,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET
  };
}

function configured(): boolean {
  const config = whatsappConfig();
  return Boolean(config.baseUrl && config.accessToken && config.phoneNumberId);
}

export async function getWhatsAppPreferences(userId: string): Promise<WhatsAppNotificationPreferences | null> {
  const result = await query<{
    id: string;
    phone_number: string;
    whatsapp_phone_number: string | null;
    whatsapp_same_as_primary: boolean;
    in_app_notifications_enabled: boolean;
    whatsapp_notifications_enabled: boolean;
  }>(
    `select u.id, u.phone_number, p.whatsapp_phone_number, p.whatsapp_same_as_primary, p.in_app_notifications_enabled, p.whatsapp_notifications_enabled
       from users u join user_profiles p on p.user_id = u.id where u.id = $1 limit 1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    userId: row.id,
    primaryPhoneNumber: row.phone_number,
    whatsappSameAsPrimary: row.whatsapp_same_as_primary,
    whatsappPhoneNumber: row.whatsapp_phone_number ?? undefined,
    inAppNotificationsEnabled: row.in_app_notifications_enabled,
    whatsappNotificationsEnabled: row.whatsapp_notifications_enabled
  };
}

export async function updateWhatsAppPreferences(input: { userId: string; whatsappSameAsPrimary: boolean; whatsappPhoneNumber?: string; inAppNotificationsEnabled: boolean; whatsappNotificationsEnabled: boolean }): Promise<WhatsAppNotificationPreferences> {
  const normalised = input.whatsappSameAsPrimary ? null : normaliseWhatsAppPhoneNumber(input.whatsappPhoneNumber ?? '');
  if (!input.whatsappSameAsPrimary && !normalised) throw new Error('Enter a valid Kenyan WhatsApp number, for example 0712345678 or +254712345678.');
  await query(
    `update user_profiles set whatsapp_same_as_primary=$1, whatsapp_phone_number=$2, in_app_notifications_enabled=$3, whatsapp_notifications_enabled=$4, updated_at=now() where user_id=$5`,
    [input.whatsappSameAsPrimary, normalised ? `+${normalised}` : null, input.inAppNotificationsEnabled, input.whatsappNotificationsEnabled, input.userId]
  );
  const prefs = await getWhatsAppPreferences(input.userId);
  if (!prefs) throw new Error('Profile notification preferences were not found.');
  return prefs;
}

async function insertDelivery(input: WhatsAppDeliveryRequest, status: string, message: string, error?: string): Promise<string | null> {
  try {
    const result = await query<{ id: string }>(
      `insert into whatsapp_notification_deliveries (notification_id, recipient_user_id, recipient_role, event_type, destination_phone_number, message_body, status, idempotency_key, last_error)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
      [input.notificationId ?? null, input.recipientUserId, input.recipientRole, input.eventType, input.destinationPhoneNumber, message, status, input.idempotencyKey, error ?? null]
    );
    return result.rows[0].id;
  } catch (error: any) {
    if (String(error?.code) === '23505') return null;
    throw error;
  }
}

export async function queueImportantWhatsAppNotification(input: WhatsAppDeliveryRequest): Promise<{ queued: boolean; status: string }> {
  const prefs = await getWhatsAppPreferences(input.recipientUserId);
  if (!prefs || !shouldSendWhatsAppNotification(input.eventType, prefs)) return { queued: false, status: 'cancelled' };
  const destination = normaliseWhatsAppPhoneNumber(prefs.whatsappSameAsPrimary ? prefs.primaryPhoneNumber : prefs.whatsappPhoneNumber ?? input.destinationPhoneNumber);
  if (!destination) return { queued: false, status: 'failed' };
  const message = buildWhatsAppMessage(input);
  const deliveryId = await insertDelivery({ ...input, destinationPhoneNumber: destination }, configured() ? 'queued' : 'configuration-pending', message, configured() ? undefined : 'WhatsApp Business API credentials are not configured.');
  if (!deliveryId || !configured()) return { queued: Boolean(deliveryId), status: deliveryId ? 'configuration-pending' : 'duplicate' };
  return sendQueuedDelivery(deliveryId);
}

export async function sendQueuedDelivery(deliveryId: string): Promise<{ queued: boolean; status: string }> {
  const config = whatsappConfig();
  const result = await query<any>('select * from whatsapp_notification_deliveries where id=$1 limit 1', [deliveryId]);
  const delivery = result.rows[0];
  if (!delivery) return { queued: false, status: 'failed' };
  if (!configured()) return { queued: true, status: 'configuration-pending' };
  try {
    const response = await fetch(`${config.baseUrl}/v18.0/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: delivery.destination_phone_number, type: 'text', text: { preview_url: false, body: delivery.message_body } })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload.error?.message === 'string' ? payload.error.message : 'WhatsApp send failed.');
    const messageId = payload.messages?.[0]?.id;
    await query(`update whatsapp_notification_deliveries set status='sent', provider_message_id=$1, provider_payload=$2, attempt_count=attempt_count+1, last_attempt_at=now(), updated_at=now() where id=$3`, [messageId ?? null, payload, deliveryId]);
    return { queued: true, status: 'sent' };
  } catch (error) {
    const attempts = Number(delivery.attempt_count ?? 0) + 1;
    const retry = attempts < Number(delivery.max_attempts ?? 3);
    await query(`update whatsapp_notification_deliveries set status=$1, attempt_count=$2, last_attempt_at=now(), next_retry_at=$3, last_error=$4, updated_at=now() where id=$5`, [retry ? 'retry-scheduled' : 'failed', attempts, retry ? new Date(Date.now() + attempts * 5 * 60_000).toISOString() : null, error instanceof Error ? error.message : 'WhatsApp delivery failed.', deliveryId]);
    return { queued: true, status: retry ? 'retry-scheduled' : 'failed' };
  }
}

export async function processDueWhatsAppRetries(): Promise<number> {
  const result = await query<{ id: string }>(`select id from whatsapp_notification_deliveries where status='retry-scheduled' and next_retry_at <= now() order by next_retry_at asc limit 25`);
  for (const row of result.rows) await sendQueuedDelivery(row.id);
  return result.rows.length;
}

export function verifyWhatsAppWebhookSignature(rawBody: string, signatureHeader?: string | null): boolean | undefined {
  if (!signatureHeader) return undefined;
  const secret = whatsappConfig().appSecret;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  const expectedBuffer = Buffer.from(expected, 'hex');
  const providedBuffer = Buffer.from(provided, 'hex');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function processWhatsAppWebhook(rawBody: string, signatureHeader?: string | null): Promise<{ ok: true; status: string }> {
  const signatureValid = verifyWhatsAppWebhookSignature(rawBody, signatureHeader);
  const payloadHash = createHash('sha256').update(rawBody).digest('hex');
  const payload = JSON.parse(rawBody || '{}');
  try {
    await query(`insert into whatsapp_webhook_events (payload_hash, signature_valid, raw_payload, processing_status) values ($1,$2,$3,'received')`, [payloadHash, signatureValid ?? null, payload]);
  } catch (error: any) {
    if (String(error?.code) === '23505') return { ok: true, status: 'duplicate' };
    throw error;
  }
  if (signatureValid === false) {
    await query(`update whatsapp_webhook_events set processing_status='failed', processing_error='Invalid webhook signature', processed_at=now() where payload_hash=$1`, [payloadHash]);
    return { ok: true, status: 'failed' };
  }
  const statuses = payload.entry?.flatMap((entry: any) => entry.changes ?? [])?.flatMap((change: any) => change.value?.statuses ?? []) ?? [];
  for (const status of statuses) {
    if (status.id && status.status) await query(`update whatsapp_notification_deliveries set status=$1, provider_payload=$2, updated_at=now() where provider_message_id=$3`, [status.status, status, status.id]);
  }
  await query(`update whatsapp_webhook_events set processing_status='processed', processed_at=now() where payload_hash=$1`, [payloadHash]);
  return { ok: true, status: 'processed' };
}

export function verifyWebhookChallenge(input: { mode?: string | null; token?: string | null; challenge?: string | null }): string | null {
  if (input.mode === 'subscribe' && input.token && input.token === whatsappConfig().webhookVerifyToken) return input.challenge ?? '';
  return null;
}
