
# Switch Frontend to Your Existing Database

## The Problem

The frontend currently points to the empty Lovable Cloud database (`uuunmenwafhrifatepjm`). Your real data — devotees, bookings, temples, poojas — lives in your existing project (`thogujcdmhlalroftpmi`). 

The auto-generated files (`src/integrations/supabase/client.ts` and `.env`) cannot be edited directly — Lovable Cloud overwrites them. So the switch requires a wrapper approach.

## The Solution: Client Override Shim

Create a new file `src/lib/supabase.ts` that creates a Supabase client directly pointing to your existing project using hardcoded credentials (the anon key is public/safe for frontend code). Then update all 40 files that currently import from `@/integrations/supabase/client` to import from `@/lib/supabase` instead.

Your existing project's credentials:
- URL: `https://thogujcdmhlalroftpmi.supabase.co`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRob2d1amNkbWhsYWxyb2Z0cG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjAxNDYsImV4cCI6MjA4MzI5NjE0Nn0.sIiIknYtewJwmYzmAa4Kzdi1Oo5rnUNXC2vvo-xwY70`

## Files to Create / Modify

### 1. CREATE `src/lib/supabase.ts` (new file)

A new Supabase client pointing directly to your existing project. This is the single source of truth for the database connection going forward.

```ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thogujcdmhlalroftpmi.supabase.co';
const SUPABASE_ANON_KEY = '<anon key>';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 2. UPDATE all 40 files that import `supabase` — swap import path

Every file that has:
```ts
import { supabase } from '@/integrations/supabase/client';
```
or
```ts
import { supabase } from "@/integrations/supabase/client";
```
will be changed to:
```ts
import { supabase } from '@/lib/supabase';
```

**Full list of affected files (40 total):**

**API layer (12 files):**
- `src/api/admin.ts`
- `src/api/analytics.ts`
- `src/api/astrology.ts`
- `src/api/gifts.ts`
- `src/api/gurus.ts`
- `src/api/livestream.ts`
- `src/api/notifications.ts`
- `src/api/poojas.ts`
- `src/api/temples.ts`
- `src/api/transactions.ts`
- `src/api/users.ts`
- `src/api/whatsapp.ts`

**Auth (1 file):**
- `src/auth/AuthProvider.tsx`

**Hooks (3 files):**
- `src/hooks/useSavedItems.ts`
- `src/hooks/usePushNotifications.ts`
- `src/hooks/useSearch.ts`

**Pages (24 files):**
- `src/pages/Payment.tsx`
- `src/pages/Panchang.tsx`
- `src/pages/Pundits.tsx`
- `src/pages/Temples.tsx`
- `src/pages/TempleDetails.tsx`
- `src/pages/GiftConfirmation.tsx`
- `src/pages/pooja/Dashachara.tsx`
- `src/pages/pooja/Vamachara.tsx`
- `src/pages/community/Events.tsx`
- `src/pages/profile/ProfileDetails.tsx`
- `src/pages/profile/ProfileSaved.tsx`
- `src/pages/profile/ProfileSpiritual.tsx`
- `src/pages/pundit/Bookings.tsx`
- `src/pages/temple/Bookings.tsx`
- `src/pages/admin/Approvals.tsx`
- `src/pages/admin/Bookings.tsx`
- `src/pages/admin/Events.tsx`
- `src/pages/admin/GiftBookings.tsx`
- `src/pages/admin/Pundits.tsx`
- Plus remaining admin pages: Users, Services, Temples, Reports, Settings, Dashboard

**Components (1 file):**
- `src/components/panchang/PanchangSection.tsx`

### 3. Edge Functions — No change needed

The 3 edge functions (`astrology`, `send-whatsapp`, `admin-operations`) are deployed on the Lovable Cloud project and use `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` secrets internally. Since the frontend is now calling a different auth provider, edge function calls via `supabase.functions.invoke()` from the new client will route to your existing project's edge functions (none deployed there yet — but function calls will fail gracefully rather than cause auth errors).

Note: If you want edge functions (Kundali/WhatsApp) to work, those functions will need to be set up on your existing project as well. That can be handled as a separate step.

### 4. TypeScript Types — No breaking changes

The existing `src/integrations/supabase/types.ts` was generated from the Lovable Cloud project which has the same schema (profiles, bookings, pundits, temples, etc.) as your existing project since the migrations were written to match. The new client will work without type errors since the schema is identical.

## What This Achieves

After the switch:
- Login/signup will authenticate against your existing project's real user accounts
- All data (temples, poojas, bookings, pundits) will come from your production database
- No data loss — existing devotee accounts and bookings are preserved
- The Lovable Cloud project remains active (for migrations tooling) but is no longer the active database

## Risk / Caveats

- The anon key is embedded in source code. Since it is a public/read-safe key (not the service role key), this is acceptable for frontend apps — it is equivalent to what every Supabase-powered frontend does.
- Edge function calls (`astrology`, `send-whatsapp`) will need to be pointed at your existing project's edge function URL. This is a secondary step.
- RLS policies on your existing project must allow the same operations the app expects — since your existing project had a working FastAPI backend, the RLS policies may be more restrictive or structured differently. Any policy mismatches will show up as empty data or silent errors after the switch.

## Implementation Order

1. Create `src/lib/supabase.ts` with the new client
2. Update all 40 import paths in a single pass
3. Verify the app loads and shows data from your real database
