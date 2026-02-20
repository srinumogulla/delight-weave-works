
# Integrating Astrology API, WhatsApp, YouTube & SMS

## Context

Since all 4 integrations (Astrology API, WhatsApp, YouTube, AuthKey SMS) are handled server-side by your FastAPI backend at `api.vedhamantra.com`, the frontend doesn't need any new secrets. The backend already holds all credentials.

The real work is: **connecting the frontend pages to the real backend endpoints** instead of using the simulated/mock data currently in place.

---

## What Needs Changing (Gaps Found)

### Gap 1: Kundali Page — Currently 100% Fake (CRITICAL)
`src/pages/Kundali.tsx` uses a `setTimeout` with random math calculations to simulate planetary positions. It needs to call the real Astrology API through your backend.

**Assumed endpoint** (confirm if different):
- `POST /astrology/kundali` — birth chart generation
- Request body: `{ date_of_birth, time_of_birth, birth_place_name, gender }`

### Gap 2: Kundali Matching Page — Currently 100% Fake (CRITICAL)
`src/pages/KundaliMatching.tsx` also uses a local `setTimeout` with math approximations for the 36-point Ashtakoot calculation. It needs to call the backend.

**Assumed endpoint**:
- `POST /astrology/kundali-matching`
- Request body: `{ person_a: {...}, person_b: {...} }`

### Gap 3: Remedies Page — Hardcoded Local Database
`src/pages/Remedies.tsx` uses a static `remedyDatabase` array defined in the file. If your backend exposes a dosha analysis endpoint, this should call it. Otherwise, the local database can be kept with a CTA to consult a pundit.

### Gap 4: Panchang — Already Working (Edge Function)
`src/pages/Panchang.tsx` calls the `get-panchang` Lovable Cloud edge function, which uses proper astronomical calculations. This is working correctly and does NOT need to call the Astrology API.

### Gap 5: Panchang Page — Reverse Geocode Still Calling Nominatim Directly
On line 82-93 of `Panchang.tsx`, a `fetch` call goes directly to `nominatim.openstreetmap.org` for reverse geocoding (converting GPS coordinates to city name). This will hit the same CORS block as the signup city autocomplete. The `geocode-proxy` edge function needs to support reverse geocoding too.

### Gap 6: YouTube Redirect URI — Points to Localhost
The `YOUTUBE_REDIRECT_URI` in your backend `.env.prod` is `http://localhost:8000/integrations/youtube/callback`. For production, this needs to be updated to `https://api.vedhamantra.com/integrations/youtube/callback` on your server — this is a backend-only change, no frontend work needed.

---

## Implementation Plan

### File 1: Add Astrology API types to `src/api/types.ts`
Add new TypeScript interfaces for the Astrology API response shapes:
- `KundaliRequest` — input fields
- `KundaliApiResponse` — full chart response (lagna, rashi, nakshatra, planetary positions, houses, doshas, yogas, dasha)
- `KundaliMatchingRequest` — two-person input
- `KundaliMatchingApiResponse` — Ashtakoot scores, total, verdict

### File 2: Create `src/api/astrology.ts`
New API module with functions:
```
generateKundali(data: KundaliRequest) → POST /astrology/kundali
getKundaliMatching(data: KundaliMatchingRequest) → POST /astrology/kundali-matching
```

### File 3: Update `src/pages/Kundali.tsx`
Replace the `setTimeout` simulation block (lines 115–194) with a real `apiPost()` call to `/astrology/kundali`. Map the API response fields to the existing `KundaliData` interface used by the chart rendering components. Keep all the UI rendering unchanged — only the data source changes.

**Error handling**: Show a toast with the backend error message if the API call fails (e.g., invalid coordinates, unsupported date range). Keep the form accessible after failure.

**Loading state**: Replace the fake 2-second delay with real `isGenerating` state tied to the API call.

### File 4: Update `src/pages/KundaliMatching.tsx`
Replace the `setTimeout` simulation block (lines 100–236) with a real `apiPost()` call to `/astrology/kundali-matching`. Map the API response to the `MatchingResult` interface. Keep all UI rendering unchanged.

### File 5: Update `supabase/functions/geocode-proxy/index.ts`
Extend the existing geocode proxy to support **reverse geocoding** in addition to forward search:
- If the request has `lat` and `lon` params → call Nominatim's `/reverse` endpoint
- If the request has `q` param → call Nominatim's `/search` endpoint (existing behavior)

### File 6: Update `src/pages/Panchang.tsx`
Replace the direct Nominatim reverse geocode fetch (lines 82–93) with a call to the updated `geocode-proxy` edge function, fixing the CORS block for location detection.

---

## What You Need to Do on Your Server

These are backend-only changes (no Lovable involvement needed):

| Action | Where |
|--------|--------|
| Fill in `ASTROLOGY_API_USER_ID=648251` and `ASTROLOGY_API_KEY` in `.env.prod` | Your FastAPI server |
| Fill in all WhatsApp, YouTube, and AuthKey values in `.env.prod` | Your FastAPI server |
| Update `YOUTUBE_REDIRECT_URI` to `https://api.vedhamantra.com/integrations/youtube/callback` | Your FastAPI server |
| Add CORS allowed origins for Lovable URLs | Your FastAPI server |

---

## Technical Implementation Notes

- The `generateKundali()` function in `Kundali.tsx` currently returns a `KundaliData` object with a specific structure. The API response will be mapped to match this same structure so the existing chart components (`NorthIndianChart`, the house grid, etc.) don't need changes.
- If the backend returns a different field structure for planetary positions or houses, a thin mapping layer will be added in the `generateKundali` function.
- The `apiPost` client already handles auth tokens, error stringification (the React #31 fix), and retries — no new client logic needed.

---

## Files Changed Summary

| File | Change Type |
|------|------------|
| `src/api/types.ts` | Add Astrology API request/response types |
| `src/api/astrology.ts` | New file — Astrology API functions |
| `src/pages/Kundali.tsx` | Replace mock with real API call |
| `src/pages/KundaliMatching.tsx` | Replace mock with real API call |
| `supabase/functions/geocode-proxy/index.ts` | Add reverse geocoding support |
| `src/pages/Panchang.tsx` | Fix CORS by using geocode proxy for reverse geocode |
