const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase
    .from('messages')
    .select('id, content, media_url, media_type')
    .eq('media_type', 'document')
    .order('created_at', { ascending: false })
    .limit(3);
  fs.writeFileSync('tmp/db_out.json', JSON.stringify(data, null, 2));
}

check();
