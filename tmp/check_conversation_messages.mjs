import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kmmqiwfsikspetquhmev.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXFpd2ZzaWtzcGV0cXVobWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODMzNywiZXhwIjoyMDg4MzQ0MzM3fQ.zUPkoh18LT9RyoNu3c99o4B4xUHiA4iYnVlK4LXMhfk';

async function checkMessages() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const conversationId = '090b3986-271b-438c-b15c-4b96cf7567c5';
  
  console.log(`--- MESSAGES FOR CONVERSATION ${conversationId} ---`);
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Last 10 messages:', JSON.stringify(messages, null, 2));
}

checkMessages();
