# PataSpace Shop Match Engine Foundation

This module extends the accepted Master Prompts 1–11B. It implements the foundation for commercial shop matching only and does not implement ranking intelligence, AI Summary, Smart Rotation, Best Match logic, Unlock recommendations or Verified Access recommendations.

## Objective

The Shop Match Engine helps customers discover commercial spaces matching their business requirements using previously collected registration, verification and vacancy confirmation data behind the scenes.

## Search criteria

The guided search supports:

- County
- Town / City
- Estate / Area
- Road Visibility
- Monthly Rent
- Deposit
- Business Suitability
- Water Information
- Electricity Information
- Nearby Places
- Vacancy Status
- Verification Status

The engine never asks Property Owners, Property Managers or Leasing Agents for duplicate information.

## Road visibility matching

Road visibility is a major Shop Match factor. The foundation supports matching shops by Facing the Main Road, Along the Main Road, Facing an Inner Road, Along an Inner Road, Inside a Shopping Complex, Inside a Building and Inside an Estate.

## Business suitability matching

Registered Business Suitability information is used as a primary commercial matching factor.

## Vacancy rules

Only active published shop vacancies participate in Shop Match. The foundation respects Property Verification, Daily Vacancy Confirmation, Waiting for Verification and the one-week removal rule.

## Result preparation

Each prepared shop match contains the information required for future Property Summary, Unlock This Listing, Verified Access, Viewing Workflow, Reviews and Notifications.

## Limited batch preparation

The foundation prepares a limited display batch for the next intelligence layer. Display logic, Best Match ranking, Smart Rotation and customer result experience are implemented in Master Prompt 12B.

## No exact match behaviour

If no exact matches are found, the foundation prepares for the approved philosophy that the platform should present suitable alternatives instead of leaving the customer with no results where possible. Detailed behaviour is implemented in Master Prompt 12B.

## Commercial Unit Type

Shop Match uses Commercial Unit Type for search, filtering, matching and display. Pricing Category remains separate and is used only for Founder-approved Unlock This Listing and Verified Access pricing.
