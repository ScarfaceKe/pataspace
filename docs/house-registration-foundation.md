# PataSpace House Registration Foundation

This module extends the accepted Master Prompts 1–4. It does not redesign, replace or duplicate the existing platform foundation, brand standards, authentication system or Property Registration Foundation.

## Objective

House Registration collects and organises residential property information only. It does not implement matching, verification, search ranking, notifications, reviews, payments, AI Admin Assistant logic or Platform Health Monitor logic.

## Who can register houses

The following users are authorised to register residential properties:

- 👑 Property Owner
- 🏢 Property Manager
- 🤝 Leasing Agent

Customers cannot register houses.

## Registration philosophy

House Registration is guided, step-by-step, mobile-first, clean, professional and easy to understand. It never presents one long registration form and displays a progress indicator throughout the process.

## Supported residential categories

- Single Room
- Bedsitter
- One Bedroom
- Two Bedroom
- Three Bedroom
- Four Bedroom
- Five Bedroom
- Mixed Residential Property

## Mixed Residential Properties

Mixed Residential Properties are officially supported. A mixed residential property is one property containing multiple residential unit types in the same compound. The vacancy registration foundation allows multiple residential categories under one registered property without requiring separate property registrations.

## Guided screens

1. Residential Category
2. Property Location
3. Property Information
4. Rent Information
5. Vacancy Information
6. Water Information
7. Nearby Places
8. Photos and Description

The workflow only displays relevant questions. Mixed Residential Properties can add multiple vacancy categories; non-mixed residential properties only show the selected residential category for vacancy registration.

## Location

The house workflow collects County, Town / City, Estate / Neighbourhood and optional Landmark using searchable Kenya location fields.

## Property and rent information

The workflow collects optional Property Name, Number of Units, Number of Floors where applicable, Floor where vacant unit exists where applicable, Monthly Rent and Deposit Amount. Deposit structures support One Month, Two Months, Three Months and any other amount entered by the authorised registrant. Deposit values are not restricted.

## Vacancy information

The workflow asks whether there are currently vacant units. If no, the residential property can be registered successfully without publishing vacancies. If yes, each vacant unit collects Residential Category, Monthly Rent, Deposit and Quantity Available.

## Water information

Water availability is mandatory. The options are Daily Water, Water Available on Specific Days, Water Purchased Separately and No Water Connection. If water exists, the registrant specifies whether water is Included or Paid Separately.

## Nearby places

The workflow supports approximate distances for Primary School, Secondary School, Hospital, Shopping Centre, Bus Stage, Market and Police Station. This information becomes part of future matching.

## Photos and description

The workflow allows multiple photos representing exterior, interior and shared areas where applicable. The description field encourages accurate information and avoids exaggerated marketing language.

## Validation, drafts and completion

Before submission the workflow validates required information, mandatory fields, duplicate candidates and logical consistency. Users can Save as Draft, Continue Later and Submit when ready. The success message is:

> Your residential property has been successfully registered.

If vacancies exist, they will proceed to future platform workflows. If vacancies do not exist, the property remains registered and vacancies can be published later.

## Vacant unit identifiers

House Registration inherits the platform-wide vacant unit identification rule from Master Prompt 4. Every vacant residential unit stores its real-world unit identifier exactly as it appears on the property, such as A1, B5, Unit 12 or Room 7. PataSpace does not generate or force its own numbering.

## Electricity information

House Registration inherits the platform-wide Electricity Information rule from Master Prompt 4. The workflow collects whether electricity is available, how it is billed, and optional power availability notes immediately after Water Information.
