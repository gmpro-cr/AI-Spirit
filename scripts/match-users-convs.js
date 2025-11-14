const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== MATCHING USERS TO CONVERSATIONS ===\n');
  
  // Get all valid users
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const validUserIds = users.map(u => u.id);
  
  console.log('Valid user IDs:', validUserIds.length);
  
  // Get all conversations
  const { data: convs } = await supabase
    .from('conversations')
    .select('session_id')
    .eq('is_active', true);
  
  const convsSessionIds = [...new Set(convs.map(c => c.session_id))];
  console.log('Unique session_ids in conversations:', convsSessionIds.length);
  
  // Find matches
  const matches = convsSessionIds.filter(sid => validUserIds.includes(sid));
  const orphaned = convsSessionIds.filter(sid => !validUserIds.includes(sid));
  
  console.log('\n✓ Conversations matching valid users:', matches.length);
  console.log('✗ Orphaned conversations (no user):', orphaned.length);
  
  if (matches.length > 0) {
    console.log('\nMatching user conversations:');
    for (const userId of matches) {
      const user = users.find(u => u.id === userId);
      const userConvs = convs.filter(c => c.session_id === userId);
      console.log('  -', user.email, ':', userConvs.length, 'conversations');
    }
  }
  
  process.exit(0);
})();
