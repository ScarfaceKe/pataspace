import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const megaPayClient = readFileSync(new URL('../src/server/payments/megapay-client.ts', import.meta.url), 'utf8');
const authRequestSecurity = readFileSync(new URL('../src/server/auth/request-security.ts', import.meta.url), 'utf8');

assert.ok(proxy.includes('enforceWafRules'), 'Proxy must include WAF-style request filtering');
assert.ok(proxy.includes('enforceRateLimit'), 'Proxy must include production endpoint rate limiting');
assert.ok(proxy.includes('enforceCsrf'), 'Proxy must enforce CSRF origin checks for state-changing API requests');
for (const route of ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/viewings/request', '/api/payments/']) {
  assert.ok(proxy.includes(route), `Rate limiting missing for ${route}`);
}
for (const header of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options']) {
  assert.ok(proxy.includes(header), `Security header missing: ${header}`);
}
assert.ok(authRequestSecurity.includes('rejectInvalidOrigin'), 'Route-level CSRF helper must remain available');

for (const envName of ['MEGAPAY_CONSUMER_KEY', 'MEGAPAY_CONSUMER_SECRET', 'MEGAPAY_SHORTCODE', 'MEGAPAY_PASSKEY', 'MEGAPAY_CALLBACK_URL', 'APP_URL']) {
  assert.ok(envExample.includes(`${envName}=`), `Missing approved production env var ${envName}`);
  assert.ok(megaPayClient.includes(`process.env.${envName}`) || envName === 'APP_URL', `MegaPay client must read ${envName} from environment variables where applicable`);
}
for (const removed of ['MEGAPAY_BASE_URL=', 'MEGAPAY_API_KEY=', 'MEGAPAY_API_SECRET=', 'MEGAPAY_MERCHANT_ID=', 'STRIPE_', 'PAYPAL_', 'FLUTTERWAVE_', 'PESAPAL_']) {
  assert.ok(!envExample.includes(removed), `Unapproved production payment env/config found: ${removed}`);
}

const ignored = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.cache']);
const forbiddenSecretPatterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /postgresql:\/\/postgres\.cqjoxdtcysinvsbvhsgj:[^<][^@\s]+@/,
  /MEGAPAY_(CONSUMER_KEY|CONSUMER_SECRET|SHORTCODE|PASSKEY)=\S+/
];
const findings = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (/\.(ts|tsx|js|jsx|mjs|json|md|css|example)$/.test(path) || path.endsWith('.env.local')) {
      const text = readFileSync(path, 'utf8');
      for (const pattern of forbiddenSecretPatterns) {
        if (pattern.test(text)) findings.push(`${path}: ${pattern}`);
      }
    }
  }
}
walk(new URL('..', import.meta.url).pathname);
assert.deepEqual(findings, [], `Hardcoded secret findings: ${findings.join(', ')}`);
console.log('PataSpace production security hardening checks passed.');
