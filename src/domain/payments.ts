import type { AccessPurchaseType, PriceAmount, UnlockTarget } from './unlock';
import type { VerifiedAccessScope } from './verified-access';

export type PaymentProvider = 'megapay-mpesa';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled' | 'expired' | 'incomplete';
export type TransactionStatus = 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled' | 'expired' | 'reversed' | 'duplicate';

export interface PaymentPurchasePayload {
  purchaseType: AccessPurchaseType;
  target?: UnlockTarget;
  scope?: VerifiedAccessScope;
}

export interface MegaPayStkPushInput {
  customerId: string;
  purchaseType: AccessPurchaseType;
  price: PriceAmount;
  phoneNumber: string;
  idempotencyKey: string;
  target?: UnlockTarget;
  scope?: VerifiedAccessScope;
}

export interface PaymentRecordSummary {
  id: string;
  transactionReference: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: 'KES';
  checkoutRequestId?: string;
  merchantRequestId?: string;
  receiptNumber?: string;
}

export function normaliseMpesaPhoneNumber(phoneNumber: string): string | null {
  const compact = phoneNumber.replace(/[\s()-]/g, '');
  if (/^254[17]\d{8}$/.test(compact)) return compact;
  if (/^\+254[17]\d{8}$/.test(compact)) return compact.slice(1);
  if (/^0[17]\d{8}$/.test(compact)) return `254${compact.slice(1)}`;
  return null;
}

export function validatePaymentInitiationInput(input: MegaPayStkPushInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.customerId) errors.customerId = 'Customer is required.';
  if (!['unlock-this-listing', 'verified-access'].includes(input.purchaseType)) errors.purchaseType = 'Choose a valid payment purpose.';
  if (!input.price || input.price.currency !== 'KES' || input.price.amount <= 0) errors.amount = 'A valid KES amount is required.';
  if (!normaliseMpesaPhoneNumber(input.phoneNumber)) errors.phoneNumber = 'Enter a valid Safaricom M-Pesa phone number, for example 0712345678.';
  if (!input.idempotencyKey || input.idempotencyKey.length < 8) errors.idempotencyKey = 'A valid idempotency key is required.';
  if (input.purchaseType === 'unlock-this-listing' && !input.target) errors.target = 'Selected property or unit is required.';
  if (input.purchaseType === 'verified-access' && !input.scope) errors.scope = 'Verified Access scope is required.';
  return { valid: Object.keys(errors).length === 0, errors };
}
