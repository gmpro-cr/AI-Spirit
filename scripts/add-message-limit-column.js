import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addMessageLimitColumn() {
  console.log('📝 Adding message_limit column to user_profiles table...\n')
  
  // Add column with default value of 20
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 20;
      
      -- Update specific user to 100
      UPDATE user_profiles 
      SET message_limit = 100 
      WHERE user_id = 'f7ddbd3c-089b-4068-8722-de0fea30d335';
    `
  })
  
  if (error) {
    console.log('❌ exec_sql RPC not available. Using direct SQL...')
    
    // Try alternative approach - update via pg_catalog
    const { error: alterError } = await supabase
      .rpc('exec', {
        query: 'ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 20'
      })
    
    if (alterError) {
      console.log('❌ Could not add column:', alterError.message)
      console.log('\n⚠️  Message limit needs to be added via Supabase Dashboard:')
      console.log('   1. Go to https://supabase.com/dashboard')
      console.log('   2. Select your project')
      console.log('   3. Go to Table Editor → user_profiles')
      console.log('   4. Click "+ New Column"')
      console.log('   5. Name: message_limit')
      console.log('   6. Type: int4 (INTEGER)')
      console.log('   7. Default value: 20')
      console.log('   8. Save')
      return
    }
  }
  
  console.log('✅ Column added successfully!')
  
  // Verify the update
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('user_id, preferred_name, message_limit')
    .eq('user_id', 'f7ddbd3c-089b-4068-8722-de0fea30d335')
    .single()
  
  if (fetchError) {
    console.log('❌ Error fetching updated profile:', fetchError.message)
    return
  }
  
  console.log('\n✅ Updated profile:')
  console.log(JSON.stringify(profile, null, 2))
  console.log('\n🎉 Message limit set to 100 for', profile.preferred_name)
}

addMessageLimitColumn()
