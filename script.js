
const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('✅ Supabase initialized');
