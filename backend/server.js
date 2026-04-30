const express = require('express')
const cors = require('cors')
const aiRoutes = require('./routes/ai')
const { requireAuthenticatedUser } = require('./src/middleware/requireAuthenticatedUser')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/workouts', requireAuthenticatedUser, async (request, response) => {
  const { supabase } = request.auth
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return response.status(500).json({ error: error.message })
  }

  response.json(data)
})

app.post('/workouts', requireAuthenticatedUser, async (request, response) => {
  const { supabase, user } = request.auth
  const { exercise_name, sets, reps, weight, notes } = request.body

  const { data, error } = await supabase
    .from('workouts')
    .insert([
      {
        user_id: user.id,
        exercise_name,
        sets,
        reps,
        weight,
        notes,
      },
    ])
    .select()
    .single()

  if (error) {
    return response.status(500).json({ error: error.message })
  }

  response.status(201).json(data)
})

app.put('/workouts/:id', requireAuthenticatedUser, async (request, response) => {
  const { supabase } = request.auth
  const { id } = request.params
  const { exercise_name, sets, reps, weight, notes } = request.body

  const { data, error } = await supabase
    .from('workouts')
    .update({
      exercise_name,
      sets,
      reps,
      weight,
      notes,
    })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) {
    return response.status(500).json({ error: error.message })
  }

  if (!data) {
    return response.status(404).json({
      error:
        'Workout not found or not allowed by your Supabase update policy.',
    })
  }

  response.json(data)
})

app.delete(
  '/workouts/:id',
  requireAuthenticatedUser,
  async (request, response) => {
    const { supabase } = request.auth
    const { id } = request.params

    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    if (!data) {
      return response.status(404).json({
        error:
          'Workout not found or not allowed by your Supabase delete policy.',
      })
    }

    response.json(data)
  },
)

app.use('/api/ai', aiRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
