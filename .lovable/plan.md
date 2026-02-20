
# Fix Login, Signup, and Edge Function Issues

## Root Cause Analysis

There are **four distinct problems** identified from the console errors and code review:

---

### Problem 1 — Login uses a stale `role` value (redirect always goes to `/`)

In `src/pages/Login.tsx` (lines 54–56 and 81–82), after `signIn()` succeeds, the code does:
```ts
setTimeout(() => {
  redirectByRole(role);  // <-- stale! role is still null at this moment
}, 300);
```
The `role` captured in the closure is whatever it was **before** login (i.e., `null`). The `onAuthStateChange` in `AuthProvider` loads the profile and sets the real role asynchronously — but `Login.tsx` doesn't wait for it. So every user gets sent to `/` regardless of their actual role.

**Fix**: Replace the `setTimeout` + stale `role` pattern with a `useEffect` that watches the `role` from `useAuth()` and navigates when it becomes available after a successful sign-in.

---

### Problem 2 — Signup creates Auth users but NOT profiles or user_roles (503 errors)

The `src/auth/AuthProvider.tsx` `signUp()` function does:
1. `supabase.auth.signUp()` — **succeeds** (user appears in Auth dashboard) ✓
2. `supabase.from('profiles').update(...)` — **503 Service Unavailable** ✗
3. `supabase.from('user_roles').insert(...)` — **503 Service Unavailable** ✗

The 503s come from the **existing Supabase project** (`thogujcdmhlalroftpmi`). This happens because:
- The `handle_new_user` trigger function exists in the database **schema definition** but the `<db-triggers>` section confirms: **"There are no triggers in the database."** — so the trigger is never attached and the `profiles` row is never created automatically.
- Without a `profiles` row existing first, the `UPDATE` step silently does nothing (UPDATE on non-existent row = 0 rows affected).
- The `user_roles` INSERT returns 503 because the external project's REST API may be temporarily unavailable or rate-limiting, OR because the RLS policy blocks the insert when the profile hasn't been created yet.

**Fix**:
1. In `signUp()`, replace the `UPDATE` on profiles with an **`UPSERT`** — this will create the row if it doesn't exist, or update it if it does. This handles the case where the trigger may or may not have run.
2. Add retry logic and better error handling for the `user_roles` insert.
3. Create the missing `handle_new_user` **trigger** (not just the function) via a migration on the Lovable Cloud project — but since the actual DB is `thogujcdmhlalroftpmi`, this needs to be done there. Instead, the code-side fix (upsert) is the reliable approach.

---

### Problem 3 — Edge function calls go to wrong project

The `supabase.functions.invoke('get-panchang', ...)` call in `PanchangSection.tsx` uses the `supabase` client from `@/lib/supabase`, which now points to `thogujcdmhlalroftpmi`. But the `get-panchang` edge function is deployed on the **Lovable Cloud project** (`uuunmenwafhrifatepjm`). So the call goes to the wrong project → CORS error because no function exists there to respond.

**Fix**: Call edge functions using the **direct Lovable Cloud URL** instead of `supabase.functions.invoke()`. A new helper file `src/lib/lovableEdgeFunctions.ts` will export an `invokeEdgeFunction()` wrapper that always hits the correct Lovable Cloud URL (`https://uuunmenwafhrifatepjm.supabase.co/functions/v1/...`) with the correct anon key. This is also needed for `astrology`, `geocode-proxy`, `send-whatsapp`, and `admin-operations`.

---

### Problem 4 — Signup and Login import `useAuth` from wrong path

`src/pages/Login.tsx` (line 3) and `src/pages/Signup.tsx` (line 3) import from `@/components/AuthProvider`, but the real `AuthProvider` is at `@/auth/AuthProvider`. The `src/components/AuthProvider.tsx` is a re-export shim so this works, but these files also import `Header`/`Footer` from old paths that may have stale `useAuth` references.

---

## Files to Change

### 1. `src/lib/lovableEdgeFunctions.ts` — NEW FILE

Create a helper that always calls Lovable Cloud edge functions by direct URL:
```ts
const LOVABLE_FUNCTIONS_URL = 'https://uuunmenwafhrifatepjm.supabase.co/functions/v1';
const LOVABLE_ANON_KEY = 'eyJhbGci...'; // Lovable Cloud anon key

export async function invokeEdgeFunction(name: string, body?: object) {
  const res = await fetch(`${LOVABLE_FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_ANON_KEY}`,
      'apikey': LOVABLE_ANON_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Edge function error: ${res.status}`);
  return res.json();
}
```

### 2. `src/auth/AuthProvider.tsx` — Fix signUp to use upsert

Change the profiles `update` to an `upsert` so it always creates the row:
```ts
// Before (breaks if trigger hasn't created the row yet):
await supabase.from('profiles').update(profileUpdate).eq('id', userId);

// After (creates OR updates the row safely):
await supabase.from('profiles').upsert({ id: userId, ...profileUpdate });
```

### 3. `src/pages/Login.tsx` — Fix stale role redirect

Replace the `setTimeout(redirectByRole(role))` pattern with a `useEffect` that waits for `role` to be populated after successful sign-in:
```ts
const [loginSuccess, setLoginSuccess] = useState(false);

// In handleEmailLogin, after signIn succeeds:
setLoginSuccess(true);  // Instead of setTimeout

// New useEffect:
useEffect(() => {
  if (loginSuccess && !loading && role !== undefined) {
    setLoginSuccess(false);
    redirectByRole(role);
  }
}, [loginSuccess, role, loading]);
```

### 4. `src/components/panchang/PanchangSection.tsx` — Fix edge function call

Replace `supabase.functions.invoke('get-panchang', ...)` with `invokeEdgeFunction('get-panchang', ...)` from the new helper.

### 5. Search for other `supabase.functions.invoke` usages

Files that call edge functions via `supabase.functions.invoke()` need to be updated to use `invokeEdgeFunction()`:
- `src/pages/Kundali.tsx`
- `src/pages/KundaliMatching.tsx`
- `src/api/astrology.ts`
- Any other files using `supabase.functions.invoke`

## Implementation Order

1. Create `src/lib/lovableEdgeFunctions.ts`
2. Fix `src/auth/AuthProvider.tsx` signup (profiles upsert)
3. Fix `src/pages/Login.tsx` redirect logic
4. Update `PanchangSection.tsx` and any other files calling edge functions

## What This Does NOT Fix

- The `400 (invalid credentials)` errors on login — these are from users whose accounts don't exist in the existing Supabase Auth yet (they were in the old FastAPI backend only). Those users will need to sign up again or use a password reset flow. This is expected and cannot be fixed in code.
- If the existing Supabase project (`thogujcdmhlalroftpmi`) is paused/hibernated, the 503 errors will persist until the project is reactivated in the Supabase dashboard.
