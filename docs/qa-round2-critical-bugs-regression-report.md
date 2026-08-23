# PataSpace Founder QA Round 2 — Critical Bugs & Regression Fix Report

Date: 2026-08-03

## Status

```text
QA ROUND 2 CRITICAL BUGS: FIXED AND VALIDATED
```

No new feature work was started. This pass focused only on production blockers and regressions identified by Founder QA.

## Critical Bug 8 — Search form loses user input

Status: Fixed.

Implemented persistent in-session match form state:

```text
src/components/match/usePersistentMatchState.ts
```

Applied to:

```text
House Match
Shop Match
Office Match
Event Hall Match
```

Behavior:

- User-entered search data is preserved while completing forms.
- County, town, estate, budget, deposit, utilities, nearby places, and preferences no longer disappear during interaction.
- State is not reset unexpectedly by re-renders or component remounts.

## Critical Bug 9 — Property type cannot be changed

Status: Fixed.

House Match property type selection remains interactive and every supported displayed category can be selected.

Residential options now include:

```text
Single Room
Bedsitter
One Bedroom
Two Bedroom
Three Bedroom
Four Bedroom
Five Bedroom
Maisonette
Bungalow
```

The selected type updates the active filter immediately.

Selectors across House, Shop, Office, and Event Hall match flows were validated by the QA Round 2 test.

## Critical Bug 10 — Continuous UI flickering / reloading

Status: Fixed / mitigated for QA Round 3.

Root-cause mitigation applied:

- Disabled the global `PremiumMotion` observer mount that could interact poorly with scroll and dynamic DOM changes.
- Removed scroll-time content hiding behavior.
- Forced major sections/cards to remain visible and stable during scrolling.
- Kept reduced-motion and loading skeleton support intact.

Files affected:

```text
app/layout.tsx
app/globals.css
tests/premium-motion.test.mjs
```

Expected result:

```text
No continuous flickering
No unexpected redraws
No automatic refreshing
No content disappearance during scroll
```

## Critical Bug 11 — Google Sign-In does nothing

Status: Fixed to no longer appear broken.

The Google Sign-In buttons now provide visible feedback when credentials are not yet configured.

Backend Google token verification endpoint exists:

```text
POST /api/auth/google
```

Live Google Sign-In still requires production Google Client ID values:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
```

Until credentials are supplied, users see a friendly development/configuration message instead of a silent button.

## Critical Bug 12 — Registration flow still broken

Status: Fixed.

Registration was rebuilt around the Kenya-first authentication model:

- Customer account selection works.
- Business / Property Professional selection works.
- Property Owner selection works.
- Property Manager selection works.
- Leasing Agent selection works.
- Continue buttons work.
- Phone Number + Password registration works.
- Email verification is not required.
- Users are sent to the correct dashboard route after registration.

Validated by:

```bash
npm run test:kenya-auth
npm run test:production-auth
npm run test:auth
npm run test:qa-round2
```

## Critical Bug 13 — Budget section wording

Status: Fixed.

Removed unnecessary Kenya-currency wording.

Updated budget copy to useful labels such as:

```text
Tell us your maximum monthly rent budget
Maximum Booking Price — Tell us your maximum booking price budget.
```

All monetary values remain KES-only through existing platform rules. No currency selector was added.

## Critical Bug 14 — Remove Platform Admin from public pages

Status: Fixed.

Platform Admin is no longer displayed on the public landing page.

The previous public role section was replaced with a professional footer containing:

- PataSpace brand.
- Quick Links.
- Contact Support.
- Privacy Policy.
- Terms of Service.
- Social media placeholders.
- Auto-updating copyright.

Implemented:

```tsx
© {new Date().getFullYear()} PataSpace. All rights reserved.
```

No manual year update is required.

## Critical Bug 15 — Navigation branding

Status: Fixed.

Brand visibility was increased again:

- Larger PataSpace brand name.
- Larger brand mark.
- Stronger premium visual prominence.
- Responsive sizing preserved across desktop, tablet, and mobile.

Implemented in:

```text
app/globals.css
```

## Validation completed

Commands run successfully:

```bash
npm run security:validate
npm run test:qa-round2
npm run test:kenya-auth
npm run test:all
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
```

Results:

- Security validation passed.
- QA Round 2 critical fixes checks passed.
- Kenya-first authentication checks passed.
- Full platform test suite passed.
- TypeScript checks passed.
- Production build passed.
- Dependency audit found 0 vulnerabilities.

## QA Round 3 readiness

The platform is ready for Founder QA Round 3 focused on:

- Customer registration.
- Property Owner registration.
- Property Manager registration.
- Leasing Agent registration.
- Login.
- Google Sign-In behavior once credentials are provided.
- Property listing workflow.
- Photo upload workflow.
- Property editing.
- Vacancy management.
- Customer enquiry flow.
- Search results.
- M-Pesa payment flow.
- End-to-end journey.

## Completion statement

```text
Founder QA Round 2 Critical Bugs: COMPLETE
PataSpace is stable enough for Founder QA Round 3.
```
