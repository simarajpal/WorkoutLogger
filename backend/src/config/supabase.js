const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend/.env',
  )
}

if (
  supabaseUrl === 'your_supabase_project_url_here' ||
  supabaseAnonKey === 'your_supabase_anon_key_here'
) {
  throw new Error(
    'Replace the placeholder Supabase values in backend/.env with your real project URL and anon key.',
  )
}

function createSupabaseClient(authHeader) {
  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }

  if (authHeader) {
    options.global = {
      headers: {
        Authorization: authHeader,
      },
    }
  }
 
  return createClient(supabaseUrl, supabaseAnonKey, options)
}

module.exports = { createSupabaseClient }
