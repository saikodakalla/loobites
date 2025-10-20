import { createClient } from '@supabase/supabase-js'

// Support multiple prefixes so you don't have to rename your existing vars.
// Preferred: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// Also supported via vite.config.js envPrefix: LOOBITES_APP_ and LOOBTITES_APP_
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.LOOBITES_APP_SUPABASE_URL ||
  import.meta.env.LOOBTITES_APP_SUPABASE_URL

const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.LOOBITES_APP_ANON_KEY ||
  import.meta.env.LOOBTITES_APP_ANON_KEY

if (!url || !anonKey) {
  // Surface a helpful message in dev if env is missing/misnamed
  console.warn('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or LOOBITES_APP_*).')
}

// Only create the client when both are present to avoid runtime crash
let sb = null
if (url && anonKey) {
  sb = createClient(url, anonKey)
}

export const supabase = sb
