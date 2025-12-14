import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function increaseMessageLimit() {
  const userEmail = 'mahalegauravk@gmail.com'
  
  console.log('🔍 Finding user:', userEmail)
  
  // Find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, message_limit')
    .eq('email', userEmail)
    .single()
  
  if (userError) {
    console.error('❌ Error finding user:', userError.message)
    return
  }
  
  console.log('✅ Found user:', {
    id: user.id,
    email: user.email,
    currentLimit: user.message_limit
  })
  
  // Update message limit to 100
  console.log('\n📝 Updating message limit to 100...')
  
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({ message_limit: 100 })
    .eq('id', user.id)
    .select()
  
  if (updateError) {
    console.error('❌ Error updating limit:', updateError.message)
    return
  }
  
  console.log('✅ Message limit updated successfully!')
  console.log('\nNew user data:', {
    id: updated[0].id,
    email: updated[0].email,
    message_limit: updated[0].message_limit
  })
  
  console.log('\n🎉 Done! Message limit increased from', user.message_limit, 'to 100')
}

increaseMessageLimit()
