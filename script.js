// script.js — GLOBAL SUPABASE CLIENT (CDN VERSION)

// Wait until Supabase library is loaded
if (!window.supabase) {
  console.error("❌ Supabase CDN not loaded");
}

// Create client and expose globally
window.supabaseClient = window.supabase.createClient(
  'https://drkjmtanzqmjgpltjqcg.supabase.co',
  'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N'
);

console.log('✅ Supabase client initialized');
