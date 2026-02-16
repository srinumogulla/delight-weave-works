

# Signup Fix + Frontend Code Reorganization

This plan covers two tasks: fixing the blank page issue on signup, and reorganizing the frontend code into cleaner domain-based folders.

---

## Part 1: Fix Signup "Blank Page" Issue

### Root Cause Analysis

The signup form sends data to `POST /auth/signup` via `apiPost` (JSON). Several issues can cause a blank page:

1. **Missing `birth_place_name` field**: The backend Pydantic schema likely expects `birth_place_name` (per the memory about API field mapping), but the frontend sends `birth_location`. This 422 error may crash React since there's no error boundary.

2. **Unhandled API error crashing React**: If the signup API throws and the error isn't caught cleanly, React can white-screen.

3. **Date of Birth field**: The `CityAutocomplete` component doesn't have a native `required` attribute, but the `<Input type="date">` does. If users skip it, the form silently blocks submission.

### Fixes

**File: `src/pages/Signup.tsx`**
- Map `birth_location` to `birth_place_name` in the signup payload to match the backend schema
- Add `try/catch` safety around the entire submit handler to prevent React crashes
- Remove `required` from the date `<Input>` since custom validation in `handleSubmit` already checks for it (prevents silent native validation blocking)

**File: `src/integrations/vedhaApi/types.ts`**
- Update `SignupPayload` to use `birth_place_name` instead of `birth_location` to match the backend schema

**File: `src/components/AuthProvider.tsx`**
- Ensure `fetchUser()` errors are caught cleanly and don't propagate to crash React

---

## Part 2: Code Reorganization

Move files into domain-based subfolders as requested. This is a purely structural change -- no functionality changes.

### Files to Move (with updated imports across all consuming files)

**API Layer** (`src/integrations/vedhaApi/` -> `src/api/`)
- Move all 13 files: `client.ts`, `types.ts`, `auth.ts`, `poojas.ts`, `gurus.ts`, `temples.ts`, `gifts.ts`, `livestream.ts`, `notifications.ts`, `transactions.ts`, `analytics.ts`, `admin.ts`, `users.ts`, `whatsapp.ts`, `index.ts`
- Update all imports from `@/integrations/vedhaApi/...` to `@/api/...`

**Components reorganization** (move from flat `src/components/` into subfolders):

| New Folder | Files Moving In |
|-----------|----------------|
| `components/layout/` | `Header.tsx`, `Footer.tsx`, `BackgroundPattern.tsx` |
| `components/home/` | `HeroSection.tsx`, `FeaturesSection.tsx`, `CorePrinciplesSection.tsx`, `HowItWorks.tsx`, `HowItWorksTimeline.tsx`, `Testimonials.tsx`, `WhyOnlinePooja.tsx`, `FAQ.tsx`, `TempleGateIntro.tsx`, `UpcomingRituals.tsx` |
| `components/services/` | `ServiceCard.tsx`, `ServiceFilters.tsx`, `PoojaListingCard.tsx`, `PoojaFilters.tsx` |
| `components/booking/` | `PaymentStep.tsx`, `EventCard.tsx` |
| `components/panchang/` | `PanchangCalendar.tsx`, `PanchangSection.tsx`, `MuhuratFinder.tsx`, `NorthIndianChart.tsx`, `FestivalList.tsx` |
| `components/temple/` | `TempleCard.tsx`, `TempleLayout.tsx` (merge with existing `temple/`) |
| `components/pundit/` | `PunditCard.tsx`, `PunditLayout.tsx` (merge with existing `pundit/`) |
| `components/shared/` | `WhatsAppButton.tsx`, `LanguageSwitcher.tsx`, `NavLink.tsx`, `ProtectedRoute.tsx` |
| `components/mobile/` | Already organized (keep as-is) |
| `components/admin/` | Already organized (keep as-is) |
| `components/ui/` | Already organized (keep as-is) |

**Auth** (`src/components/AuthProvider.tsx` -> `src/auth/AuthProvider.tsx`)

### Import Updates Required

Every file that imports from the moved locations will need import path updates. This affects approximately 40-50 files including:
- `src/App.tsx` (imports Header, Footer, AuthProvider, WhatsAppButton, ProtectedRoute)
- `src/pages/Index.tsx` (imports home section components)
- `src/pages/Services.tsx` (imports service components)
- All pages importing Header/Footer
- All API consumers importing from `@/integrations/vedhaApi/`

### Files Kept As-Is
- `src/integrations/supabase/` -- auto-generated, never touch
- `src/components/ui/` -- shadcn components, already organized
- `src/hooks/` -- small set, already organized
- `src/i18n/` -- already organized
- `src/pages/` -- already has good subfolder organization

---

## Implementation Order

1. Fix signup payload field mapping and error handling (Part 1) -- small, critical fix
2. Create new folder structure and move API files (Part 2a)
3. Move components into domain subfolders (Part 2b)
4. Move AuthProvider to `src/auth/` (Part 2c)
5. Update all import paths across consuming files (Part 2d)
6. Verify build passes with no broken imports

## Estimated Scope
- ~15 new files created (moved files in new locations)
- ~15 old files deleted (original locations)
- ~50 files with import path updates
- 0 functionality changes
