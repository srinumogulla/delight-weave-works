
# Connect Frontend to Your Existing Supabase Database

## The Situation

Your project currently has TWO separate databases:

| | Current Lovable Cloud | Your Existing Database |
|---|---|---|
| Project ID | `uuunmenwafhrifatepjm` | `thogujcdmhlalroftpmi` |
| Data | Empty (new) | Has all your real data |
| Auth users | None | All existing users |
| Connected to frontend | Yes | No |

The FastAPI backend was reading from `thogujcdmhlalroftpmi`. You want the frontend to use that same database so no data is lost.

---

## Two Paths Available

### Option A — Swap to Your Existing Database (Recommended if you have real data)

Point this project at your existing Supabase project (`thogujcdmhlalroftpmi`). All your existing users, poojas, bookings, temples — everything already there — will immediately be accessible. No data migration needed.

**What this involves:**
1. Get the **URL** and **anon key** from your existing Supabase project (Project Settings → API)
2. Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the `.env` file
3. Replace the auto-generated `src/integrations/supabase/client.ts` with one pointing to the correct project
4. Sync the database schema (copy table definitions, RLS policies, triggers from the old project)
5. Test login/signup against the real database

**Downside:** The Lovable Cloud integration tools (migrations, edge function secrets, etc.) will no longer work seamlessly since Lovable Cloud manages the current project only.

---

### Option B — Migrate Data to Lovable Cloud (Recommended for long-term)

Keep the Lovable Cloud project (`uuunmenwafhrifatepjm`) as the primary database and import your existing data from the old project into it. This keeps all Lovable Cloud benefits (auto-managed auth, edge functions, secrets).

**What this involves:**
1. Export data from your existing Supabase project using `pg_dump` or the Supabase dashboard Table Editor CSV export
2. Import data into the Lovable Cloud database using the SQL editor
3. Sync any missing schema (tables, enums, triggers, RLS policies) from the old project to the new one
4. Update auth users — Supabase auth users **cannot** be exported/imported directly; existing users would need to reset their passwords, OR you contact Supabase support for a user migration

**Downside:** Existing auth users (passwords/sessions) cannot be migrated. Users would need to re-register or reset passwords.

---

## Recommendation

Since you said "we have a Supabase API" — if your old project has **real users and real data** that must be preserved, **Option A** (swap project) is the right move. If the old project only has test data, **Option B** (stay on Lovable Cloud) is better.

---

## Technical Steps for Option A

### Step 1: Get credentials from your existing Supabase project
Go to your old Supabase project dashboard → Settings → API:
- Copy the **Project URL** (e.g. `https://thogujcdmhlalroftpmi.supabase.co`)
- Copy the **anon/public key** (starts with `eyJ...`)

### Step 2: Update environment variables
Update `.env`:
```
VITE_SUPABASE_URL=https://thogujcdmhlalroftpmi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from old project>
```

### Step 3: Verify schema compatibility
The `src/integrations/supabase/types.ts` is auto-generated from the current Lovable Cloud project. After switching, the TypeScript types must match your old project's actual schema. We'd need to verify:
- `profiles` table has: `full_name`, `email`, `phone`, `date_of_birth`, `time_of_birth`, `birth_location`, `gender`, `gotra`, `nakshatra`, `rashi`, `avatar_url`
- `user_roles` table has: `user_id`, `role` with the `app_role` enum
- `pooja_services`, `bookings`, `pundits`, `temples`, `gift_bookings` tables all exist

### Step 4: Edge function secrets
The 3 edge functions (`astrology`, `send-whatsapp`, `admin-operations`) are deployed on the Lovable Cloud project. They would need to be re-deployed if you switch projects.

---

## What I Need From You

To proceed, please tell me:
1. **Which option do you prefer?** (A = use your existing database, B = stay on Lovable Cloud and migrate data)
2. **Does your existing database have real users you need to preserve?**
3. If Option A: **Share your existing project's anon key** (NOT the password — just the `eyJ...` public API key from Project Settings → API → `anon` key)

Also, please **change your database password** in your Supabase project settings immediately since it was shared here.
