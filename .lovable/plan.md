

# Fix Signup Crash: 3 Issues Found

## Issue 1: React Error #31 (White Screen Crash)

**Root Cause**: In `src/api/client.ts` line 27, when the API returns a 422 error, `errorData.detail` is an **array of objects** (FastAPI validation format). This array gets assigned to `errorMessage`. Then on line 51, `toast({ description: errorMessage })` tries to render this array as a React child, causing React Error #31 ("Objects are not valid as a React child - object with keys {type, loc, msg, input, url}").

**Fix**: In `src/api/client.ts`, ensure `errorMessage` is always converted to a string before being used. Specifically, handle the case where `errorData.detail` is an array immediately when it's read (line 27), rather than trying to re-parse it later.

## Issue 2: CORS Block on Nominatim API

**Root Cause**: The published domain (`delight-weave-works.lovable.app`) is blocked by Nominatim's CORS policy. The city autocomplete directly calls `nominatim.openstreetmap.org`, which doesn't include Lovable domains in its `Access-Control-Allow-Origin` header.

**Fix**: Create a backend function (`geocode-proxy`) that proxies requests to Nominatim server-side (no CORS issues). Update `CityAutocomplete` to call this proxy instead of Nominatim directly.

## Issue 3: 422 Validation Error from Backend

**Root Cause**: The backend is rejecting the signup payload. This could be due to field format issues (e.g., phone format, date format). The error details are hidden because of Issue 1 (the error object crashes React instead of displaying). Once Issue 1 is fixed, the actual validation message will be visible.

**Fix**: No separate fix needed -- fixing Issue 1 will surface the actual error message to the user.

---

## Implementation Details

### File 1: `src/api/client.ts`
- Lines 23-52: Rewrite the error handling block to immediately check if `errorData.detail` is an array (FastAPI validation errors) and convert it to a readable string
- Ensure `errorMessage` is **always a string** before passing to `toast()` and `throw new Error()`

### File 2: `supabase/functions/geocode-proxy/index.ts` (new)
- Create edge function that proxies geocoding requests to Nominatim
- Accept `q` query parameter, forward to Nominatim, return results
- Include proper CORS headers

### File 3: `src/components/ui/city-autocomplete.tsx`
- Replace direct Nominatim API call with call to the new `geocode-proxy` edge function
- Use the Supabase client URL to construct the proxy URL

### Unchanged Files
- `src/pages/Signup.tsx` -- already has correct field mapping and error handling
- `src/auth/AuthProvider.tsx` -- already catches errors properly

