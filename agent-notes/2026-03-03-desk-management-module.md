# Desk Management Module Implementation

## Session Metadata
- Date: 2026-03-03
- Branch: `desk-management-module`
- Base: `main` (5669b9a)
- Commit: `3e89e63` — 56 files changed, 4433 insertions, 366 deletions

## Objective and Scope
Full implementation of the desk booking module from prototype to production-grade, following the architecture plan.

### In Scope
- Convex schema redesign (8 tables with indexes)
- All Convex functions (queries, mutations, internal actions)
- Auth integration (pluggable: guest-only / Clerk)
- SVG floor plan viewer and editor
- Booking flow (half-day slots, collision detection, cancel)
- Admin section (dashboard, floor plans, desk types, bookings, settings, webhooks)
- Guest routes (/book, /lookup)
- Member routes (/my-bookings)
- Event system with webhook delivery
- Email action stubs (Resend)

### Out of Scope
- Actual Clerk/Auth0 integration testing (no credentials)
- Resend email sending (stub only)
- Playwright E2E tests
- Vitest unit tests

## Implementation Log

### Convex Backend
1. `convex/schema.ts` — Full redesign: deskTypes, floorPlans, desks, bookings, users, settings, webhooks, events
2. `convex/bookings.ts` — create, cancel, getByFloorPlanAndDate, getByEmail, getMyBookings, listAll
3. `convex/desks.ts` — list (with optional floorPlanId), getById, create, update, remove (soft-delete)
4. `convex/floorPlans.ts` — CRUD, generateUploadUrl, getBackgroundUrl
5. `convex/deskTypes.ts` — CRUD with dynamic attributes
6. `convex/users.ts` — store (upsert from auth), getMe, setRole
7. `convex/settings.ts` — get (with defaults), update (upsert)
8. `convex/webhooks.ts` — register, update, remove, list
9. `convex/events.ts` — emit (internal), listByType, markDelivered
10. `convex/email.ts` — sendBookingConfirmation, sendBookingCancellation (stubs, "use node")
11. `convex/webhookDelivery.ts` — deliver (HMAC-signed HTTP POST, "use node")
12. `convex/webhookDeliveryHelpers.ts` — internalQuery helpers for actions
13. `convex/lib/auth.ts` — getUser, requireAuth, requireAdmin
14. `convex/lib/validation.ts` — validateBookingDate, checkSlotConflict, checkPersonSlotConflict
15. `convex/auth.config.ts` — Pluggable auth domain config
16. `convex/_generated/api.d.ts` — Updated manually to include all new modules

### Frontend Components
17. `src/components/floor-plan/FloorPlanViewer.tsx` — SVG viewer with desk nodes, tooltips, floor plan selector
18. `src/components/floor-plan/FloorPlanEditor.tsx` — SVG drag-drop editor for admin
19. `src/components/floor-plan/DeskNode.tsx` — SVG desk rendering with availability indicators
20. `src/components/floor-plan/DeskTooltip.tsx` — Hover popover with booking details
21. `src/components/floor-plan/FloorPlanSelector.tsx` — Tab-style floor plan switcher
22. `src/components/booking/BookingDialog.tsx` — Modal with slot picker + guest form
23. `src/components/booking/BookingSlotPicker.tsx` — Morning/afternoon toggle
24. `src/components/booking/GuestBookingForm.tsx` — Name + email fields
25. `src/components/booking/BookingCard.tsx` — Single booking display with cancel
26. `src/components/booking/BookingList.tsx` — Sorted booking list
27. `src/components/views/CalendarView.tsx` — List/grid view with filters
28. `src/components/views/DeskFilterBar.tsx` — Type and availability filters
29. `src/components/auth/AuthGuard.tsx`, `AdminGuard.tsx`, `UserMenu.tsx`
30. `src/components/admin/AdminLayout.tsx`, `AdminNav.tsx`
31. `src/components/admin/DeskTypeForm.tsx`, `FloorPlanForm.tsx`, `SettingsForm.tsx`, `BookingTable.tsx`, `WebhookForm.tsx`

### Routes
32. `src/app/page.tsx` — Main landing with floor plan + sidebar
33. `src/app/book/page.tsx` — Guest booking portal
34. `src/app/lookup/page.tsx` — Email-based booking lookup
35. `src/app/my-bookings/page.tsx` — Authenticated user bookings
36. `src/app/admin/layout.tsx` — Admin sidebar layout with AdminGuard
37. `src/app/admin/page.tsx` — Dashboard with today's stats
38. `src/app/admin/floor-plans/page.tsx` — Floor plan CRUD list
39. `src/app/admin/floor-plans/[id]/page.tsx` — Floor plan desk editor
40. `src/app/admin/desk-types/page.tsx` — Desk type CRUD
41. `src/app/admin/bookings/page.tsx` — All bookings with filters
42. `src/app/admin/settings/page.tsx` — Admin settings
43. `src/app/admin/webhooks/page.tsx` — Webhook management

### Deleted
- `src/components/FloorPlan.tsx` — Replaced by floor-plan/FloorPlanViewer.tsx
- `src/components/BookingForm.tsx` — Replaced by booking/BookingDialog.tsx
- `src/components/AdminFloorPlanEditor.tsx` — Replaced by floor-plan/FloorPlanEditor.tsx

## Decision Log
- Used `useMemo` instead of `useEffect` + `setState` for derived default selections (React 19 lint rules)
- AuthProvider uses runtime `require()` for Clerk to avoid build errors when not installed; currently simplified to just ConvexProvider
- `convex/_generated/api.d.ts` manually updated since `npx convex dev` wasn't run (no deployment configured)
- Soft-delete pattern for desks (status: "removed") and desk types (isActive: false)
- First registered user auto-promoted to admin role

## Validation Log
- `npx tsc --noEmit` — 0 errors
- `npx eslint src/ convex/` — 0 errors, 7 warnings (unused catch error params)
- `git commit` — success

## Handoff

### To make it work:
1. Run `npx convex dev` to push schema and regenerate `_generated/` types
2. Create at least one desk type via admin UI
3. Create a floor plan via admin UI
4. Add desks via the floor plan editor

### Remaining work:
- **Clerk integration**: Install `@clerk/nextjs`, set env vars, update AuthProvider to actually wrap with ClerkProvider
- **Resend emails**: Install `resend`, implement actual send logic in `convex/email.ts`
- **Tests**: Add Vitest unit tests for Convex functions, Playwright E2E
- **Responsive design**: Mobile breakpoints need attention
- **Loading states**: Some pages could use skeleton loaders
- **Error boundaries**: Add React error boundaries for graceful failures
