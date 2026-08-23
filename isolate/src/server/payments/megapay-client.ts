import { createHmac, timingSafeEqual } from 'node:crypto';

const MEGAPAY_PRODUCTION_BASE_URL = 'https://api.megapay.co.ke';

export interface MegaPayInitiateRequest {
  transactionReference: string;
  amount: number;
  currency: 'KES';
  phoneNumber: string;
  description: string;
}

export interface MegaPayInitiateResponse {
  checkoutRequestId?: string;
  merchantRequestId?: string;
  providerPaymentId?: string;
  providerStatus?: string;
  raw: Record<string, unknown>;
}

export interface MegaPayVerifyResponse {
  status: 'pending' | 'successful' | 'failed' | 'cancelled' | 'expired' | 'incomplete';
  receiptNumber?: string;
  providerTransactionId?: string;
  providerStatus?: string;
  raw: Record<string, unknown>;
}

function requireMegaPayConfig(): { consumerKey: string; consumerSecret: string; shortcode: string; passkey: string; callbackUrl: string } {
  const consumerKey = process.env.MEGAPAY_CONSUMER_KEY;
  const consumerSecret = process.env.MEGAPAY_CONSUMER_SECRET;
  const shortcode = process.env.MEGAPAY_SHORTCODE;
  const passkey = process.env.MEGAPAY_PASSKEY;
  const callbackUrl = process.env.MEGAPAY_CALLBACK_URL;
  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
    throw new Error('MegaPay credentials are not configured. Set MEGAPAY_CONSUMER_KEY, MEGAPAY_CONSUMER_SECRET, MEGAPAY_SHORTCODE, MEGAPAY_PASSKEY, and MEGAPAY_CALLBACK_URL.');
  }
  return { consumerKey, consumerSecret, shortcode, passkey, callbackUrl };
}

async function megapayFetch(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const config = requireMegaPayConfig();
  const basicCredential = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const response = await fetch(new URL(path, MEGAPAY_PRODUCTION_BASE_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicCredential}`,
      'X-MegaPay-Shortcode': config.shortcode
    },
    body: JSON.stringify({ ...body, shortcode: config.shortcode, passkey: config.passkey })
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof payload.message === 'string' ? payload.message : `MegaPay request failed with status ${response.status}`);
  }
  return payload;
}

function firstString(payload: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

export async function initiateMegaPayStkPush(input: MegaPayInitiateRequest): Promise<MegaPayInitiateResponse> {
  const config = requireMegaPayConfig();
  const raw = await megapayFetch('/stkpush/initiate', {
    transactionReference: input.transactionReference,
    amount: input.amount,
    currency: input.currency,
    phoneNumber: input.phoneNumber,
    description: input.description,
    callbackUrl: config.callbackUrl
  });
  return {
    checkoutRequestId: firstString(raw, ['checkoutRequestId', 'CheckoutRequestID', 'checkout_request_id']),
    merchantRequestId: firstString(raw, ['merchantRequestId', 'MerchantRequestID', 'merchant_request_id']),
    providerPaymentId: firstString(raw, ['paymentId', 'providerPaymentId', 'provider_payment_id']),
    providerStatus: firstString(raw, ['status', 'ResponseCode', 'responseCode']),
    raw
  };
}

export async function verifyMegaPayPayment(input: { checkoutRequestId?: string; transactionReference: string }): Promise<MegaPayVerifyResponse> {
  const raw = await megapayFetch('/stkpush/verify', {
    checkoutRequestId: input.checkoutRequestId,
    transactionReference: input.transactionReference
  });
  const statusText = String(firstString(raw, ['status', 'paymentStatus', 'ResultCode', 'resultCode']) ?? 'pending').toLowerCase();
  const status = statusText === '0' || statusText === 'success' || statusText === 'successful' || statusText === 'completed'
    ? 'successful'
    : statusText.includes('fail')
      ? 'failed'
      : statusText.includes('cancel')
        ? 'cancelled'
        : statusText.includes('expire') || statusText.includes('timeout')
          ? 'expired'
          : 'pending';
  return {
    status,
    receiptNumber: firstString(raw, ['receiptNumber', 'mpesaReceiptNumber', 'MpesaReceiptNumber']),
    providerTransactionId: firstString(raw, ['transactionId', 'providerTransactionId', 'MpesaReceiptNumber', 'mpesaReceiptNumber']),
    providerStatus: firstString(raw, ['status', 'paymentStatus', 'ResultDesc', 'resultDesc']),
    raw
  };
}

export function verifyMegaPaySignature(rawBody: string, signatureHeader?: string | null): boolean | undefined {
  if (!signatureHeader) return undefined;
  const secret = process.env.MEGAPAY_CONSUMER_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  const expectedBuffer = Buffer.from(expected, 'hex');
  const providedBuffer = Buffer.from(provided, 'hex');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}
