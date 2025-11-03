import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Support multiple prefixes so you don't have to rename your existing vars.
// Preferred: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// Also supported via vite.config.js envPrefix: LOOBITES_APP_ and LOOBTITES_APP_
const url =
  (import.meta as any).env.VITE_SUPABASE_URL ||
  (import.meta as any).env.LOOBITES_APP_SUPABASE_URL ||
  (import.meta as any).env.LOOBTITES_APP_SUPABASE_URL;

const anonKey =
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env.LOOBITES_APP_ANON_KEY ||
  (import.meta as any).env.LOOBTITES_APP_ANON_KEY;

if (!url || !anonKey) {
  // Surface a helpful message in dev if env is missing/misnamed
  console.warn(
    "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or LOOBITES_APP_*)."
  );
}

let sb: SupabaseClient | null = null;
if (url && anonKey) {
  sb = createClient(url as string, anonKey as string);
}

export const supabase = sb;

