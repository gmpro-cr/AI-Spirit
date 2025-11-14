const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== CHECKING SESSION IDS ===\n');
  
  // Get distinct session_ids from conversations
  const { data: convs } = await supabase
    .from('conversations')
    .select('session_id')
    .eq('is_active', true);

  const uniqueSessionIds = [...new Set(convs.map(c => c.session_id))];
  
  console.log('Unique session_ids in conversations:', uniqueSessionIds.length);
  uniqueSessionIds.forEach((sid, i) => {
    console.log('  ' + (i+1) + '.', sid);
  });
  
  // Check if these session_ids exist in auth.users
  console.log('\nChecking if these are valid auth users...\n');
  
  for (const sid of uniqueSessionIds) {
    const { data: user, error } = await supabase.auth.admin.getUserById(sid);
    if (user) {
      console.log('✓', sid, '- VALID USER:', user.user.email);
    } else {
      console.log('✗', sid, '- NOT FOUND (deleted/invalid)');
    }
  }
  
  process.exit(0);
})();
