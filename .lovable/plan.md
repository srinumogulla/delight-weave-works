

# Connect Vedha Mantra External API -- Complete Integration Plan

## Overview

This plan replaces the current Lovable Cloud (Supabase) backend with your external Vedha Mantra API (`https://api.vedhamantra.com`). It involves creating a full API client layer, replacing authentication, connecting all modules (Poojas, Gurus, Temples, Gifts, Live Streams, Notifications, Transactions, Analytics, WhatsApp, Admin), and updating every page to use the new API.

---

## Architecture

The new integration follows a layered approach:

```text
Pages/Components
       |
   React Query Hooks (useQuery / useMutation)
       |
   Module Services (poojas.ts, gurus.ts, etc.)
       |
   Base API Client (client.ts)
       |
   Vedha Mantra REST API
```

---

## Phase 1: API Client Foundation

### 1.1 Create Base Client
**New file:** `src/integrations/vedhaApi/client.ts`

- Read `VITE_API_BASE` from environment (fallback to `https://api.vedhamantra.com`)
- Auto-attach `Authorization: Bearer <token>` from `localStorage.getItem('access_token')`
- Global error handler: parse JSON errors, show toast on 4xx/5xx
- Handle 401 by clearing token and redirecting to `/login`
- Retry logic for network failures (1 retry with backoff)
- Export `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete` helper functions

### 1.2 Create Module Service Files
**New files in** `src/integrations/vedhaApi/`:

| File | Endpoints Covered |
|------|-------------------|
| `auth.ts` | signup, login, mobile send-code, mobile verify |
| `users.ts` | GET /users/me |
| `poojas.ts` | Full CRUD, image upload, schedule, link, notify, registrations |
| `gurus.ts` | Profile CRUD, analytics, earnings, list all |
| `temples.ts` | Profile, poojas CRUD, link, analytics |
| `gifts.ts` | Overview, occasions CRUD, presigned upload |
| `livestream.ts` | Start, stop, my streams |
| `notifications.ts` | List, unread count, mark read, mark all |
| `transactions.ts` | Create, my transactions |
| `analytics.ts` | Track event, list events |
| `whatsapp.ts` | Webhook verify, webhook receive |
| `admin.ts` | Users, Temples CRUD, Poojas CRUD, Dosha Tags, Mahavidyas, Gift Templates, Transactions, Analytics |
| `index.ts` | Re-export all modules |

Each file exports typed functions that call the base client. Example pattern:

```typescript
// poojas.ts
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './client';

export const listPoojas = () => apiGet('/content/poojas');
export const createPooja = (data: CreatePoojaPayload) => apiPost('/content/poojas', data);
export const updatePooja = (id: string, data: UpdatePoojaPayload) => apiPut(`/content/poojas/${id}`, data);
export const deletePooja = (id: string) => apiDelete(`/content/poojas/${id}`);
export const uploadPoojaImage = (id: string, file: File) => { /* multipart upload */ };
export const reschedulePooja = (id: string, data: SchedulePayload) => apiPatch(`/content/poojas/${id}/schedule`, data);
export const publishPoojaLink = (id: string, data: LinkPayload) => apiPatch(`/content/poojas/${id}/link`, data);
export const notifyPoojaLink = (id: string) => apiPost(`/content/poojas/${id}/link/notify`);
export const getPoojaRegistrations = (id: string) => apiGet(`/content/poojas/${id}/registrations`);
```

### 1.3 Create Type Definitions
**New file:** `src/integrations/vedhaApi/types.ts`

Define TypeScript interfaces for all API request/response shapes based on the API schema (User, Pooja, Guru, Temple, Gift, Transaction, Notification, etc.).

---

## Phase 2: Authentication System Replacement

### 2.1 Replace AuthProvider
**Modify:** `src/components/AuthProvider.tsx`

Current: Uses Supabase Auth (`supabase.auth.signUp`, `signInWithPassword`, `onAuthStateChange`)
New: Uses Vedha Mantra API endpoints

Key changes:
- `signUp` calls `POST /auth/signup`
- `signIn` calls `POST /auth/login`
- Store `access_token` in `localStorage`
- On mount, check `localStorage` for token, call `GET /users/me` to restore session
- `signOut` clears localStorage and resets state
- Add `sendMobileCode` and `verifyMobileCode` for mobile auth
- Store user role from `/users/me` response
- Remove all Supabase auth imports

### 2.2 Update Login Page
**Modify:** `src/pages/Login.tsx`

- Remove Supabase imports
- Use new `signIn` from AuthProvider
- Add mobile OTP login option (send code, verify code flow)
- Role-based redirect after login (admin goes to /admin, guru to /guru, etc.)

### 2.3 Update Signup Page
**Modify:** `src/pages/Signup.tsx`

- Replace Supabase signup with API `POST /auth/signup`
- Add phone number field for mobile signup option

### 2.4 Update Admin Login
**Modify:** `src/pages/admin/Login.tsx`

- Remove Supabase imports
- Use new auth system, check role from user profile

---

## Phase 3: Role-Based Routing Update

### 3.1 Update ProtectedRoute
**Modify:** `src/components/ProtectedRoute.tsx`

- Remove Supabase-based admin check
- Add support for multiple roles: `requireRole?: 'admin' | 'guru' | 'temple'`
- Check role from AuthProvider context
- Redirect unauthorized users to login

### 3.2 Update App.tsx Routes
**Modify:** `src/App.tsx`

- Update admin routes: `requireRole="admin"`
- Update pundit/guru routes: `requireRole="guru"`
- Update temple routes: `requireRole="temple"`
- Remove Supabase-specific imports

---

## Phase 4: Pooja Module (Full CRUD)

### 4.1 Update Services Page
**Modify:** `src/pages/Services.tsx`

- Replace hardcoded `servicesData` array with `useQuery` calling `listPoojas()`
- Show loading skeletons, error states

### 4.2 Update PoojaDetails Page
**Modify:** `src/pages/PoojaDetails.tsx`

- Fetch single pooja from API
- Show registrations count

### 4.3 Update Booking Flow
**Modify:** `src/pages/Booking.tsx`

- Create booking via `POST /transactions/` instead of Supabase insert

### 4.4 Update Admin Services Page
**Modify:** `src/pages/admin/Services.tsx`

- Full CRUD using admin API endpoints (`/jambalakadipamba/poojas`)
- Image upload, schedule, publish link functionality

---

## Phase 5: Guru (Pundit) Dashboard

### 5.1 Update Pundit Dashboard
**Modify:** `src/pages/pundit/Dashboard.tsx`

- Replace Supabase queries with:
  - `GET /gurus/me` for profile
  - `GET /gurus/analytics` for stats
  - `GET /gurus/earnings` for revenue data
- Keep accept/decline booking UI

### 5.2 Update Pundit Profile
**Modify:** `src/pages/pundit/Profile.tsx`

- Create/update guru profile via `POST /gurus/profile`
- Fetch profile via `GET /gurus/me`

### 5.3 Update Pundit Earnings
**Modify:** `src/pages/pundit/Earnings.tsx`

- Replace Supabase earnings queries with `GET /gurus/earnings`

### 5.4 Update Pundit Bookings
**Modify:** `src/pages/pundit/Bookings.tsx`

- Fetch bookings from guru-specific endpoint

---

## Phase 6: Temple Dashboard

### 6.1 Update Temple Dashboard
**Modify:** `src/pages/temple/Dashboard.tsx`

- Use `GET /temples/analytics/overview` for stats

### 6.2 Update Temple Services
**Modify:** `src/pages/temple/Services.tsx`

- Full CRUD via temple-specific pooja endpoints

### 6.3 Update Temple Profile
**Modify:** `src/pages/temple/Profile.tsx`

- Use `GET /temples/me` for profile data

---

## Phase 7: Gifts Module

### 7.1 Update Gift Pooja Flow
**Modify:** `src/pages/GiftPooja.tsx` and related step components

- Use `GET /gifts/overview` for gift options
- Use `GET /gifts/occasions` for occasion list
- File upload via presigned URL (`POST /gifts/uploads/presign`)

### 7.2 Update Admin Gift Management
**Modify:** `src/pages/admin/GiftBookings.tsx`

- Use admin gift template CRUD endpoints

---

## Phase 8: Live Stream Module

### 8.1 Create Live Stream Hooks
**New file:** `src/hooks/useLiveStream.ts`

- `useStartStream(poojaId)` -- POST /live-streams/poojas/{id}/start
- `useStopStream(poojaId)` -- POST /live-streams/poojas/{id}/stop
- `useMyStreams()` -- GET /live-streams/my

### 8.2 Add Live Stream UI
Integrate start/stop stream buttons into Guru and Temple dashboards for active poojas.

---

## Phase 9: Notifications Module

### 9.1 Create Notification Hook
**New file:** `src/hooks/useNotifications.ts`

- `useNotifications()` -- GET /notifications/me
- `useUnreadCount()` -- GET /notifications/me/unread-count
- `useMarkRead(id)` -- POST /notifications/{id}/read
- `useMarkAllRead()` -- POST /notifications/read-all

### 9.2 Add Notification Bell
Add notification bell icon to Header and mobile header showing unread count, with dropdown listing notifications.

---

## Phase 10: Transactions Module

### 10.1 Create Transaction Hooks
- `useCreateTransaction()` -- POST /transactions/
- `useMyTransactions()` -- GET /transactions/me

### 10.2 Update Profile Bookings
**Modify:** `src/pages/profile/ProfileBookings.tsx`

- Fetch user's transactions from API instead of Supabase

---

## Phase 11: Analytics Module

### 11.1 Create Analytics Service
- `trackEvent(data)` -- POST /analytics/events
- `listEvents()` -- GET /analytics/events

### 11.2 Integrate Event Tracking
Add tracking calls on key user actions (page views, bookings, etc.)

---

## Phase 12: WhatsApp Integration

### 12.1 Create WhatsApp Webhook Handler
This is a server-side concern. The existing WhatsApp button on the frontend stays. The webhook endpoints (`GET /webhooks/whatsapp` for verification, `POST /webhooks/whatsapp` for receiving) are handled by the external API server, not the frontend. No frontend changes needed beyond ensuring the WhatsApp button links correctly.

---

## Phase 13: Admin Panel (Full)

### 13.1 Update Admin Dashboard
**Modify:** `src/pages/admin/Dashboard.tsx`

- Replace all Supabase queries with admin analytics endpoints

### 13.2 Update Admin Users
**Modify:** `src/pages/admin/Users.tsx`

- Use `GET /jambalakadipamba/users` with pagination and filters

### 13.3 Update Admin Temples
**Modify:** `src/pages/admin/Temples.tsx`

- Full CRUD via `/jambalakadipamba/temples`

### 13.4 Update Admin Pundits
**Modify:** `src/pages/admin/Pundits.tsx`

- Use admin guru management endpoints

### 13.5 Update Admin Bookings
**Modify:** `src/pages/admin/Bookings.tsx`

- Use admin transaction/booking endpoints

### 13.6 Update Admin Reports
**Modify:** `src/pages/admin/Reports.tsx`

- Use `/jambalakadipamba/analytics/*` endpoints

### 13.7 New Admin Sections
Create new pages or tabs for:
- **Dosha Tags** CRUD (`/jambalakadipamba/dosha-tags`)
- **Mahavidyas** CRUD (`/jambalakadipamba/mahavidyas`)
- **Gift Templates** CRUD (`/jambalakadipamba/gift-templates`)

---

## Phase 14: Environment Configuration

### 14.1 Add Environment Variable
The API base URL will be stored as `VITE_API_BASE` in the codebase since it's a public URL (not a secret).

```typescript
// client.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.vedhamantra.com';
```

---

## Phase 15: Error Handling and Debugging

### 15.1 Global Error Handler in Client
- Log all API errors to console with request details
- Show user-friendly toast messages
- Handle 401 (token expired) by clearing auth and redirecting
- Handle 403 (forbidden) with appropriate message
- Handle 422 (validation errors) by showing field-specific errors
- Handle 500 (server error) with generic retry message

### 15.2 React Query Error Boundaries
Configure React Query with global error handler in QueryClient.

---

## Summary of All File Changes

### New Files (17 files)
| File | Purpose |
|------|---------|
| `src/integrations/vedhaApi/client.ts` | Base API client with auth token handling |
| `src/integrations/vedhaApi/types.ts` | TypeScript interfaces for all API entities |
| `src/integrations/vedhaApi/auth.ts` | Auth endpoints (signup, login, mobile) |
| `src/integrations/vedhaApi/users.ts` | User profile endpoint |
| `src/integrations/vedhaApi/poojas.ts` | Pooja CRUD + extras |
| `src/integrations/vedhaApi/gurus.ts` | Guru profile, analytics, earnings |
| `src/integrations/vedhaApi/temples.ts` | Temple profile, poojas, analytics |
| `src/integrations/vedhaApi/gifts.ts` | Gifts overview, occasions, upload |
| `src/integrations/vedhaApi/livestream.ts` | Live stream start/stop/list |
| `src/integrations/vedhaApi/notifications.ts` | Notifications CRUD |
| `src/integrations/vedhaApi/transactions.ts` | Transaction create/list |
| `src/integrations/vedhaApi/analytics.ts` | Event tracking |
| `src/integrations/vedhaApi/whatsapp.ts` | Webhook types (frontend reference) |
| `src/integrations/vedhaApi/admin.ts` | All admin endpoints |
| `src/integrations/vedhaApi/index.ts` | Re-exports |
| `src/hooks/useLiveStream.ts` | Live stream React Query hooks |
| `src/hooks/useNotifications.ts` | Notification hooks with unread count |

### Modified Files (25+ files)
| File | Change Summary |
|------|---------------|
| `src/components/AuthProvider.tsx` | Replace Supabase auth with API auth |
| `src/components/ProtectedRoute.tsx` | Add multi-role support |
| `src/App.tsx` | Update role-based route guards |
| `src/pages/Login.tsx` | Use API login + mobile OTP |
| `src/pages/Signup.tsx` | Use API signup |
| `src/pages/admin/Login.tsx` | Use API admin login |
| `src/pages/Services.tsx` | Fetch poojas from API |
| `src/pages/PoojaDetails.tsx` | Fetch single pooja from API |
| `src/pages/Booking.tsx` | Create transaction via API |
| `src/pages/GiftPooja.tsx` | Use gifts API |
| `src/pages/pundit/Dashboard.tsx` | Use guru API endpoints |
| `src/pages/pundit/Bookings.tsx` | Use guru bookings from API |
| `src/pages/pundit/Earnings.tsx` | Use guru earnings API |
| `src/pages/pundit/Profile.tsx` | Use guru profile API |
| `src/pages/temple/Dashboard.tsx` | Use temple analytics API |
| `src/pages/temple/Services.tsx` | Use temple poojas API |
| `src/pages/temple/Profile.tsx` | Use temple profile API |
| `src/pages/admin/Dashboard.tsx` | Use admin analytics API |
| `src/pages/admin/Users.tsx` | Use admin users API |
| `src/pages/admin/Services.tsx` | Use admin poojas API |
| `src/pages/admin/Bookings.tsx` | Use admin transactions API |
| `src/pages/admin/Temples.tsx` | Use admin temples API |
| `src/pages/admin/Reports.tsx` | Use admin analytics API |
| `src/pages/profile/ProfileBookings.tsx` | Use transactions API |
| `src/components/Header.tsx` | Add notification bell |

---

## Implementation Order

1. **Phase 1** -- API Client Foundation (all new files in vedhaApi/)
2. **Phase 2** -- Authentication System (AuthProvider, Login, Signup)
3. **Phase 3** -- Role-Based Routing (ProtectedRoute, App.tsx)
4. **Phase 4** -- Pooja Module (Services, PoojaDetails, Booking)
5. **Phase 5** -- Guru Dashboard (all pundit pages)
6. **Phase 6** -- Temple Dashboard (all temple pages)
7. **Phase 7** -- Gifts Module
8. **Phase 8** -- Live Stream Module
9. **Phase 9** -- Notifications Module
10. **Phase 10** -- Transactions Module
11. **Phase 11** -- Analytics Module
12. **Phase 12** -- WhatsApp (no frontend changes needed)
13. **Phase 13** -- Admin Panel (all admin pages)
14. **Phase 14-15** -- Environment config and error handling (woven throughout)

---

## Important Notes

- The existing Lovable Cloud database will remain connected but will no longer be used for auth or data. All reads/writes go through the external API.
- The Supabase client file (`src/integrations/supabase/client.ts`) will NOT be deleted (it's auto-generated), but imports to it will be removed from all pages.
- Since the OpenAPI schema URL was not directly accessible, type definitions will be created based on your endpoint specifications. If you can share the raw OpenAPI JSON content, types can be auto-generated more precisely.
- The `VITE_API_BASE` variable is a public URL and will be stored directly in the codebase.

