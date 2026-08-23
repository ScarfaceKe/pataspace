# PataSpace Office Registration Foundation

This module extends the accepted Master Prompts 1–6B. It does not redesign or replace any existing foundation.

## Objective

Office Registration collects and organises office property information through a guided, professional and mobile-first workflow. It does not implement Office Match, Verification, Search Ranking, Notifications, Reviews, Payments, AI Admin Assistant logic or Platform Health Monitor logic.

## Who can register offices

The following users are authorised to register office properties:

- 👑 Property Owner
- 🏢 Property Manager
- 🤝 Leasing Agent

Customers cannot register office properties.

## Registration philosophy

Office Registration is guided, step-by-step, mobile-first, professional, simple and easy to complete. It avoids long forms, displays only office-relevant questions and always shows a progress indicator.

## Guided screens

1. Office Type
2. Property Location
3. Road Visibility
4. Office Information
5. Rent Information
6. Vacancy Information
7. Water Information
8. Nearby Places
9. Property Photos
10. Property Description

## Office Match foundation data

The workflow collects office type, searchable Kenya location fields, road visibility, office unit information, rent and deposit information, vacancy details, platform-wide real-world vacant unit identifiers, water information, nearby places, photos and an accurate description.

## Road visibility

Road visibility options are Facing the Main Road, Along the Main Road, Facing an Inner Road, Along an Inner Road, Inside an Office Building, Inside a Commercial Complex, Inside an Estate and Other.

## Vacant unit identifiers

Office Registration inherits the platform-wide vacant unit identification rule from Master Prompt 4. Every vacant office unit stores its real-world unit identifier exactly as it appears on the property, such as Office 203, Unit 12 or A1. PataSpace does not generate or force its own numbering.

## Photos and description

The workflow supports multiple photo uploads and encourages photos showing the front of the building, office entrance, office interior, building frontage, gate where applicable, parking area where applicable, shared reception or common areas where applicable and surrounding environment.

The description field encourages accurate and honest information and avoids exaggerated marketing language.

## Validation, drafts and completion

Before submission the workflow validates required information, missing mandatory fields, duplicate candidates and logical consistency. Users can Save as Draft, Continue Later and Submit Registration.

The success message is:

> Your office property has been successfully registered.

If vacancies exist, they will proceed to future platform workflows. If no vacancies exist, the property remains registered until vacancies become available.

## Electricity information

Office Registration inherits the platform-wide Electricity Information rule from Master Prompt 4. The workflow collects whether electricity is available, how it is billed, and optional power availability notes immediately after Water Information.
