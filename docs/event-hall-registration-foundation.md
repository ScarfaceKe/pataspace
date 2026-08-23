# PataSpace Event Hall Registration Foundation

This module extends the accepted Master Prompts 1–7B. It does not redesign or replace any existing foundation.

## Objective

Event Hall Registration collects and organises event hall information through a guided, professional and mobile-first workflow. It does not implement Hall Match, Verification, Search Ranking, Notifications, Reviews, Payments, AI Admin Assistant logic or Platform Health Monitor logic.

## Who can register event halls

The following users are authorised to register event halls:

- 👑 Property Owner
- 🏢 Property Manager
- 🤝 Leasing Agent

Customers cannot register event halls.

## Registration philosophy

Event Hall Registration inherits the platform-wide Registration User Experience Standard from Master Prompt 4. It uses option cards, toggles, multi-select style choices and Yes / No switches where possible, while only using text fields where necessary.

Event Halls follow a different matching philosophy from Houses, Shops and Offices. Water Information and Electricity Information are not collected during Event Hall Registration and are not considered by the future Hall Match Engine.

## Guided screens

1. Hall Information
2. Property Location
3. Road Visibility
4. Hall Details
5. Availability
6. Pricing
7. Nearby Places
8. Property Photos
9. Property Description

## Foundation data

The workflow collects Hall Name, optional Hall Category, searchable Kenya location fields, road visibility, number of halls available, hall capacity where applicable, real-world hall identifiers, availability, booking price, additional pricing arrangements, nearby places, photos and an honest description.

## Road visibility

Road visibility options are Facing the Main Road, Along the Main Road, Facing an Inner Road, Along an Inner Road, Inside a Commercial Building, Inside a Shopping Complex, Inside an Estate and Other.

## Hall identifiers

Event Hall Registration inherits the platform-wide Vacant Unit Identification rule from Master Prompt 4. Every hall stores its real-world identifier exactly as it appears on the property, such as Hall A, Hall B or Main Hall. PataSpace does not generate or force its own numbering.

## Hall Match priorities

For halls, the registration foundation focuses on capacity, location, accessibility, parking, photos, availability, price, stage setup if available, seating arrangement and surroundings.

## Photos and description

The workflow supports multiple photo uploads and encourages photos showing the front of the property, hall entrance, hall interior, stage if available, seating arrangement, gate, parking area and surrounding environment.

The description field encourages honest and accurate information and avoids exaggerated marketing language.

## Validation, drafts and completion

Before submission the workflow validates required information, missing mandatory fields, duplicate candidates and logical consistency. Users can Save as Draft, Continue Later and Submit Registration.

The success message is:

> Your event hall has been successfully registered.

If available for bookings, it proceeds to future platform workflows. If unavailable, it remains registered until availability is updated.
