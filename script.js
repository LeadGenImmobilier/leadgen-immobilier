// script.js — GLOBAL SUPABASE CLIENT (CDN VERSION)

console.log("📦 script.js loaded");

// ✅ HARD STOP if Supabase CDN not loaded
if (!window.supabase) {
  console.error("❌ Supabase CDN not loaded — CHECK <script> ORDER");
  throw new Error("Supabase not available");
}

// ✅ Create client ONLY if Supabase exists
window.supabaseClient = window.supabase.createClient(
  "https://drkjmtanzqmjgpltjqcg.supabase.co",
  "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N"
);

console.log("✅ Supabase client initialized");
