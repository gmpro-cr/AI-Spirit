import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateMessageLimit() {
  const userId = 'f7ddbd3c-089b-4068-8722-de0fea30d335'
  
  console.log('🔍 Checking current user_profiles for:', userId)
  
  // Check current profile
  const { data: currentProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (fetchError) {
    console.log('❌ Error fetching profile:', fetchError.message)
    console.log('\n📝 Profile might not exist or column name is different')
    
    // Try to get table structure
    const { data: sample, error: sampleError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .single()
    
    if (!sampleError && sample) {
      console.log('\n✅ Sample user_profiles record structure:')
      console.log(JSON.stringify(sample, null, 2))
    }
    return
  }
  
  console.log('\n✅ Current profile:')
  console.log(JSON.stringify(currentProfile, null, 2))
  
  console.log('\n📝 Updating message_limit to 100...')
  
  // Update message limit
  const { data: updated, error: updateError } = await supabase
    .from('user_profiles')
    .update({ message_limit: 100 })
    .eq('user_id', userId)
    .select()
  
  if (updateError) {
    console.log('❌ Error updating:', updateError.message)
    return
  }
  
  console.log('\n✅ Successfully updated!')
  console.log(JSON.stringify(updated[0], null, 2))
  
  console.log('\n🎉 Message limit increased from', currentProfile.message_limit, 'to 100')
}

updateMessageLimit()
