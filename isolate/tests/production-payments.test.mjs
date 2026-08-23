import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/payments.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/payments/service.ts', import.meta.url), 'utf8');
const client = readFileSync(new URL('../src/server/payments/megapay-client.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/0005_megapay_payment_infrastructure.sql', import.meta.url), 'utf8');
const callbackRoute = readFileSync(new URL('../app/api/payments/megapay/callback/route.ts', import.meta.url), 'utf8');
const stkRoute = readFileSync(new URL('../app/api/payments/megapay/stk-push/route.ts', import.meta.url), 'utf8');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');

for (const envName of ['MEGAPAY_CONSUMER_KEY', 'MEGAPAY_CONSUMER_SECRET', 'MEGAPAY_SHORTCODE', 'MEGAPAY_PASSKEY', 'MEGAPAY_CALLBACK_URL', 'APP_URL']) {
  assert.ok(envExample.includes(`${envName}=`), `Missing env var ${envName}`);
}

assert.ok(domain.includes('normaliseMpesaPhoneNumber'), 'M-Pesa phone validation must exist');

assert.ok(domain.includes('/^254[17]\\d{8}$/'), 'M-Pesa normalisation must accept 2547XXXXXXXX and 2541XXXXXXXX');
assert.ok(domain.includes('/^\\+254[17]\\d{8}$/'), 'M-Pesa normalisation must accept +2547XXXXXXXX and +2541XXXXXXXX');
assert.ok(domain.includes('/^0[17]\\d{8}$/'), 'M-Pesa normalisation must accept 07XXXXXXXX and 01XXXXXXXX');
assert.ok(domain.includes('return `254${compact.slice(1)}`'), 'M-Pesa normalisation must convert 07/01 numbers to 254 format');
assert.ok(domain.includes('validatePaymentInitiationInput'), 'Payment initiation validation must exist');
assert.ok(client.includes('process.env.MEGAPAY_CONSUMER_KEY') && client.includes('process.env.MEGAPAY_CONSUMER_SECRET') && client.includes('process.env.MEGAPAY_SHORTCODE') && client.includes('process.env.MEGAPAY_PASSKEY'), 'MegaPay credentials must be read from approved environment variables');
for (const removed of ['MEGAPAY_BASE_URL=', 'MEGAPAY_API_KEY=', 'MEGAPAY_API_SECRET=', 'MEGAPAY_MERCHANT_ID=']) assert.ok(!envExample.includes(removed), `Removed MegaPay env var must not be required: ${removed}`);
assert.ok(!client.includes('SUPABASE_DATABASE_URL'), 'Payment code must not contain database connection secrets');
assert.ok(client.includes('createHmac') && client.includes('verifyMegaPaySignature'), 'Callback signature verification must be prepared');
for (const table of ['payment_transactions', 'payment_callbacks', 'refund_requests', 'payment_audit_logs']) {
  assert.ok(migration.includes(`create table if not exists ${table}`), `Missing payment table ${table}`);
}
for (const column of ['idempotency_key', 'checkout_request_id', 'provider_payment_id', 'purchase_payload', 'callback_attempts']) {
  assert.ok(migration.includes(column), `Missing payments column/index ${column}`);
}
for (const feature of ['grantUnlockAfterSuccessfulPayment', 'activateVerifiedAccessAfterSuccessfulPayment', 'createReceipt', 'processMegaPayCallback', 'verifyPaymentServerSide']) {
  assert.ok(service.includes(feature), `Payment service missing ${feature}`);
}
assert.ok(service.includes('idempotency_key'), 'Payment service must use idempotency keys');
assert.ok(service.includes('payment_audit_logs'), 'Payment service must write audit logs');
assert.ok(callbackRoute.includes('request.text()'), 'Callback route must process raw body for signature validation');
assert.ok(stkRoute.includes('requireApiUser'), 'STK Push endpoint must require authenticated user');
console.log('PataSpace production payment infrastructure checks passed.');
