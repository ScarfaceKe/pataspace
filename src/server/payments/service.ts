import { createHash, randomUUID } from 'node:crypto';
import type { AccessPurchaseType, UnlockTarget } from '@/domain/unlock';
import { validatePaymentInitiationInput, normaliseMpesaPhoneNumber, type MegaPayStkPushInput, type PaymentRecordSummary } from '@/domain/payments';
import type { VerifiedAccessScope } from '@/domain/verified-access';
import { transaction, query } from '@/server/database/client';
import { grantUnlockAfterSuccessfulPayment } from '@/server/unlock/service';
import { activateVerifiedAccessAfterSuccessfulPayment } from '@/server/verified-access/service';
import { initiateMegaPayStkPush, verifyMegaPayPayment, verifyMegaPaySignature } from './megapay-client';

const PAYMENT_EXPIRY_MINUTES = 10;
const PROVIDER = 'megapay-mpesa';

function nowIso(): string {
  return new Date().toISOString();
}

function paymentReference(): string {
  return `PS-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function hashPayload(rawBody: string): string {
  return createHash('sha256').update(rawBody).digest('hex');
}

function normaliseIpAddress(value?: string | null): string | null {
  if (!value) return null;
  return value.split(',')[0]?.trim() || null;
}

function toSummary(row: any): PaymentRecordSummary {
  return {
    id: row.id,
    transactionReference: row.transaction_reference,
    provider: PROVIDER,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    checkoutRequestId: row.checkout_request_id ?? undefined,
    merchantRequestId: row.merchant_request_id ?? undefined,
    receiptNumber: row.receipt_number ?? undefined
  };
}

async function audit(input: { paymentId?: string; eventType: string; severity?: 'info' | 'warning' | 'critical'; summary?: string; metadata?: Record<string, unknown>; actorUserId?: string; ipAddress?: string | null; userAgent?: string | null }): Promise<void> {
  await query(
    `insert into payment_audit_logs (payment_id, actor_user_id, event_type, severity, summary, metadata, ip_address, user_agent)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [input.paymentId ?? null, input.actorUserId ?? null, input.eventType, input.severity ?? 'info', input.summary ?? null, input.metadata ?? {}, normaliseIpAddress(input.ipAddress), input.userAgent ?? null]
  );
}

export async function enforcePaymentRateLimit(customerId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await query<{ count: string }>(
    `select count(*)::text from payments where customer_id = $1 and created_at > now() - interval '5 minutes'`,
    [customerId]
  );
  if (Number(result.rows[0]?.count ?? 0) >= 8) {
    await audit({ eventType: 'payment.rate-limited', severity: 'warning', actorUserId: customerId, summary: 'Too many payment attempts.' });
    return { ok: false, message: 'Too many payment attempts. Please wait a few minutes and try again.' };
  }
  return { ok: true };
}

export async function initiateStkPushPayment(input: MegaPayStkPushInput, context?: { ipAddress?: string | null; userAgent?: string | null }): Promise<
  | { ok: true; payment: PaymentRecordSummary; message: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  const validation = validatePaymentInitiationInput(input);
  if (!validation.valid) return { ok: false, status: 400, message: 'Please check the payment details and try again.', fieldErrors: validation.errors };
  const phoneNumber = normaliseMpesaPhoneNumber(input.phoneNumber)!;
  const rateLimit = await enforcePaymentRateLimit(input.customerId);
  if (!rateLimit.ok) return { ok: false, status: 429, message: rateLimit.message };

  const existing = await query(`select * from payments where idempotency_key = $1 limit 1`, [input.idempotencyKey]);
  if (existing.rows[0]) return { ok: true, payment: toSummary(existing.rows[0]), message: 'Existing payment request returned safely.' };

  const reference = paymentReference();
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const purchasePayload = { purchaseType: input.purchaseType, target: input.target, scope: input.scope };

  const payment = await transaction(async (client) => {
    const result = await client.query(
      `insert into payments (customer_id, purchase_type, property_id, unit_identifier, property_category, amount, currency, status, transaction_reference, provider, phone_number, idempotency_key, purchase_payload, expires_at)
       values ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10,$11,$12,$13)
       returning *`,
      [
        input.customerId,
        input.purchaseType,
        input.target?.propertyId ?? null,
        input.target?.unitIdentifier ?? null,
        input.target?.propertyCategory ?? input.scope?.propertyCategory ?? null,
        input.price.amount,
        input.price.currency,
        reference,
        PROVIDER,
        phoneNumber,
        input.idempotencyKey,
        purchasePayload,
        expiresAt
      ]
    );
    await client.query(
      `insert into payment_transactions (payment_id, transaction_reference, amount, currency, phone_number, status, provider_status)
       values ($1,$2,$3,$4,$5,'initiated','local-created')`,
      [result.rows[0].id, reference, input.price.amount, input.price.currency, phoneNumber]
    );
    return result.rows[0];
  });

  await audit({ paymentId: payment.id, eventType: 'payment.stk-push.created', actorUserId: input.customerId, summary: 'Payment request created.', ipAddress: context?.ipAddress, userAgent: context?.userAgent });

  try {
    const provider = await initiateMegaPayStkPush({
      transactionReference: reference,
      amount: input.price.amount,
      currency: input.price.currency,
      phoneNumber,
      description: input.purchaseType === 'unlock-this-listing' ? 'PataSpace Unlock This Listing' : 'PataSpace Verified Access'
    });
    const updated = await query(
      `update payments set checkout_request_id=$1, merchant_request_id=$2, provider_payment_id=$3, provider_status=$4, provider_payload=$5, updated_at=now()
       where id=$6 returning *`,
      [provider.checkoutRequestId ?? null, provider.merchantRequestId ?? null, provider.providerPaymentId ?? null, provider.providerStatus ?? null, provider.raw, payment.id]
    );
    await query(
      `insert into payment_transactions (payment_id, transaction_reference, amount, currency, phone_number, status, checkout_request_id, merchant_request_id, provider_status, provider_payload)
       values ($1,$2,$3,$4,$5,'pending',$6,$7,$8,$9)`,
      [payment.id, reference, input.price.amount, input.price.currency, phoneNumber, provider.checkoutRequestId ?? null, provider.merchantRequestId ?? null, provider.providerStatus ?? null, provider.raw]
    );
    await audit({ paymentId: payment.id, eventType: 'payment.stk-push.sent', actorUserId: input.customerId, summary: 'MegaPay STK Push sent.', metadata: { checkoutRequestId: provider.checkoutRequestId } });
    return { ok: true, payment: toSummary(updated.rows[0]), message: 'M-Pesa STK Push has been sent to the customer phone.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MegaPay initiation failed.';
    await query(`update payments set status='incomplete', failure_reason=$1, updated_at=now() where id=$2`, [message, payment.id]);
    await audit({ paymentId: payment.id, eventType: 'payment.stk-push.failed', severity: 'warning', actorUserId: input.customerId, summary: message });
    return { ok: false, status: 503, message: 'Payment provider is not ready. Please try again after payment credentials are configured.' };
  }
}

function extractCallbackValue(payload: any, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === 'string' && value) return value;
    if (typeof value === 'number') return String(value);
  }
  const stk = payload?.Body?.stkCallback;
  for (const key of keys) {
    const value = stk?.[key];
    if (typeof value === 'string' && value) return value;
    if (typeof value === 'number') return String(value);
  }
  const items = stk?.CallbackMetadata?.Item;
  if (Array.isArray(items)) {
    for (const key of keys) {
      const found = items.find((item) => item?.Name === key || item?.name === key);
      if (found?.Value !== undefined) return String(found.Value);
    }
  }
  return undefined;
}

function callbackSucceeded(payload: any): boolean {
  const resultCode = extractCallbackValue(payload, ['ResultCode', 'resultCode', 'code']);
  const status = extractCallbackValue(payload, ['status', 'paymentStatus']);
  if (resultCode !== undefined) return resultCode === '0';
  return Boolean(status && ['success', 'successful', 'completed'].includes(status.toLowerCase()));
}

async function grantPurchasedAccess(payment: any): Promise<void> {
  const payload = payment.purchase_payload as { purchaseType: AccessPurchaseType; target?: UnlockTarget; scope?: VerifiedAccessScope };
  if (payload.purchaseType === 'unlock-this-listing' && payload.target) {
    await grantUnlockAfterSuccessfulPayment({ customerId: payment.customer_id, target: payload.target, paymentReference: payment.transaction_reference });
  }
  if (payload.purchaseType === 'verified-access' && payload.scope) {
    await activateVerifiedAccessAfterSuccessfulPayment({ customerId: payment.customer_id, scope: payload.scope, paymentReference: payment.transaction_reference });
  }
}

async function createReceipt(payment: any, receiptNumber?: string, providerPayload: Record<string, unknown> = {}): Promise<void> {
  await query(
    `insert into receipts (payment_id, customer_id, transaction_reference, receipt_number, amount, currency, receipt_data, storage_key, downloadable)
     values ($1,$2,$3,$4,$5,$6,$7,$8,true)
     on conflict do nothing`,
    [payment.id, payment.customer_id, payment.transaction_reference, receiptNumber ?? payment.receipt_number ?? payment.transaction_reference, payment.amount, payment.currency, { provider: PROVIDER, providerPayload }, `receipts/${payment.transaction_reference}.json`]
  );
}

export async function processMegaPayCallback(rawBody: string, headers: Headers): Promise<{ ok: true; status: 'processed' | 'duplicate' | 'ignored'; paymentId?: string }> {
  const signature = headers.get('x-megapay-signature') ?? headers.get('x-mpesa-signature');
  const signatureValid = verifyMegaPaySignature(rawBody, signature);
  const payload = JSON.parse(rawBody || '{}');
  const payloadHash = hashPayload(rawBody);
  const checkoutRequestId = extractCallbackValue(payload, ['CheckoutRequestID', 'checkoutRequestId', 'checkout_request_id']);
  const merchantRequestId = extractCallbackValue(payload, ['MerchantRequestID', 'merchantRequestId', 'merchant_request_id']);
  const receiptNumber = extractCallbackValue(payload, ['MpesaReceiptNumber', 'mpesaReceiptNumber', 'receiptNumber']);
  const amountText = extractCallbackValue(payload, ['Amount', 'amount']);
  const providerTransactionId = receiptNumber ?? extractCallbackValue(payload, ['TransactionId', 'transactionId']);

  let callbackId: string | undefined;
  try {
    const callback = await query(
      `insert into payment_callbacks (provider, callback_reference, checkout_request_id, merchant_request_id, signature_header, signature_valid, payload_hash, raw_payload, processing_status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'received') returning id`,
      [PROVIDER, receiptNumber ?? checkoutRequestId ?? merchantRequestId ?? null, checkoutRequestId ?? null, merchantRequestId ?? null, signature ?? null, signatureValid ?? null, payloadHash, payload]
    );
    callbackId = callback.rows[0].id;
  } catch (error: any) {
    if (String(error?.code) === '23505') return { ok: true, status: 'duplicate' };
    throw error;
  }

  if (signatureValid === false) {
    await query(`update payment_callbacks set processing_status='failed', processing_error='Invalid callback signature', processed_at=now() where id=$1`, [callbackId]);
    await audit({ eventType: 'payment.callback.invalid-signature', severity: 'critical', summary: 'MegaPay callback signature validation failed.', metadata: { checkoutRequestId } });
    return { ok: true, status: 'ignored' };
  }

  const paymentResult = await query(`select * from payments where checkout_request_id = $1 or merchant_request_id = $2 or receipt_number = $3 order by created_at desc limit 1`, [checkoutRequestId ?? null, merchantRequestId ?? null, receiptNumber ?? null]);
  const payment = paymentResult.rows[0];
  if (!payment) {
    await query(`update payment_callbacks set processing_status='ignored', processing_error='No matching payment', processed_at=now() where id=$1`, [callbackId]);
    await audit({ eventType: 'payment.callback.unmatched', severity: 'warning', summary: 'MegaPay callback had no matching payment.', metadata: { checkoutRequestId, merchantRequestId, receiptNumber } });
    return { ok: true, status: 'ignored' };
  }

  if (payment.status === 'successful') {
    await query(`update payment_callbacks set payment_id=$1, processing_status='duplicate', processed_at=now() where id=$2`, [payment.id, callbackId]);
    return { ok: true, status: 'duplicate', paymentId: payment.id };
  }

  const success = callbackSucceeded(payload);
  const nextStatus = success ? 'successful' : 'failed';
  const failureReason = success ? null : extractCallbackValue(payload, ['ResultDesc', 'resultDesc', 'message']) ?? 'Payment failed or was cancelled.';

  const updatedResult = await query(
    `update payments
       set status=$1, receipt_number=coalesce($2, receipt_number), provider_payment_id=coalesce($3, provider_payment_id), provider_status=$4,
           provider_payload=$5, failure_reason=$6, confirmed_at=case when $1='successful' then now() else confirmed_at end,
           callback_attempts=callback_attempts+1, callback_last_received_at=now(), updated_at=now()
     where id=$7 returning *`,
    [nextStatus, receiptNumber ?? null, providerTransactionId ?? null, extractCallbackValue(payload, ['ResultDesc', 'resultDesc', 'status']) ?? null, payload, failureReason, payment.id]
  );
  const updated = updatedResult.rows[0];
  await query(
    `insert into payment_transactions (payment_id, transaction_reference, provider_transaction_id, checkout_request_id, merchant_request_id, amount, currency, phone_number, status, provider_status, provider_payload)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     on conflict do nothing`,
    [updated.id, updated.transaction_reference, providerTransactionId ?? null, checkoutRequestId ?? null, merchantRequestId ?? null, amountText ? Number(amountText) : Number(updated.amount), updated.currency, updated.phone_number, nextStatus, updated.provider_status, payload]
  );
  await query(`update payment_callbacks set payment_id=$1, processing_status='processed', processed_at=now() where id=$2`, [updated.id, callbackId]);

  if (success) {
    await createReceipt(updated, receiptNumber, payload);
    await grantPurchasedAccess(updated);
  }
  await audit({ paymentId: updated.id, eventType: success ? 'payment.confirmed' : 'payment.failed', severity: success ? 'info' : 'warning', summary: success ? 'Payment confirmed by MegaPay callback.' : failureReason ?? 'Payment failed.', metadata: { checkoutRequestId, receiptNumber } });
  return { ok: true, status: 'processed', paymentId: updated.id };
}

export async function verifyPaymentServerSide(input: { paymentId?: string; transactionReference?: string }): Promise<{ ok: true; payment: PaymentRecordSummary } | { ok: false; status: number; message: string }> {
  const result = await query(`select * from payments where id::text = $1 or transaction_reference = $2 limit 1`, [input.paymentId ?? '', input.transactionReference ?? '']);
  const payment = result.rows[0];
  if (!payment) return { ok: false, status: 404, message: 'Payment was not found.' };
  if (payment.status === 'successful') return { ok: true, payment: toSummary(payment) };
  if (payment.expires_at && new Date(payment.expires_at).getTime() < Date.now() && payment.status === 'pending') {
    const expired = await query(`update payments set status='expired', failure_reason='Payment timed out before confirmation.', updated_at=now() where id=$1 returning *`, [payment.id]);
    await audit({ paymentId: payment.id, eventType: 'payment.timeout', severity: 'warning', summary: 'Payment timed out before confirmation.' });
    return { ok: true, payment: toSummary(expired.rows[0]) };
  }
  try {
    const provider = await verifyMegaPayPayment({ checkoutRequestId: payment.checkout_request_id, transactionReference: payment.transaction_reference });
    if (provider.status === 'successful') {
      const updated = await query(
        `update payments set status='successful', receipt_number=coalesce($1, receipt_number), provider_payment_id=coalesce($2, provider_payment_id), provider_status=$3, provider_payload=$4, confirmed_at=now(), updated_at=now() where id=$5 returning *`,
        [provider.receiptNumber ?? null, provider.providerTransactionId ?? null, provider.providerStatus ?? null, provider.raw, payment.id]
      );
      await createReceipt(updated.rows[0], provider.receiptNumber, provider.raw);
      await grantPurchasedAccess(updated.rows[0]);
      await audit({ paymentId: payment.id, eventType: 'payment.verified-successful', summary: 'Payment verified successfully with MegaPay.' });
      return { ok: true, payment: toSummary(updated.rows[0]) };
    }
    if (provider.status !== 'pending') {
      const updated = await query(`update payments set status=$1, provider_status=$2, provider_payload=$3, failure_reason=$4, updated_at=now() where id=$5 returning *`, [provider.status, provider.providerStatus ?? null, provider.raw, provider.providerStatus ?? 'Provider returned non-success status.', payment.id]);
      await audit({ paymentId: payment.id, eventType: 'payment.verified-not-successful', severity: 'warning', summary: `Payment verified as ${provider.status}.` });
      return { ok: true, payment: toSummary(updated.rows[0]) };
    }
    return { ok: true, payment: toSummary(payment) };
  } catch {
    return { ok: false, status: 503, message: 'Payment verification is unavailable until MegaPay credentials are configured.' };
  }
}

export async function getReceipt(paymentId: string, customerId: string): Promise<{ ok: true; receipt: Record<string, unknown> } | { ok: false; status: number; message: string }> {
  const result = await query(
    `select r.*, p.status from receipts r join payments p on p.id = r.payment_id where r.payment_id::text = $1 and r.customer_id::text = $2 limit 1`,
    [paymentId, customerId]
  );
  const receipt = result.rows[0];
  if (!receipt) return { ok: false, status: 404, message: 'Receipt was not found.' };
  return { ok: true, receipt };
}

export async function createRefundRequestDraft(input: { paymentId: string; customerId: string; reason: string }): Promise<{ ok: true; refundRequestId: string } | { ok: false; status: number; message: string }> {
  const paymentResult = await query(`select * from payments where id::text=$1 and customer_id::text=$2 and status='successful' limit 1`, [input.paymentId, input.customerId]);
  const payment = paymentResult.rows[0];
  if (!payment) return { ok: false, status: 404, message: 'Successful payment was not found.' };
  const refund = await query(
    `insert into refund_requests (payment_id, customer_id, amount, currency, reason, status, requested_by)
     values ($1,$2,$3,$4,$5,'draft',$2) returning id`,
    [payment.id, payment.customer_id, payment.amount, payment.currency, input.reason]
  );
  await audit({ paymentId: payment.id, eventType: 'refund.draft-created', actorUserId: payment.customer_id, summary: 'Refund request draft created.' });
  return { ok: true, refundRequestId: refund.rows[0].id };
}
