# PataSpace House Match Engine Foundation

This module extends the accepted Master Prompts 1–10B. It implements the foundation for residential matching only and does not implement ranking intelligence, AI Summary, Smart Rotation, Best 20 logic, Unlock recommendations or Verified Access recommendations.

## Objective

The House Match Engine helps customers discover homes matching their preferences using previously collected registration, verification and vacancy confirmation data behind the scenes.

## Supported residential categories

- Single Room
- Bedsitter
- One Bedroom
- Two Bedroom
- Three Bedroom
- Four Bedroom
- Five Bedroom
- Mixed Residential Properties

Mixed Residential Properties return only the matching unit type requested by the customer.

## Guided search criteria

The customer search uses a guided, choice-first experience and supports:

- Residential Category
- County
- Town / City
- Estate / Neighbourhood
- Monthly Rent
- Deposit
- Water Information
- Electricity Information
- Nearby Places
- Vacancy Status
- Verification Status

The engine never asks Property Owners, Property Managers or Leasing Agents for duplicate information.

## Vacancy rules

Only active published vacancies participate in House Match. The foundation respects Property Verification, Daily Vacancy Confirmation, Waiting for Verification rules and the one-week removal rule.

## Result preparation

Each prepared match includes the information required for future Property Summary, Unlock This Listing, Verified Access, Viewing Workflow, Reviews and Notifications.

## Limited batch preparation

The foundation prepares a limited display batch for the next intelligence layer. Display logic, Best 20, ranking, Smart Rotation and customer result experience are implemented in Master Prompt 11B.

## No exact match behaviour

If no exact matches are found, the foundation prepares for the approved philosophy that the platform should avoid an empty experience whenever suitable alternatives exist. The detailed behaviour is implemented in Master Prompt 11B.
