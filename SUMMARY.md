# Site Settings API Fix - Summary

## Issue Fixed
Fixed the 500 error when loading or saving site settings in the admin panel (`/api/site-settings`).

## Error Messages (Before Fix)
```
api/site-settings:1  Failed to load resource: the server responded with a status of 500 ()
Site settings load failed: Error: Seiteneinstellungen konnten nicht geladen werden.
Site settings save failed: Error: Seiteneinstellungen konnten nicht gespeichert werden.
```

## Root Cause
The Supabase admin client (`getSupabaseAdminClient()`) was configured to fall back to the anon key when `SUPABASE_SERVICE_ROLE_KEY` was not set. However, the RLS (Row Level Security) policy on the `site_settings` table requires `auth.role() = 'service_role'` for write operations. When using the anon key, database operations failed due to insufficient permissions.

## Changes Made

### 1. `/src/lib/supabaseAdmin.ts`
**Before:**
```typescript
const keyToUse = serviceKey || anonKey
// Falls back to anon key if service key not available
```

**After:**
```typescript
if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt...')
}
return createClient(url, serviceKey, {...})
// Always requires service key
```

### 2. `/src/app/api/site-settings/route.ts`
- Added `handleApiError()` helper function to centralize error handling
- Improved error messages to identify configuration issues
- Added detailed logging for debugging

### 3. Documentation
- **SITE_SETTINGS_FIX.md**: Detailed explanation of the issue and fix
- **README.md**: Updated with clear environment variable requirements
- **.env.local.example**: Created template with all required variables

## Setup Instructions

### For Users
1. Create `.env.local` file in the project root
2. Add the following (get values from Supabase Dashboard > Settings > API):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_PASSWORD=your_secure_admin_password
   ```
3. Restart the development server: `npm run dev`

### Error Messages (After Fix)
If `SUPABASE_SERVICE_ROLE_KEY` is missing, you'll now see:
```
Supabase Konfigurationsfehler. Bitte SUPABASE_SERVICE_ROLE_KEY in .env.local setzen.
```

## Security
- ✅ No security vulnerabilities introduced
- ✅ Service role key is server-side only (never exposed to client)
- ✅ API endpoints protected by `ensureAdminAccess()` middleware
- ✅ RLS policies remain secure (service role required for writes)

## Testing
- ✅ TypeScript compilation passes
- ✅ ESLint passes (3 unrelated warnings in other files)
- ✅ CodeQL security scan passes (0 vulnerabilities)
- ✅ Code review passes (all feedback addressed)

## What Works Now
- ✅ Site settings can be loaded in the admin panel
- ✅ Site settings can be saved in the admin panel
- ✅ Clear error messages when configuration is missing
- ✅ Better debugging information in server logs

## Breaking Changes
**IMPORTANT**: `SUPABASE_SERVICE_ROLE_KEY` is now **required** (was optional before).

Users must add this environment variable to their `.env.local` file. Without it, all admin operations will fail with a clear error message guiding users to add the missing configuration.

## Rollback Plan
If needed, revert commits:
- d19ecc5 - Address code review feedback
- 84ab7dc - Add .env.local.example
- cb58c26 - Fix site-settings API 500 error

Then add `.env.local` with proper service role key.
