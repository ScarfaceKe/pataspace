# PataSpace Shop Registration Foundation

This module extends the accepted Master Prompts 1–5B. It does not redesign or replace any existing foundation.

## Objective

Shop Registration collects commercial shop information accurately through a simple, guided, mobile-first workflow. It prepares the data foundation for future Shop Match, Verification, Viewing Workflow, Unlock This Listing, Verified Access, Reviews, AI Admin Assistant and Platform Health Monitor modules. It does not implement those systems.

## Who can register shops

The following users are authorised to register shop properties:

- 👑 Property Owner
- 🏢 Property Manager
- 🤝 Leasing Agent

Customers cannot register shops.

## Registration philosophy

The workflow is step-by-step, adaptive, professional, mobile-first and easy to complete. It avoids unnecessary questions and only shows relevant fields based on previous answers.

## Guided screens

1. Shop Type
2. Property Location
3. Road Visibility
4. Shop Information
5. Rent Information
6. Vacancy Information
7. Water Information
8. Business Suitability
9. Nearby Places
10. Property Photos
11. Property Description

## Location

The workflow collects County, Town / City, Estate / Area and optional Landmark using searchable Kenyan location fields.

## Road visibility

Road visibility is collected as a major Shop Match factor using exactly these options:

- Facing the Main Road
- Along the Main Road
- Facing an Inner Road
- Along an Inner Road
- Inside a Shopping Complex
- Inside a Building
- Inside an Estate
- Other

## Shop, rent and vacancy information

The workflow collects optional Shop Name, Number of Shop Units, Number of Floors where applicable, Floor where vacant shop exists where applicable, Monthly Rent and Deposit Amount. Deposits support One Month, Two Months, Three Months and any custom deposit amount.

Vacancy registration asks whether vacant shop units exist. If no, the shop property is registered without publishing vacancies. If yes, the workflow collects Monthly Rent, Deposit and Quantity Available.

## Water information

Water is mandatory because it is an approved Shop Match factor. Options are Daily Water, Water on Specific Days, Water Purchased Separately and No Water Connection. If water exists, the workflow asks whether it is Included or Paid Separately.

## Business suitability

The workflow allows toggles for business suitability with examples, including retail, salon or barber, food business, boutique, chemist or pharmacy, hardware, M-Pesa or agent shop, office services, mini mart and other business use.

## Nearby places

The workflow collects approximate distances to Bus Stage, Market, Main Road, Shopping Centre, Bank and Hospital. This information becomes searchable during future Shop Match.

## Photos and description

The workflow supports multiple photo uploads and encourages photos showing the front of the building, shop entrance, shop interior, shop frontage, gate where applicable, surrounding environment and shared parking or common areas where applicable.

The description field encourages clear, honest information and avoids exaggerated marketing language.

## Validation, drafts and completion

Before submission the workflow validates required information, missing mandatory fields, duplicate candidates and logical consistency. Users can Save Draft, Continue Later and Submit Registration.

The success message is:

> Your shop property has been successfully registered.

If vacancies exist, they are prepared for later workflows. If vacancies do not exist, the property remains registered until vacancies are published.

## Vacant unit identifiers

Shop Registration inherits the platform-wide vacant unit identification rule from Master Prompt 4. Every vacant shop unit stores its real-world unit identifier exactly as it appears on the property, such as Shop 14, Stall 3, K7 or Unit 12. PataSpace does not generate or force its own numbering.

## Electricity information

Shop Registration inherits the platform-wide Electricity Information rule from Master Prompt 4. The workflow collects whether electricity is available, how it is billed, and optional power availability notes immediately after Water Information.

## Commercial Unit Type Identification

Shop Registration now stores Commercial Unit Type separately from Pricing Category.

Commercial Unit Type identifies what the commercial space is. Options include Kiosk, Stall, Shop, Showroom, Warehouse, Godown, Container Shop, Mini Shop, Boutique, Salon / Barbershop, Restaurant / Café Space, Pharmacy Space, Supermarket Space, Hardware Shop, Office-Shop Combination and Other Commercial Unit Type. If Other Commercial Unit Type is selected, the registrant enters a custom type.

Commercial Unit Type is used for search, filtering, matching and display. It does not determine Unlock This Listing or Verified Access pricing.

## Pricing Category

Every shop also stores a Founder-approved pricing category: Small Shop, Medium Shop or Large Shop.

Pricing Category is used only to apply centrally managed Founder-approved Unlock This Listing and Verified Access prices. Property Owners, Property Managers and Leasing Agents cannot manually select or edit the actual prices.

Commercial Unit Type and Pricing Category are separate and must never be confused.
