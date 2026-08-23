# PataSpace Daily Vacancy Confirmation Foundation

This module extends the accepted Master Prompts 1–9. It establishes the Daily Vacancy Confirmation workflow for published vacant units without implementing search ranking, AI intelligence or Platform Health Monitor intelligence.

## Scope

Daily Vacancy Confirmation applies only to published vacant units for:

- 🏠 Houses
- 🏪 Shops
- 🏢 Offices

Event Halls are excluded because they use booking availability rather than daily vacancy confirmation.

## Philosophy

Every published vacant unit regularly confirms that it is still vacant. Vacancy confirmation is different from property verification: property verification confirms legitimacy, while daily vacancy confirmation confirms that the advertised vacancy still exists.

The workflow should encourage continuous confirmation instead of punishing users for forgetting once.

## Initial confirmation

When a vacant unit is first published, it immediately becomes a Confirmed Vacancy. The confirmation timestamp is recorded automatically and no additional confirmation is required immediately after publishing.

## 24-hour cycle and reminder

A confirmed vacant unit remains active for 24 hours. During this period the listing remains active, customer search continues, Unlock This Listing continues working, Verified Access continues working and Viewing Requests continue working.

Before expiry, the system prepares an in-app reminder asking the Property Owner, Property Manager or Leasing Agent to confirm that the vacancy still exists.

## Confirmation action

Confirmation requires a simple action. When confirmed, a new timestamp is recorded and a new 24-hour confirmation cycle begins. No property information is re-entered.

## Grace period

If the vacancy is not confirmed after the first 24 hours, it enters a 24-hour grace period. During the grace period, the vacancy remains visible, customer unlocks continue and Viewing Requests continue.

## Waiting for Verification

If no confirmation is received after a total of 48 hours, the vacancy changes to Waiting for Verification. The property remains registered and no registration information is lost.

## Reconfirmation

A registrant may reconfirm at any time after Waiting for Verification. Once confirmed, the vacancy becomes active again, a new timestamp is recorded and a new 24-hour cycle begins. No duplicate registration is required.

## Independent unit confirmation

Every vacant unit maintains its own confirmation status independently. Confirming Unit A1 does not confirm Unit A2 or Unit A3.

## Vacancy closed

If a unit is no longer vacant, the registrant can mark it as occupied. Once occupied, it stops appearing in customer searches, Unlock This Listing is unavailable, Verified Access no longer exposes the unit and Viewing Requests stop for that vacancy.

## Integration

This foundation integrates with Registration Foundation, Property Verification, Notifications, Viewing Workflow, Unlock This Listing and Verified Access.

Master Prompt 10B will extend this workflow with Search Priority behaviour, AI Admin Assistant monitoring, Platform Health Monitor integration, the one-week removal rule and recovery after reconfirmation.
