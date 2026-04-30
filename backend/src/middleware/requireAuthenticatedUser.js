const { createSupabaseClient } = require('../config/supabase')

async function requireAuthenticatedUser(request, response, next) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return response
      .status(401)
      .json({ error: 'Missing or invalid Authorization header.' })
  }

  const supabase = createSupabaseClient(authHeader)
  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return response.status(401).json({ error: 'You must be logged in.' })
  }

  request.auth = { supabase, user }
  next()
}

module.exports = { requireAuthenticatedUser }
