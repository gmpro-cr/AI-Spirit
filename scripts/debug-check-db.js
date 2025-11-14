const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/gaurav/AI-Spirit/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('=== EVIDENCE GATHERING ===\n');
  
  const { data: convs } = await supabase
    .from('conversations')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(5);

  console.log('1. Active Conversations:', convs ? convs.length : 0);
  if (convs && convs.length > 0) {
    convs.forEach((c, i) => {
      const sid = c.session_id ? c.session_id.substring(0, 8) : 'NULL';
      console.log('  ' + (i+1) + '. session_id:', sid + '...');
      console.log('     persona_type:', c.persona_type);
      console.log('     persona_slug:', c.persona_slug || 'NULL');
      console.log('     title:', c.title);
    });
  }
  
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(5);
    
  console.log('\n2. Users in profiles:', users ? users.length : 0);
  if (users && users.length > 0) {
    users.forEach((u, i) => {
      const uid = u.id.substring(0, 8);
      console.log('  ' + (i+1) + '.', u.email, '(id:', uid + '...)');
    });
  }
  
  process.exit(0);
})();
