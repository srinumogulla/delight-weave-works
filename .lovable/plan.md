
# Continue API Migration -- Admin Panel + Public Pages + Profile

## What's Already Done
- API client foundation (all vedhaApi service files)
- Authentication system (AuthProvider, Login, Signup)
- Role-based routing (ProtectedRoute, App.tsx)
- Pundit portal pages (Dashboard, Bookings, Earnings, Profile)
- Temple portal pages (Dashboard, Services, Profile, Bookings)
- Notification and LiveStream hooks

## What Still Needs Migration

### Part A: Admin Panel Pages (6 files)

#### 1. Admin Dashboard (`src/pages/admin/Dashboard.tsx`)
- Replace all `supabase.from(...)` queries with `getAdminAnalytics()` from vedhaApi
- Stats will come from `GET /jambalakadipamba/analytics/overview`
- Recent bookings from admin transactions endpoint
- Booking trend from `GET /jambalakadipamba/analytics/revenue`
- Remove `supabase` import entirely

#### 2. Admin Users (`src/pages/admin/Users.tsx`)
- Replace `supabase.from('profiles')` with `getAdminUsers()` from vedhaApi
- Remove role management via Supabase -- use admin API endpoints
- Remove `toggleUserDisabled` Supabase call -- use admin API
- Keep the existing table/card UI, just swap data source

#### 3. Admin Bookings (`src/pages/admin/Bookings.tsx`)
- Replace `supabase.from('bookings')` with `getAdminTransactions()` from vedhaApi
- Replace `updateBookingStatus` and `assignPundit` with admin API calls
- Remove verified pundits query from Supabase

#### 4. Admin Services (`src/pages/admin/Services.tsx`)
- Replace `supabase.from('pooja_services')` with `getAdminPoojas()` / `createAdminPooja()` / `updateAdminPooja()` / `deleteAdminPooja()` from vedhaApi
- Image upload via admin API endpoint
- Remove `supabase` import

#### 5. Admin Temples (`src/pages/admin/Temples.tsx`)
- Replace `supabase.from('temples')` with `getAdminTemples()` / `createAdminTemple()` / `updateAdminTemple()` / `deleteAdminTemple()` from vedhaApi
- Remove `supabase` import

#### 6. Admin Reports (`src/pages/admin/Reports.tsx`)
- Replace all `supabase` analytics queries with `getAdminAnalyticsRevenue()` and `getAdminAnalyticsUsers()` from vedhaApi
- Remove `supabase` import

### Part B: Public Pages (3 files)

#### 7. Services Page (`src/pages/Services.tsx`)
- Replace hardcoded `servicesData` array with `useQuery` calling `listPoojas()` from vedhaApi
- Map API response fields to existing `Service` type
- Show loading skeletons while fetching
- Keep existing filter/sort UI, just change data source

#### 8. Pooja Details (`src/pages/PoojaDetails.tsx`)
- Replace `supabase.from('pooja_services')` with a single pooja fetch from vedhaApi (e.g., `listPoojas()` filtered by ID, or a dedicated endpoint if available)
- Remove `supabase` import

#### 9. Gift Pooja (`src/pages/GiftPooja.tsx`)
- Replace `supabase` calls with `getGiftsOverview()`, `getGiftOccasions()`, and `presignGiftUpload()` from vedhaApi
- Remove `supabase` import

### Part C: Profile Page (1 file)

#### 10. Profile Bookings (`src/pages/profile/ProfileBookings.tsx`)
- Replace `supabase.from('bookings')` with `getMyTransactions()` from vedhaApi
- Remove `supabase` import

### Part D: Admin Layout (`src/components/admin/AdminLayout.tsx`)
- Replace pending approvals count query (currently `supabase.from('pundits')`) with an admin API call
- Remove `supabase` import

---

## Technical Approach

For each file, the pattern is the same:
1. Remove `import { supabase } from '@/integrations/supabase/client'`
2. Add `import { relevantFunction } from '@/integrations/vedhaApi'`
3. Replace `supabase.from('table').select(...)` with `useQuery({ queryFn: () => apiFunction() })`
4. Replace mutations (insert/update/delete) with `useMutation({ mutationFn: () => apiFunction() })`
5. Keep all existing UI components and layouts unchanged

## Files Changed (11 total)

| File | Change |
|------|--------|
| `src/pages/admin/Dashboard.tsx` | Replace Supabase queries with admin analytics API |
| `src/pages/admin/Users.tsx` | Replace Supabase queries with admin users API |
| `src/pages/admin/Bookings.tsx` | Replace Supabase queries with admin transactions API |
| `src/pages/admin/Services.tsx` | Replace Supabase queries with admin poojas API |
| `src/pages/admin/Temples.tsx` | Replace Supabase queries with admin temples API |
| `src/pages/admin/Reports.tsx` | Replace Supabase queries with admin analytics API |
| `src/pages/Services.tsx` | Replace hardcoded data with listPoojas() API call |
| `src/pages/PoojaDetails.tsx` | Replace Supabase query with vedhaApi call |
| `src/pages/GiftPooja.tsx` | Replace Supabase queries with gifts API |
| `src/pages/profile/ProfileBookings.tsx` | Replace Supabase query with getMyTransactions() |
| `src/components/admin/AdminLayout.tsx` | Replace pending count Supabase query with admin API |

## Implementation Order
1. Admin Layout (pending count fix)
2. Admin Dashboard
3. Admin Users, Bookings, Services, Temples, Reports (in parallel)
4. Public Services page
5. Pooja Details
6. Gift Pooja
7. Profile Bookings
