
# Fix Login, Add Forgot Password, and Database Trigger

## What is actually happening (based on real data inspection)

### Your confirmed users in the database:
| Email | Role | Status |
|---|---|---|
| demo@gmail.com | **admin** | Has profile |
| guru@gmail.com | pundit | Has profile |
| pundit@gmail.com | pundit | Has profile |
| demo001@gmail.com | user | Has profile |
| sharma@pantulu.com | pundit | Has profile |

- **`guru@vedhamantra.com` does not exist in the auth system at all** — it only existed in the old FastAPI backend. The 400 "Invalid login credentials" error for that email is expected and cannot be fixed in code. That user must sign up fresh.
- **3 bookings, 5 temples, 5 pundits** are present in the database.
- **The login redirect `useEffect` is already correctly implemented** in `Login.tsx` (lines 44-49). The redirect logic is in place.

### The remaining real problems:
1. **No database trigger** — `handle_new_user()` function exists but is not attached to any trigger. New signups create Auth users but not `profiles` rows automatically. The upsert in `signUp()` handles this for new signups, but login for a user whose profile was never created will result in `fetchProfile` returning `null`, and the `AuthProvider` will then set `user` and `role` to `null` — which redirects them back to `/login` in a loop.
2. **No Forgot Password flow** — no `/forgot-password` or `/reset-password` pages exist.
3. **Missing "Forgot password?" link** on the login form.

---

## Changes Required

### 1. Database Migration — Attach the `handle_new_user` trigger

The function `handle_new_user()` already exists (confirmed in db-functions). It just needs to be attached as a trigger on `auth.users`. However, since we cannot modify the `auth` schema directly, the trigger must fire on `auth.users` via a `BEFORE INSERT` or `AFTER INSERT` event. This is the standard Supabase pattern.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

This ensures every new signup automatically gets a `profiles` row, so `fetchProfile` will always find data after login.

### 2. Fix `AuthProvider` — handle missing profile gracefully

Currently if `fetchProfile` returns `null` (profile row missing for an existing auth user), `loadUser` does nothing — leaving `user = null` and `role = null`, which causes protected pages to redirect to `/login` in a loop.

Fix: if the profile row is missing after login, create a minimal default profile and set role to `'user'` so the user can still log in and be redirected to the home page.

```ts
const loadUser = async (supabaseUser: User | null) => {
  if (!supabaseUser) { setUser(null); setRole(null); return; }
  const profile = await fetchProfile(supabaseUser.id);
  if (profile) {
    setUser(profile);
    setRole(profile.role);
  } else {
    // Profile missing — create a minimal one so user isn't stuck in redirect loop
    await supabase.from('profiles').upsert({
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name ?? null,
    });
    await supabase.from('user_roles').upsert({ user_id: supabaseUser.id, role: 'user' });
    // Retry fetch
    const retried = await fetchProfile(supabaseUser.id);
    if (retried) { setUser(retried); setRole(retried.role); }
  }
};
```

### 3. Add "Forgot password?" link to `src/pages/Login.tsx`

Add a small link below the password field:
```tsx
<div className="text-right">
  <Link to="/forgot-password" className="text-sm text-saffron hover:underline">
    Forgot password?
  </Link>
</div>
```

### 4. Create `src/pages/ForgotPassword.tsx` — NEW FILE

A simple page with an email input that calls:
```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});
```
Shows a success message once sent. Styled to match the existing login/signup card style (saffron theme, Header/Footer).

### 5. Create `src/pages/ResetPassword.tsx` — NEW FILE

This page handles the recovery link that lands after the user clicks the email link. It:
- Checks for `type=recovery` in the URL hash (set by Supabase auth)
- Listens for the `PASSWORD_RECOVERY` auth event via `onAuthStateChange`
- Shows a "new password" + "confirm password" form
- Calls `supabase.auth.updateUser({ password: newPassword })` on submit
- Redirects to `/login` on success with a success toast

```ts
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    setIsRecovery(true);
  }
});
```

Both pages will use `supabase` from `@/lib/supabase` (the production project client) for auth operations.

### 6. Register both new routes in `src/App.tsx`

Add two public (non-protected) routes:
```tsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

---

## Implementation Order

1. Run database migration to attach the trigger
2. Fix `AuthProvider.tsx` missing profile recovery
3. Add "Forgot password?" link to `Login.tsx`
4. Create `ForgotPassword.tsx`
5. Create `ResetPassword.tsx`
6. Register routes in `App.tsx`

---

## What this does NOT fix

- Login for `guru@vedhamantra.com` and other FastAPI-only users — those accounts do not exist in the authentication system and must sign up fresh. The "Forgot password?" flow only works for users who already have an account in the system.
- The Panchang/edge function CORS — that is a separate issue with edge functions not being deployed on the production project.
