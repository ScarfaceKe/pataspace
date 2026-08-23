import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/0007_whatsapp_notification_infrastructure.sql', import.meta.url), 'utf8');
const domain = readFileSync(new URL('../src/domain/whatsapp-notifications.ts', import.meta.url), 'utf8');
const notificationDomain = readFileSync(new URL('../src/domain/notifications.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/whatsapp/service.ts', import.meta.url), 'utf8');
const notificationService = readFileSync(new URL('../src/server/notifications/service.ts', import.meta.url), 'utf8');
const webhookRoute = readFileSync(new URL('../app/api/whatsapp/webhook/route.ts', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../src/components/profile/ProfileNotificationSettings.tsx', import.meta.url), 'utf8');
const settingsRoute = readFileSync(new URL('../app/api/profile/notification-settings/route.ts', import.meta.url), 'utf8');

for (const key of ['WHATSAPP_API_BASE_URL','WHATSAPP_ACCESS_TOKEN','WHATSAPP_PHONE_NUMBER_ID','WHATSAPP_BUSINESS_ACCOUNT_ID','WHATSAPP_WEBHOOK_VERIFY_TOKEN','WHATSAPP_APP_SECRET','APP_URL']) {
  assert.ok(envExample.includes(`${key}=`), `Missing WhatsApp env var ${key}`);
}
assert.ok(migration.includes('whatsapp_phone_number') && migration.includes('whatsapp_same_as_primary'), 'User profiles must store WhatsApp number preferences');
for (const table of ['whatsapp_notification_deliveries','whatsapp_webhook_events']) assert.ok(migration.includes(`create table if not exists ${table}`), `Missing ${table}`);
for (const event of ['viewing-booking-confirmed','viewing-24-hour-reminder','viewing-1-hour-reminder','viewing-cancelled','viewing-request-submitted','property-successfully-rented','daily-vacancy-verification-reminder','urgent-viewing-reminder','missed-viewing-alert','customer-arrived','high-priority-security-alert','system-outage','failed-payment-system','daily-vacancy-verification-failure','critical-platform-error']) assert.ok(notificationDomain.includes(`'${event}'`), `Important WhatsApp event missing ${event}`);
for (const blocked of ['payment-confirmation','welcome-message','new-recommendation','revenue-report']) assert.ok(notificationDomain.includes(`'${blocked}'`), `Routine exclusion missing ${blocked}`);
assert.ok(domain.includes('normaliseWhatsAppPhoneNumber') && domain.includes('/^0[17]\\d{8}$/'), 'WhatsApp phone normalization must accept Kenyan formats');
assert.ok(service.includes('WHATSAPP_ACCESS_TOKEN') && service.includes('WHATSAPP_APP_SECRET'), 'WhatsApp credentials must be read from environment only');
assert.ok(service.includes('verifyWhatsAppWebhookSignature') && service.includes('timingSafeEqual'), 'Webhook signatures must be validated');
assert.ok(service.includes('processDueWhatsAppRetries') && service.includes('retry-scheduled'), 'Retry handling must be implemented');
assert.ok(notificationService.includes('queueImportantWhatsAppNotification'), 'Notifications must queue important WhatsApp deliveries');
assert.ok(webhookRoute.includes('hub.verify_token') && webhookRoute.includes('processWhatsAppWebhook'), 'Webhook GET verification and POST processing required');
assert.ok(settings.includes('I use a different WhatsApp number') && settings.includes('WhatsApp Number'), 'Profile settings must expose WhatsApp number controls');
assert.ok(settings.includes('In-App Notifications') && settings.includes('WhatsApp Notifications'), 'Profile settings must expose notification toggles');
assert.ok(settingsRoute.includes('requireApiUser'), 'Profile notification settings API must require authentication');
console.log('PataSpace WhatsApp notification infrastructure checks passed.');
