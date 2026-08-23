import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/communication.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/communication/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const category of ['Houses','Shops','Offices','Event Halls']) assert.ok(domain.includes(category), `Communication applies to ${category}`);
for (const principle of ['Notify users only when necessary','Never spam users','Prioritize meaningful communication','Combine related notifications whenever appropriate','Respect the Invisible Intelligence Principle','Keep communication simple, timely, and relevant']) assert.ok(domain.includes(principle), `Missing principle ${principle}`);
assert.ok(domain.includes("standardNotifications: ['in-app']"), 'Standard notifications must be in-app');
assert.ok(domain.includes("criticalNotifications: ['in-app', 'whatsapp']"), 'Critical notifications must be in-app and WhatsApp');
assert.ok(domain.includes('emailNotificationsAllowed: false'), 'Email notifications must be disabled');
assert.ok(domain.includes('customersMayChooseDeliveryChannels: true'), 'Customers must be able to choose notification delivery channels');
for (const toggle of ['in-app notifications', 'whatsapp notifications', 'email notifications (future approval only)']) assert.ok(domain.includes(toggle), `Notification channel toggle missing ${toggle}`);
assert.ok(domain.includes("configurableCategories: ['new-matching-properties', 'viewing-reminders']"), 'Customer preference categories missing');
for (const delivered of ['New Viewing Request','Daily Vacancy Confirmation Reminder','Property Became Inactive']) assert.ok(domain.includes(delivered), `Property contact notification missing ${delivered}`);
for (const blocked of ['Every Unlock This Listing purchase','Every Verified Access purchase','Every customer search','Every property view','Every minor platform event']) assert.ok(domain.includes(blocked), `Notification fatigue blocker missing ${blocked}`);
for (const founder of ['Critical platform incidents','Security incidents','Platform outages','Critical payment failures','AI investigations requiring Founder approval']) assert.ok(domain.includes(founder), `Founder notification missing ${founder}`);
assert.ok(domain.includes('communicationAvailableOnlyAfterUnlockOrVerifiedAccess: true'), 'Communication must require access');
assert.ok(domain.includes('noCommunicationBeforeSuccessfulAccessPurchase: true'), 'No communication before access');
assert.ok(domain.includes('prepareWhatsAppMessage'), 'WhatsApp message preparation missing');
for (const field of ['propertyCategory','propertySummary','propertyReferenceOrUnitIdentifier','politeIntroduction','customerMayEditBeforeSending']) assert.ok(domain.includes(field), `WhatsApp field missing ${field}`);
for (const priority of ['high','medium','low']) assert.ok(domain.includes(`'${priority}'`), `Priority ${priority} missing`);
assert.ok(domain.includes('noDailyGreetingsWithoutMeaningfulActivity: true'), 'No routine daily greetings rule missing');
assert.ok(domain.includes('ifNothingImportantNoNotificationSent: true'), 'No notification if nothing important rule missing');
assert.ok(domain.includes('neverExposeProtectedInfoBeforeAccess: true'), 'Protected info security missing');
assert.ok(service.includes('getCustomerNotificationPreferences'), 'Preference getter missing');
assert.ok(service.includes('updateCustomerNotificationPreferences'), 'Preference updater missing');
assert.ok(service.includes('preparePropertyWhatsAppMessage'), 'WhatsApp service missing');
assert.ok(service.includes('prepareNotificationSummary'), 'Summary service missing');
assert.ok(foundation.includes('communication: COMMUNICATION_FOUNDATION'), 'Foundation snapshot missing communication foundation');

console.log('PataSpace communication foundation checks passed.');
