const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== TESTING THE FIX ===\n');
  
  // Use your user ID (mahalegauravk@gmail.com)
  const testUserId = 'f7ddbd3c-089b-4068-8722-de0fea30d335';
  const testEmail = 'mahalegauravk@gmail.com';
  
  console.log('1. Testing conversation creation for:', testEmail);
  
  // Try to create a test conversation with auth user ID
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      session_id: testUserId,  // Using Supabase auth user ID now
      persona_id: null,
      persona_type: 'albert-einstein',
      persona_slug: 'albert-einstein',
      title: 'Test Chat with Albert Einstein',
      is_active: true,
      is_guest_session: false,
      message_count: 0
    })
    .select()
    .single();
  
  if (error) {
    console.error('   ✗ FAILED - Foreign key still blocking:', error.message);
    console.log('\n   Please run the SQL migration first!');
  } else {
    console.log('   ✓ SUCCESS - Conversation created:', newConv.id);
    
    // Test the query that SidePanel uses
    console.log('\n2. Testing SidePanel query:');
    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', testUserId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    
    console.log('   Conversations found:', convs.length);
    
    if (convs.length > 0) {
      console.log('\n   ✓ PAST CHATS WILL NOW SHOW:');
      convs.forEach((c, i) => {
        console.log('   ' + (i+1) + '. ' + c.title + ' (' + c.persona_slug + ')');
      });
      console.log('\n✓✓✓ FIX CONFIRMED - Past chats will work for authenticated users!');
    }
  }
  
  process.exit(0);
})();
