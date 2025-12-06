// ----------------- Supabase Init -----------------

const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';

// Create client ONCE
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Expose if other pages need it (optional but safe)
window.supabaseClient = supabaseClient;

console.log('✅ Supabase client ready', supabaseClient);

// ----------------- DOM READY -----------------
document.addEventListener('DOMContentLoaded', () => {
  // ✅ SAFE test
  supabaseClient.from('properties').select('id').limit(1)
    .then(({ error }) => {
      if (error) console.warn('⚠️ Supabase reachable but error:', error.message);
      else console.log('✅ Supabase query OK');
    });

  loadProperties?.();
  loadTeamMembers?.();
  loadContactInfo?.();
});
