# PataSpace Notification Routing & Preferences Report

Date: 2026-08-03

## Status

```text
IN-APP / WHATSAPP NOTIFICATION ROUTING POLICY: COMPLETE
```

The Founder-approved notification routing policy has been encoded without changing authentication, payments, search, matching, pricing, property workflows, database architecture, or platform navigation.

## Default in-app notifications

In-app remains the default notification channel for routine platform updates.

### Customer in-app notifications

Implemented event support for:

- Welcome message.
- Property matched.
- Property unavailable.
- Payment confirmation.
- Profile updates.
- Saved searches.
- New recommendations.
- General announcements.

### Property Owner in-app notifications

Implemented event support for:

- New enquiry.
- New review.
- Listing about to expire.
- Listing expired.
- Property performance.
- Dashboard alerts.

### Property Manager in-app notifications

Implemented event support for:

- New enquiry.
- Viewing schedule.
- Dashboard reminders.
- Weekly summaries.
- Daily task list.

### Leasing Agent in-app notifications

Implemented event support for:

- Assigned properties.
- Assigned viewings.
- Customer enquiries.
- Performance updates.

### Founder in-app notifications

Implemented event support for:

- Platform analytics.
- User growth.
- Revenue reports.
- Security dashboard.
- Operational reports.

## WhatsApp notifications — important only

WhatsApp is now reserved for immediate-attention events only.

### Customer WhatsApp notifications

Allowed:

- Viewing booking confirmed.
- 24-hour viewing reminder.
- 1-hour viewing reminder.
- Viewing cancelled.
- Viewing rescheduled.

Nothing else is routed to WhatsApp for customers by default.

### Property Owner WhatsApp notifications

Allowed:

- New viewing request.
- Viewing confirmed.
- Property successfully rented.

Routine enquiries and dashboard updates are not WhatsApp-routed by default.

### Property Manager WhatsApp notifications

Allowed:

- Daily vacancy verification reminder.
- Urgent viewing reminder.
- Missed viewing alert.

### Leasing Agent WhatsApp notifications

Allowed:

- Today's viewing schedule / viewing schedule summary.
- Customer arrived.
- Viewing cancelled.

### Founder WhatsApp notifications

Allowed:

- High-priority security alerts.
- System outage.
- Failed payment system.
- Daily vacancy verification failures.
- Critical platform errors requiring attention.

Not routed to Founder WhatsApp by default:

- Every new user.
- Every new listing.
- Every payment.
- Routine analytics.
- Routine revenue reports.

## User notification controls

Notification preference support now includes channel controls for:

```text
In-app notifications
WhatsApp notifications
Email notifications
```

Email remains future-prepared only:

```text
emailDeliveryPreparedForFutureApprovalOnly: true
```

No email delivery implementation was added in this change.

The preferences API is now authenticated:

```text
GET  /api/communication/preferences
POST /api/communication/preferences
```

The API uses the logged-in user session instead of accepting arbitrary customer IDs from the client.

## Routing implementation

Updated:

```text
src/domain/notifications.ts
src/server/notifications/service.ts
src/domain/communication.ts
src/server/communication/service.ts
app/api/communication/preferences/route.ts
```

Key routing functions:

```text
notificationCanUseWhatsApp(eventType)
resolveNotificationChannels(eventType, preferences)
```

`createNotification()` now resolves channels through the routing policy instead of always storing only `['in-app']`.

## WhatsApp exclusions

Explicit routine WhatsApp exclusions include:

- New enquiry.
- Dashboard alert.
- Dashboard reminder.
- Payment successful.
- Payment confirmation.
- Account registration.
- Welcome message.
- New property registration.
- Platform analytics.
- User growth.
- Revenue reports.
- Property matched.
- Saved search updates.
- New recommendations.

## Validation completed

Commands run successfully:

```bash
npm run test:notification-routing
npm run test:notifications
npm run test:communication
npm run test:all
npm run security:validate
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
```

Results:

- Notification routing policy checks passed.
- Notification foundation checks passed.
- Communication foundation checks passed.
- Full platform test suite passed.
- Security validation passed.
- TypeScript checks passed.
- Production build passed.
- Dependency audit found 0 vulnerabilities.

## Completion statement

```text
PataSpace notification routing and user notification preferences: COMPLETE
```
