# Supabase Database Setup

Your Supabase project is ready at: https://exdjsvknudvfkabnifrg.supabase.co

## Steps to Set Up Database

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg
   
2. **Run Schema (Create Tables)**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy contents from: `/Users/gaurav/Esperit/supabase/schema.sql`
   - Paste into SQL Editor
   - Click "Run" or press Cmd+Enter
   - You should see: "Success. No rows returned"

3. **Run Seed Data (Add 10 Personas)**
   - In SQL Editor, click "New Query" again
   - Copy contents from: `/Users/gaurav/Esperit/supabase/seed.sql`
   - Paste into SQL Editor
   - Click "Run" or press Cmd+Enter
   - You should see: "Success. 10 rows affected"

4. **Enable Google OAuth (Optional - for Sign In)**
   - Click "Authentication" in left sidebar
   - Click "Providers"
   - Enable "Google"
   - Add your Google OAuth credentials
   - Add redirect URL: http://localhost:3000/auth/callback

## Verify Setup

After running the scripts, check:
- Go to "Table Editor" → "personas" table
- You should see 10 personas (Elon Musk, Ratan Tata, Shah Rukh Khan, etc.)
- All tables should be visible: profiles, personas, conversations, messages, reports

## Ready to Test!

Once done, your app is ready to run:
```bash
cd /Users/gaurav/Esperit
npm run dev
```

Visit: http://localhost:3000
