import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/notifications.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/notifications/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/dashboard/notifications/page.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const viewingService = readFileSync(new URL('../src/server/viewings/service.ts', import.meta.url), 'utf8');
const unlockService = readFileSync(new URL('../src/server/unlock/service.ts', import.meta.url), 'utf8');
const verifiedAccessService = readFileSync(new URL('../src/server/verified-access/service.ts', import.meta.url), 'utf8');
const reviewsService = readFileSync(new URL('../src/server/reviews/service.ts', import.meta.url), 'utf8');
const verificationService = readFileSync(new URL('../src/server/verification/service.ts', import.meta.url), 'utf8');

for (const category of ['Houses', 'Shops', 'Offices', 'Event Halls']) assert.ok(domain.includes(category), `Notifications apply to ${category}`);
assert.ok(domain.includes('meaningfulValueOnly: true'), 'Meaningful notification philosophy missing');
assert.ok(domain.includes('avoidUnnecessaryOrRepetitiveNotifications: true'), 'Avoid repetitive notifications missing');
assert.ok(domain.includes('duplicateNotificationsForSameEventNeverSent: true'), 'No duplicate notification rule missing');
for (const field of ['Notification Title', 'Short Description', 'Related Property or Unit', 'Date and Time', 'Read / Unread Status']) assert.ok(domain.includes(field), `Notification Centre field missing ${field}`);
for (const action of ['Open notifications', 'Mark notification as read', 'Mark all notifications as read', 'Delete individual notifications']) assert.ok(domain.includes(action), `Notification action missing ${action}`);
for (const status of ['unread', 'read']) assert.ok(domain.includes(`'${status}'`), `Read status missing ${status}`);

for (const event of ['account-registration','property-unlock-confirmation','verified-access-activation','verified-access-expiry-reminder','viewing-request-submitted','viewing-request-accepted','viewing-request-declined','viewing-request-rescheduled','viewing-reminder','viewing-completed','property-availability-change','review-invitation','review-response-received','payment-successful','payment-failed','receipt-available']) assert.ok(domain.includes(`'${event}'`), `Customer event missing ${event}`);
for (const event of ['new-property-registration','property-verification-update','viewing-cancellation','property-review-received','customer-response-to-viewing','vacancy-confirmation-reminder','property-status-update','registration-approval-or-correction-request']) assert.ok(domain.includes(`'${event}'`), `Property contact event missing ${event}`);
for (const event of ['successful-property-verification','verification-issues-requiring-attention','daily-vacancy-confirmation-reminder','account-update','security-alert','platform-announcement']) assert.ok(domain.includes(`'${event}'`), `Platform event missing ${event}`);

for (const channel of ['in-app','whatsapp']) assert.ok(domain.includes(`'${channel}'`), `Delivery channel missing ${channel}`);
assert.ok(domain.includes('emailNotificationsAllowed: false'), 'Email notifications must not be allowed');
for (const priority of ['Successful payments','Viewing requests','Viewing schedule changes','Verified Access expiry','Property verification decisions','Security alerts']) assert.ok(domain.includes(priority), `Priority example missing ${priority}`);
assert.ok(domain.includes('customersOnlyOwnActivities: true'), 'Customer notification security missing');
assert.ok(domain.includes('propertyContactsOnlyManagedProperties: true'), 'Property contact notification security missing');
assert.ok(domain.includes('monitorsFailedNotifications: true'), 'AI Admin failed notification monitoring missing');
assert.ok(domain.includes('detectsDuplicateNotifications: true'), 'AI Admin duplicate notification monitoring missing');
assert.ok(domain.includes('detectsDelayedNotifications: true'), 'AI Admin delayed notification monitoring missing');
assert.ok(domain.includes('detectsDeliveryIssues: true'), 'AI Admin delivery issue monitoring missing');

assert.ok(service.includes('createNotification'), 'Notification creation service missing');
assert.ok(service.includes('eventKey'), 'Notification de-duplication key missing');
assert.ok(service.includes('existing'), 'Duplicate prevention missing');
assert.ok(service.includes('listNotifications'), 'Notification history/list missing');
assert.ok(service.includes('markNotificationRead'), 'Mark one read missing');
assert.ok(service.includes('markAllNotificationsRead'), 'Mark all read missing');
assert.ok(service.includes('deleteNotification'), 'Delete notification missing');
assert.ok(foundation.includes('notifications: NOTIFICATION_FOUNDATION'), 'Foundation snapshot must expose notifications');
assert.ok(page.includes('Notification Centre'), 'Notification Centre page missing');
assert.ok(dashboard.includes('/dashboard/notifications'), 'Dashboard must link Notification Centre');

for (const source of [viewingService, unlockService, verifiedAccessService, reviewsService, verificationService]) {
  assert.ok(source.includes('createNotification'), 'Workflow integration must create notifications');
}

console.log('PataSpace notifications checks passed.');
