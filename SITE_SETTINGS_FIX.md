# Site Settings API Fix

## Problem
The `/api/site-settings` endpoint was returning 500 errors when trying to load or save site settings.

## Root Cause
The `getSupabaseAdminClient()` function in `/src/lib/supabaseAdmin.ts` was designed to fall back to using the `NEXT_PUBLIC_SUPABASE_ANON_KEY` when `SUPABASE_SERVICE_ROLE_KEY` was not configured. However, the Row Level Security (RLS) policy on the `site_settings` table only allows operations when `auth.role() = 'service_role'`, which requires the service role key.

When the anon key was used as a fallback:
- GET requests would fail even though there's a public read policy (likely due to other configuration issues)
- PUT requests would fail because the anon key doesn't have permission to modify the table

## Solution
Made the following minimal changes:

### 1. Required Service Role Key (`/src/lib/supabaseAdmin.ts`)
- Removed the fallback to anon key
- Made `SUPABASE_SERVICE_ROLE_KEY` a required environment variable
- Added clear error message when the key is missing

### 2. Better Error Handling (`/src/app/api/site-settings/route.ts`)
- Added more detailed logging for database errors
- Added special handling for configuration errors
- Provides clearer error messages to help diagnose issues

## Required Environment Variable
To use the admin API endpoints, you must configure:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Add this to your `.env.local` file. You can find the service role key in your Supabase project dashboard under Settings > API.

## Database Schema
The `site_settings` table has the following RLS policies:
- **Public read**: Anyone can read site settings
- **Service role write**: Only the service role can insert/update/delete settings

This is secure because:
1. The API endpoint `/api/site-settings` PUT operation is protected by `ensureAdminAccess()` middleware
2. The service role key is only used server-side and never exposed to clients
3. Public can only read settings, not modify them

## Testing
To verify the fix:
1. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to the admin panel and go to the Settings tab
4. Try loading and saving site settings
5. Check the browser console and server logs for any errors

If you see an error about "SUPABASE_SERVICE_ROLE_KEY", it means the environment variable is not properly configured.
