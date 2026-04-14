const express = require('express')
const cors = require('cors')
const supabase = require('./src/config/supabase')

const app = express()
const PORT = 3001

app.use(cors())

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

// app.listen starts the server and keeps it running until you stop the process.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
