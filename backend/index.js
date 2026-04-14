const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

app.use(cors())

app.get('/health', (request, response) => {
  response.json({ status: 'ok' })
})

// app.listen starts the server and keeps it running until you stop the process.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
