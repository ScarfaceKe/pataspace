# PataSpace Office Match Engine Foundation

This module extends the accepted Master Prompts 1–12B. It implements the foundation for office matching only and does not implement ranking intelligence, AI Summary, Smart Rotation, Best Match logic, Unlock recommendations or Verified Access recommendations.

## Objective

The Office Match Engine helps customers discover office spaces matching their professional needs using previously collected registration, verification and vacancy confirmation data behind the scenes.

## Search criteria

The guided search supports:

- County
- Town / City
- Estate / Area
- Road Visibility
- Monthly Rent
- Deposit
- Water Information
- Electricity Information
- Nearby Places
- Vacancy Status
- Verification Status

The engine never asks Property Owners, Property Managers or Leasing Agents for duplicate information.

## Road visibility matching

Road visibility is an important Office Match factor. The foundation supports matching offices by Facing the Main Road, Along the Main Road, Facing an Inner Road, Along an Inner Road, Inside an Office Building, Inside a Commercial Complex and Inside an Estate.

## Vacancy rules

Only active published office vacancies participate in Office Match. The foundation respects Property Verification, Daily Vacancy Confirmation, Waiting for Verification and the one-week removal rule.

## Result preparation

Each prepared office match contains the information required for future Property Summary, Unlock This Listing, Verified Access, Viewing Workflow, Reviews and Notifications.

## Limited batch preparation

The foundation prepares a limited display batch for the next intelligence layer. Display logic, Best Match ranking, Smart Rotation and customer result experience are implemented in Master Prompt 13B.

## No exact match behaviour

If no exact matches are found, the foundation prepares for the approved philosophy that the platform should present suitable alternatives instead of leaving the customer with no results where possible. Detailed behaviour is implemented in Master Prompt 13B.
