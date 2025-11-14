const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== CREATING TEST CONVERSATION ===\n');
  
  // Use the last user (mahalegauravk@gmail.com)
  const testUserId = 'f7ddbd3c-089b-4068-8722-de0fea30d335';
  const testEmail = 'mahalegauravk@gmail.com';
  
  console.log('Creating conversation for:', testEmail);
  console.log('User ID:', testUserId);
  
  // Create a test conversation
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      session_id: testUserId,
      persona_id: null,
      persona_type: 'albert-einstein',
      persona_slug: 'albert-einstein',
      title: 'Chat with Albert Einstein',
      is_active: true,
      is_guest_session: false,
      message_count: 0
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating conversation:', error);
  } else {
    console.log('\n✓ Conversation created:', newConv.id);
    console.log('  Title:', newConv.title);
    console.log('  Persona:', newConv.persona_slug);
    
    // Now query as the SidePanel would
    console.log('\n--- Testing SidePanel query ---');
    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', testUserId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    console.log('Conversations found:', convs ? convs.length : 0);
    if (convs && convs.length > 0) {
      console.log('\n✓ PAST CHATS WOULD SHOW:');
      convs.forEach((c, i) => {
        console.log('  ' + (i+1) + '. ' + c.title);
      });
    }
  }
  
  process.exit(0);
})();
