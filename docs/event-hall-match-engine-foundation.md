# PataSpace Event Hall Match Engine Foundation

This module extends the accepted Master Prompts 1–13B. It implements the foundation for event hall matching only and does not implement ranking intelligence, Summary, Smart Rotation, Best Match logic, Unlock recommendations or Verified Access recommendations.

## Objective

The Hall Match Engine helps customers discover event halls matching their event requirements using previously collected registration, verification and availability information behind the scenes.

## Search criteria

The guided search supports:

- County
- Town / City
- Estate / Area
- Road Visibility
- Hall Capacity
- Booking Price
- Nearby Places
- Booking Availability
- Verification Status

The engine never asks Property Owners, Property Managers or Leasing Agents for duplicate information.

## Hall matching priorities

Hall Match prioritises event suitability, hall capacity, accessibility, location, accurate booking availability and trust.

## Water and electricity exclusion

Water Information and Electricity Information are not used for Event Hall Registration or Hall Match.

## Availability rules

Only halls available for bookings participate in Hall Match. The foundation respects Property Verification, Hall Availability and Booking Availability updates. Daily Vacancy Confirmation does not apply to Event Halls.

## Result preparation

Each prepared hall match contains the information required for future Property Summary, Unlock This Listing, Verified Access, Viewing Workflow, Reviews and Notifications.

## Limited batch preparation

The foundation prepares a limited display batch for the next intelligence layer. Display logic, Best Match ranking, Smart Rotation and customer result experience are implemented in Master Prompt 14B.

## No exact match behaviour

If no exact matches are found, the foundation prepares for the approved philosophy that the platform should present suitable alternatives instead of leaving the customer with no results where possible. Detailed behaviour is implemented in Master Prompt 14B.
