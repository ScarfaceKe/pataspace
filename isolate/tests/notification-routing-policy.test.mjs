import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const notifications = readFileSync(new URL('../src/domain/notifications.ts', import.meta.url), 'utf8');
const notificationService = readFileSync(new URL('../src/server/notifications/service.ts', import.meta.url), 'utf8');
const communication = readFileSync(new URL('../src/domain/communication.ts', import.meta.url), 'utf8');
const preferencesRoute = readFileSync(new URL('../app/api/communication/preferences/route.ts', import.meta.url), 'utf8');

for (const event of ['welcome-message','property-matched','property-unavailable','payment-confirmation','profile-update','saved-search-update','new-recommendation','general-announcement']) {
  assert.ok(notifications.includes(`'${event}'`), `Customer in-app event missing ${event}`);
}
for (const event of ['new-enquiry','new-review','listing-about-to-expire','listing-expired','property-performance','dashboard-alert']) {
  assert.ok(notifications.includes(`'${event}'`), `Property Owner in-app event missing ${event}`);
}
for (const event of ['viewing-schedule','dashboard-reminder','weekly-summary','daily-task-list']) {
  assert.ok(notifications.includes(`'${event}'`), `Property Manager in-app event missing ${event}`);
}
for (const event of ['assigned-properties','assigned-viewings','performance-update']) {
  assert.ok(notifications.includes(`'${event}'`), `Leasing Agent in-app event missing ${event}`);
}
for (const event of ['platform-analytics','user-growth','revenue-report','security-dashboard','operational-report']) {
  assert.ok(notifications.includes(`'${event}'`), `Founder in-app event missing ${event}`);
}
for (const event of ['viewing-booking-confirmed','viewing-24-hour-reminder','viewing-1-hour-reminder','viewing-cancelled','viewing-request-submitted','property-successfully-rented','daily-vacancy-verification-reminder','urgent-viewing-reminder','missed-viewing-alert','customer-arrived','high-priority-security-alert','system-outage','failed-payment-system','daily-vacancy-verification-failure','critical-platform-error']) {
  assert.ok(notifications.includes(`'${event}'`), `WhatsApp important event missing ${event}`);
}
for (const event of ['payment-successful','payment-confirmation','new-enquiry','dashboard-alert','platform-analytics','user-growth','revenue-report']) {
  assert.ok(notifications.includes(`'${event}'`), `WhatsApp excluded routine event missing ${event}`);
}
assert.ok(notifications.includes('resolveNotificationChannels'), 'Notification channel resolver missing');
assert.ok(notificationService.includes('resolveNotificationChannels(input.eventType)'), 'Notification service must apply routing policy');
assert.ok(communication.includes('inAppNotifications') && communication.includes('whatsappNotifications') && communication.includes('emailNotifications'), 'Notification preferences must expose in-app, WhatsApp, and email toggles');
assert.ok(communication.includes('emailDeliveryPreparedForFutureApprovalOnly: true'), 'Email preference must be future-prepared only');
assert.ok(preferencesRoute.includes('requireApiUser'), 'Notification preferences API must require authentication');
console.log('PataSpace notification routing policy checks passed.');
