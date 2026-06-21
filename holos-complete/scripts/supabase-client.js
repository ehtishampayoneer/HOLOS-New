/* ============================================================
   HOLOS — Supabase Client
   The publishable key is SAFE to expose in client code — that's
   what it's designed for. Row Level Security in the database is
   what actually protects data.
   ============================================================ */

(function () {
  const SUPABASE_URL = 'https://tjpacrkpcbeuvclzaawg.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LVjpigfIAt4_WP8IjeFgxA_22N4hoQy';

  // window.supabase is the global from the CDN library.
  // We wrap in an IIFE so our local name doesn't shadow it.
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  window.supabaseClient = client;
  log('Supabase', 'client initialized → ' + SUPABASE_URL);
})();
