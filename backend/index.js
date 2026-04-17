const express = require('express')
const cors = require('cors')
const supabase = require('./src/config/supabase')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/workouts', async (request, response) => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return response.status(500).json({ error: error.message })
  }

  response.json(data)
})

app.post('/workouts', async (request, response) => {
  const { exercise_name, sets, reps, weight, notes } = request.body

  const { data, error } = await supabase
    .from('workouts')
    .insert([
      {
        user_id: null,
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

// app.listen starts the server and keeps it running until you stop the process.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
