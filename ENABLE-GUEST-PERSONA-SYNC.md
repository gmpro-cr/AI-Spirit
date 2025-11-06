# Enable Database Sync for Guest Users

This guide explains how to enable database sync for guest users (non-authenticated users) when creating custom personas.

## Current Status

✅ **Authenticated users**: Database sync already enabled
⚠️ **Guest users**: Previously saved to localStorage only

## Changes Made

### 1. Updated `CreatePersonaModal.jsx`
- Now saves ALL personas to the database (both authenticated and guest users)
- Guest personas have `user_id = NULL`
- Updated UI message to reflect the new behavior
- Guest personas are also backed up to localStorage

### 2. Created Database Migration
- File: `supabase/migration-enable-guest-persona-creation.sql`
- Allows guest users to INSERT personas with `user_id = NULL`
- Prevents guest personas from being edited/deleted (to prevent abuse)
- Maintains existing policies for authenticated users

## How to Apply the Migration

### Option 1: Run the Migration Script (Recommended)

```bash
node scripts/run-guest-persona-migration.js
```

### Option 2: Manual SQL Execution

If the script doesn't work, run the SQL manually:

1. Go to Supabase Dashboard → SQL Editor
2. Open: `supabase/migration-enable-guest-persona-creation.sql`
3. Copy the entire SQL content
4. Paste and run in the SQL Editor

## How It Works

### For Authenticated Users
1. User creates a persona
2. Persona is saved to database with their `user_id`
3. Persona syncs across all their devices
4. User can edit/delete their personas

### For Guest Users
1. Guest creates a persona
2. Persona is saved to database with `user_id = NULL`
3. Persona is also backed up to localStorage
4. Guest cannot edit/delete the database version (prevents abuse)
5. If guest signs in later, they can create new personas linked to their account

## Security Considerations

- ✅ Guest personas are read-only after creation (cannot be edited/deleted)
- ✅ Authenticated users can only manage their own personas
- ✅ All personas are visible to everyone (as per previous migration)
- ✅ Prevents abuse by not allowing anonymous editing/deletion

## Testing

After running the migration, test by:

1. **Guest User Test**:
   - Open incognito window
   - Navigate to the app (not signed in)
   - Create a custom persona
   - Check browser console for "Saving to database for guest user"
   - Verify persona appears in the database with `user_id = NULL`

2. **Authenticated User Test**:
   - Sign in with Google
   - Create a custom persona
   - Check browser console for "Saving to database for authenticated user"
   - Verify persona appears in the database with your `user_id`

## Troubleshooting

### Error: "new row violates row-level security policy"
- The migration hasn't been applied yet
- Run the migration using Option 1 or Option 2 above

### Error: "Database error: [some error]"
- Check the browser console for detailed error messages
- Verify Supabase connection in `.env.local`
- Check that RLS policies are correctly configured

## Files Modified

- `components/personas/CreatePersonaModal.jsx` - Updated persona creation logic
- `supabase/migration-enable-guest-persona-creation.sql` - New migration file
- `scripts/run-guest-persona-migration.js` - Migration runner script

## Summary

🎉 **Database sync is now enabled for ALL users!**

- Authenticated users: Full control over their personas
- Guest users: Can create personas, but cannot edit/delete them
- All personas are backed by the database (no more localStorage-only personas)
