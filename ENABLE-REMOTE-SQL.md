# Enable Remote SQL Execution

To allow me to fix the database issues automatically, please run this **ONE** SQL command in your Supabase SQL Editor:

```sql
-- Create a function to allow executing SQL via the API
create or replace function exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;
```

## How to run:
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql)
2. Paste the code above
3. Click **Run**

Once you do this, I can run the rest of the setup scripts automatically!
