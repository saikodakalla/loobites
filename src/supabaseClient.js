import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'

const supabase = createClient('<INSERT PROJECT URL>', '<INSERT PROJECT ANON API KEY>')

const App = () => <Auth supabaseClient={supabase} />