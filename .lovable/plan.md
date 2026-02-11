

# Fix Login 422 Error -- Form-Encoded Auth Request

## Root Cause

The FastAPI backend's `/auth/login` endpoint uses `OAuth2PasswordRequestForm`, which requires:
- **Content-Type**: `application/x-www-form-urlencoded`
- **Fields**: `username` (not `email`) and `password`

The frontend currently sends:
- **Content-Type**: `application/json`
- **Body**: `{"email": "...", "password": "..."}`

This mismatch causes the 422 Unprocessable Entity error.

## Fix

### 1. Add a form-post helper to `src/integrations/vedhaApi/client.ts`

Add a new `apiPostForm` function that sends `application/x-www-form-urlencoded` data instead of JSON:

```typescript
export function apiPostForm<T = any>(path: string, data: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(data).toString();
  return request<T>(path, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}
```

### 2. Update `src/integrations/vedhaApi/auth.ts`

Change the `login` function to use form-encoded data with `username` field:

```typescript
import { apiPost, apiPostForm } from './client';

export const login = (data: LoginPayload) =>
  apiPostForm<AuthResponse>('/auth/login', {
    username: data.email,
    password: data.password,
  });
```

The `signup`, `sendMobileCode`, and `verifyMobileCode` functions remain unchanged (they use JSON as expected by their Pydantic schemas).

### 3. Improve 422 error handling in `src/integrations/vedhaApi/client.ts`

Show the actual validation error detail from FastAPI instead of the generic message. FastAPI returns structured validation errors like:
```json
{"detail": [{"loc": ["body", "username"], "msg": "field required", "type": "value_error.missing"}]}
```

Update the 422 handler to parse and display these details.

## Files Changed (2)

| File | Change |
|------|--------|
| `src/integrations/vedhaApi/client.ts` | Add `apiPostForm` helper; improve 422 error parsing |
| `src/integrations/vedhaApi/auth.ts` | Use `apiPostForm` for login with `username` field |

## Why This Works

FastAPI's `OAuth2PasswordRequestForm` is the standard way to handle login in FastAPI. It requires form-encoded data with `username` + `password` per the OAuth2 spec. The `username` field receives the email address -- this is standard practice since OAuth2 uses "username" generically.
