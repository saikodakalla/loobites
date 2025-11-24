import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.UPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
