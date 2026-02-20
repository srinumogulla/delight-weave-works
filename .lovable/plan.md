
# Migrate Backend from FastAPI to Lovable Cloud

## What "Remove the Backend" Means

The external FastAPI server at `api.vedhamantra.com` is being decommissioned. All auth, user management, data (poojas, bookings, temples, pundits, etc.) must now be served by the Lovable Cloud backend that is already connected to this project. The good news is that the database schema already exists in Lovable Cloud — tables like `profiles`, `poojas`, `bookings`, `pundits`, `temples` are all already there.

The work is to replace every call in `src/api/` that goes to `api.vedhamantra.com` with direct Lovable Cloud (Supabase) calls.

---

## Scope of Changes

### Layer 1: Authentication (Highest Priority)

Currently auth uses `localStorage` tokens + the external `/auth/login`, `/auth/signup` endpoints.

**New approach:** Use Lovable Cloud's built-in auth system directly with the Supabase client. This is email/password signup and login using `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`.

The `profiles` table already exists and stores: `full_name`, `email`, `phone`, `date_of_birth`, `time_of_birth`, `birth_location`, `gender`, `gotra`, `nakshatra`, `rashi`, `avatar_url`.

**Files to rewrite:**
- `src/auth/AuthProvider.tsx` — switch from `localStorage` tokens + REST calls to Supabase auth session listener (`onAuthStateChange`). Role comes from `user_roles` table (already exists in schema).
- `src/api/auth.ts` — no longer needed, can be deleted
- `src/api/users.ts` — replace `/users/me` with `supabase.from('profiles').select()`
- `src/api/client.ts` — remove `API_BASE`, token injection; the Supabase JS client handles auth automatically

**Signup flow change:** After `supabase.auth.signUp()`, extra profile data (DOB, birth location, phone, gender) gets inserted into the `profiles` table. The `handle_new_user` trigger already creates the profile row automatically on signup.

**Mobile OTP:** Replace AuthKey SMS with Supabase's built-in phone OTP (requires phone auth to be enabled in Lovable Cloud auth settings). If not enabled, we gracefully remove this tab and note it can be added later.

**Role detection:** The `user_roles` table already exists with `app_role` enum (`admin`, `user`, `pundit`, `temple`). After signup, the role is inserted into `user_roles`. Admin assignment remains manual.

### Layer 2: Data APIs

All `src/api/` modules currently call `api.vedhamantra.com`. They will be rewritten to use `supabase.from(table)` directly.

| API module | Old endpoint | New Lovable Cloud call |
|---|---|---|
| `poojas.ts` | `/content/poojas` | `supabase.from('pooja_services')` |
| `gurus.ts` | `/gurus` | `supabase.from('pundits')` |
| `temples.ts` | `/temples` | `supabase.from('temples')` |
| `admin.ts` | `/jambalakadipamba/...` | `supabase.from(table)` with service role via edge function |
| `transactions.ts` | `/transactions` | `supabase.from('bookings')` |
| `notifications.ts` | `/notifications` | `supabase.from('notification_preferences')` |
| `analytics.ts` | `/analytics` | Aggregate queries on existing tables |
| `gifts.ts` | `/gifts` | `supabase.from('gift_bookings')` |
| `livestream.ts` | `/live-streams` | Edge function (YouTube integration) |
| `whatsapp.ts` | `/whatsapp` | Edge function |

### Layer 3: Admin Panel

The admin pages currently call `/jambalakadipamba/...`. These will be switched to direct Supabase queries. Admin identity is confirmed via the `user_roles` table (`role = 'admin'`). Sensitive admin operations (deleting users, bulk operations) will go through a `admin-operations` edge function with service-role key.

### Layer 4: External Integrations (Astrology, WhatsApp, YouTube, SMS)

These still need to call external APIs. Since the backend is removed, these will be handled by **Lovable Cloud edge functions** with secrets stored securely.

**Secrets needed in Lovable Cloud:**
- `ASTROLOGY_API_USER_ID` + `ASTROLOGY_API_KEY` (for Kundali)
- `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` (for notifications)
- `AUTHKEY_API_KEY` + `AUTHKEY_SENDER_ID` (for SMS OTP)
- `YOUTUBE_CLIENT_ID` + `YOUTUBE_CLIENT_SECRET` (for live streams)

---

## Files Changed Summary

| File | Change |
|---|---|
| `src/auth/AuthProvider.tsx` | Full rewrite: Supabase auth sessions instead of localStorage tokens |
| `src/api/client.ts` | Remove; Supabase client replaces it |
| `src/api/auth.ts` | Remove; Supabase auth replaces it |
| `src/api/users.ts` | Rewrite: query `profiles` table |
| `src/api/poojas.ts` | Rewrite: query `pooja_services` table |
| `src/api/gurus.ts` | Rewrite: query `pundits` table |
| `src/api/temples.ts` | Rewrite: query `temples` table |
| `src/api/admin.ts` | Rewrite: direct queries + admin edge function |
| `src/api/transactions.ts` | Rewrite: query `bookings` table |
| `src/api/notifications.ts` | Rewrite: query `notification_preferences` table |
| `src/api/analytics.ts` | Rewrite: aggregate queries |
| `src/api/gifts.ts` | Rewrite: query `gift_bookings` table |
| `src/api/livestream.ts` | Rewrite: edge function |
| `src/api/whatsapp.ts` | Rewrite: edge function |
| `src/api/astrology.ts` | Rewrite: edge function |
| `src/pages/Login.tsx` | Update mobile OTP tab to use Supabase phone auth |
| `src/pages/Signup.tsx` | Update to write extra profile data after Supabase signUp |
| `supabase/functions/astrology/index.ts` | New: proxy to AstrologyAPI |
| `supabase/functions/send-whatsapp/index.ts` | New: WhatsApp message sender |
| `supabase/functions/admin-operations/index.ts` | New: admin-only service-role operations |

---

## Technical Notes

- The `profiles` table already has all the fields needed for `ApiUser` (`full_name`, `email`, `phone`, `date_of_birth`, `time_of_birth`, `birth_location`, `gender`, `gotra`, `nakshatra`, `rashi`, `avatar_url`).
- The `handle_new_user` trigger already creates a `profiles` row on signup — we just need to update it afterward with the extra fields (DOB, birth location, etc.).
- Role-based access control moves to `user_roles` table + RLS policies (already exist in the schema).
- The `isAdmin` check in `AuthProvider` will query `user_roles` table instead of the `/users/me` role field.
- All pages using `useAuth()` will continue working since the `AuthContextType` interface stays identical — only the implementation changes.
- The `ProtectedRoute` component needs no changes since it reads from the same context shape.

---

## Implementation Order

1. Rewrite `AuthProvider` and auth flow (unblocks everything else)
2. Rewrite `src/api/` modules to Supabase queries
3. Create edge functions for Astrology, WhatsApp, YouTube
4. Add secrets to Lovable Cloud for those integrations
5. Update admin pages to use new API layer
6. Test signup → login → protected route → pundit/admin dashboard flows
