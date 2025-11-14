const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== AUTHENTICATED USER FLOW CHECK ===\n');
  
  // 1. Check auth.users table
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  console.log('1. Total auth users:', users ? users.length : 0);
  if (users && users.length > 0) {
    console.log('\n   Valid authenticated users:');
    users.forEach((u, i) => {
      console.log('   ' + (i+1) + '.', u.email);
      console.log('      user.id:', u.id);
    });
    
    // 2. For first user, check their conversations
    if (users.length > 0) {
      const firstUserId = users[0].id;
      console.log('\n2. Checking conversations for user:', users[0].email);
      console.log('   Looking for session_id:', firstUserId);
      
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_id', firstUserId)
        .eq('is_active', true);
      
      console.log('   Conversations found:', convs ? convs.length : 0);
      if (convs && convs.length > 0) {
        convs.forEach((c, i) => {
          console.log('   ' + (i+1) + '. ' + c.title);
          console.log('      persona:', c.persona_type || c.persona_slug);
        });
      }
    }
  } else {
    console.log('   NO authenticated users found!');
    console.log('   This means all conversations are orphaned from deleted users.');
  }
  
  process.exit(0);
})();
