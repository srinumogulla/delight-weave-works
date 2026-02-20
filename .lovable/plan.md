
# Fix Root Cause: All Requests Go to Wrong Database

## The Problem

Every single auth call, database read, and database write is going to **the wrong backend project**. The network logs confirm it:
```
POST https://thogujcdmhlalroftpmi.supabase.co/auth/v1/token → 400 Invalid credentials
```

`thogujcdmhlalroftpmi` is an old/external Supabase project. Your actual Lovable Cloud project is `uuunmenwafhrifatepjm`. The correct auto-generated client already exists at `src/integrations/supabase/client.ts` and points to the right project — it just isn't being used.

`src/lib/supabase.ts` is a stale file with a hardcoded wrong URL, and 25 files across the codebase import from it instead of the correct client.

## Why Login Always Returns 400

```
demo@gmail.com / 123456789 → hits thogujcdmhlalroftpmi → "Invalid credentials"
```

The user `demo@gmail.com` likely exists in the Lovable Cloud project (`uuunmenwafhrifatepjm`) but NOT in the old external project. So the password check fails every time.

## Files to Update (25 files)

All 25 files that import `from '@/lib/supabase'` need to be changed to import `from '@/integrations/supabase/client'`. This is a mechanical find-and-replace across:

**Auth & Core:**
- `src/auth/AuthProvider.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/Login.tsx` (if applicable)

**API layer:**
- `src/api/poojas.ts`
- `src/api/gifts.ts`
- `src/api/users.ts`
- `src/api/gurus.ts`
- `src/api/analytics.ts`
- `src/api/admin.ts`

**Pages:**
- `src/pages/Booking.tsx`
- `src/pages/admin/Bookings.tsx`
- `src/pages/admin/Approvals.tsx`
- `src/pages/admin/GiftBookings.tsx`
- `src/pages/pundit/Bookings.tsx`
- `src/pages/temple/Bookings.tsx`
- `src/pages/profile/ProfileSaved.tsx`

**Components:**
- `src/components/admin/AdminLayout.tsx`

**Hooks:**
- `src/hooks/useSearch.ts`
- `src/hooks/useSavedItems.ts`
- `src/hooks/usePushNotifications.ts`

**And any remaining files from the full list of 25**

## What Changes in Each File

Each file only needs one line changed:

```ts
// Before (wrong project):
import { supabase } from '@/lib/supabase';

// After (correct Lovable Cloud project):
import { supabase } from '@/integrations/supabase/client';
```

The `supabase` export name is identical in both files, so no other code changes are needed — just the import path.

## After This Fix

- `demo@gmail.com` login will hit the correct project → login succeeds
- Profile reads/writes go to the correct database → profiles are found
- Role-based redirects work (admin → `/admin`, pundit → `/pundit`)
- Forgot password emails come from the correct project

## What Stays the Same

- `src/lib/lovableEdgeFunctions.ts` — this file already correctly calls the Lovable Cloud edge functions by direct URL, so no change needed there
- `src/integrations/supabase/client.ts` — auto-generated, never touched
- All component logic and UI — no changes needed
