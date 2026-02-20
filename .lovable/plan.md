
# Fix: Schema Mismatches, Missing Trigger, Demo Admin User & Login Flow

## Root Cause Analysis

After a full investigation, here are all the issues found:

### Issue 1: `handle_new_user` Trigger Still Missing
The database confirms **zero triggers exist**. The `handle_new_user()` function is there but is never called. This means new signups do NOT auto-create a profile row. The current workaround in `AuthProvider.tsx` (upsert on missing profile) partially handles this but it runs client-side with the anon key — it can race with RLS policies.

### Issue 2: `src/lib/supabase.ts` Still Hardcodes the Wrong Project
The file `src/lib/supabase.ts` still points to `thogujcdmhlalroftpmi` (the old backend). While the previous migration updated all import paths to use `@/integrations/supabase/client`, this old file still exists and **could still be imported** by mistake in future edits. It should be pointed to the correct project or have its content replaced.

### Issue 3: `demo@gmail.com` Exists but Password is Unknown
The user `demo@gmail.com` (id: `f49cdb77-...`) **exists in auth.users** and **has an admin role** in `user_roles`. The 400 error is definitively a wrong password — not a code bug. We need to **set a known password** for this user so you can test admin login.

### Issue 4: `app_role` Enum Has Extra Values Not Used in Code
The database enum has: `admin`, `moderator`, `user`, `pundit`, `temple`, `field_officer`. The code only handles `admin`, `user`, `pundit`/`guru`, `temple`. The `moderator` and `field_officer` roles exist in the enum but are unused — this is fine, but `ProtectedRoute` should be aware.

### Issue 5: `getAdminAnalytics` Has a Schema Mismatch
The `AdminAnalytics` type in `types.ts` has `total_gurus`, but `getAdminAnalytics()` returns `total_gurus` while `AdminDashboard` reads `data?.total_poojas` and `data?.total_services` — these keys don't exist in the returned object. The dashboard stats for "Pooja Services" and "Pending Approvals" always show 0.

### Issue 6: `getAdminAnalytics` Missing Key Counts
The function doesn't count:
- Gift bookings (`gift_bookings` table)
- Pending bookings (status = 'pending')
- Pending pundit approvals (approval_status = 'pending')
- Total active pooja services

### Issue 7: `getAdminTransactions` Join Shape Mismatch
The booking query joins `profiles(full_name, email)` but the `Booking` interface in `Bookings.tsx` also expects `profiles.phone`. The join needs to include `phone`.

---

## Fixes Required

### Fix 1: Database Migration — Attach `handle_new_user` Trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Fix 2: Set Password for `demo@gmail.com` via Admin Operations Edge Function
The `admin-operations` edge function already has the service role key. We'll add a `reset_password` action to it, or use a direct SQL approach to update the encrypted password. Since we can't run arbitrary SQL through the migration tool for data changes, we'll use the admin-operations edge function to call `auth.admin.updateUserById`.

Actually, the cleanest approach: create a new demo admin user via a database migration that calls `auth.users` insert. But that requires password hashing.

**Better approach**: Use the `admin-operations` edge function with a new `set_password` action to call `supabase.auth.admin.updateUserById(userId, { password: 'newpassword' })`. We'll deploy this and invoke it once.

### Fix 3: Fix `getAdminAnalytics` to Return All Required Fields
Update the function to also query:
- `pooja_services` count (active)
- `bookings` count where status = 'pending'
- `pundits` count where approval_status = 'pending'
- `gift_bookings` count

### Fix 4: Fix `getAdminTransactions` Join to Include Phone
Change the select to include `phone` in the profiles join.

### Fix 5: Fix `src/lib/supabase.ts` to Use Correct Project
Replace the hardcoded old URL with the correct environment variables so it matches the real project. This prevents any accidental future import from pointing to the wrong database.

---

## Implementation Steps

### Step 1: Database Migration (trigger)
Run a migration to attach `on_auth_user_created` trigger to `auth.users`.

### Step 2: Update `admin-operations` Edge Function
Add a `set_admin_password` action so we can set `demo@gmail.com`'s password to a known value (e.g., `Admin@1234`).

### Step 3: Deploy edge function and invoke it once to set the demo password

### Step 4: Fix `src/api/admin.ts` — `getAdminAnalytics`
Add missing counts for pooja services, pending bookings, pending pundits, and gift bookings.

### Step 5: Fix `src/api/admin.ts` — `getAdminTransactions`
Add `phone` to the profiles join.

### Step 6: Fix `src/lib/supabase.ts`
Replace the hardcoded wrong URL with the correct Lovable Cloud project credentials using env vars.

---

## What Will Work After These Fixes

| Feature | Before | After |
|---|---|---|
| Login with `demo@gmail.com` | ❌ 400 wrong password | ✅ Works with `Admin@1234` |
| New signups auto-create profile | ❌ No trigger | ✅ Trigger fires |
| Admin dashboard stats | ❌ Pooja Services/Approvals always 0 | ✅ All counts correct |
| Bookings table with phone | ❌ Missing phone data | ✅ Phone shown |
| `src/lib/supabase.ts` imports | ❌ Wrong project if accidentally imported | ✅ Correct project |

---

## Technical Details

### `getAdminAnalytics` Fix (before/after)

**Before** — missing fields:
```ts
return {
  total_users, total_bookings, total_revenue,
  total_temples, total_gurus   // <-- dashboard reads total_poojas, total_services → undefined → 0
};
```

**After** — all fields the dashboard needs:
```ts
return {
  total_users, total_bookings, total_revenue,
  total_temples, total_gurus,
  total_poojas: poojaCount,       // dashboard reads this
  pending_bookings: pendingCount, // dashboard reads this
  pending_approvals: pendingPundits, // dashboard reads this
  gift_bookings: giftCount,       // dashboard reads this
};
```

### Admin Login Credentials After Fix
- **Email**: `demo@gmail.com`
- **Password**: `Admin@1234`
