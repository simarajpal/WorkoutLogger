const express = require('express')
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai')
const { requireAuthenticatedUser } = require('../src/middleware/requireAuthenticatedUser')

const router = express.Router()

const parsingInstructions = `
You are a workout parser for a fitness tracking application.

Return JSON only. Never return markdown. Never explain your reasoning.

Return an object with this exact shape:
{
  "workouts": [
    {
      "exercise_name": "string",
      "sets": number or null,
      "reps": number or null,
      "weight": number or null,
      "duration": "string or null",
      "notes": "string or null"
    }
  ],
  "error": "string or null"
}

Rules:
- Extract exercise names clearly.
- Use null when a value is not stated.
- Keep duration as a short human-readable string like "42 minutes" or "5 miles".
- If the user mentions cardio or timing information, store that detail in duration or notes.
- Do not invent values.
- If there are multiple exercises, return them in the same order the user described them.
- If the input is too vague or not a workout, return {"workouts":[],"error":"Could not parse workout"}.
- For running, jogging, cycling, or other cardio, use a clear exercise name like "Running" or "Cycling".
`.trim()

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    workouts: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          exercise_name: {
            type: SchemaType.STRING,
          },
          sets: {
            type: SchemaType.NUMBER,
            nullable: true,
          },
          reps: {
            type: SchemaType.NUMBER,
            nullable: true,
          },
          weight: {
            type: SchemaType.NUMBER,
            nullable: true,
          },
          duration: {
            type: SchemaType.STRING,
            nullable: true,
          },
          notes: {
            type: SchemaType.STRING,
            nullable: true,
          },
        },
        required: ['exercise_name', 'sets', 'reps', 'weight', 'duration', 'notes'],
      },
    },
    error: {
      type: SchemaType.STRING,
      nullable: true,
    },
  },
  required: ['workouts', 'error'],
}

function coerceNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsedNumber = Number(value.trim())
    return Number.isFinite(parsedNumber) ? parsedNumber : null
  }

  return null
}

function normalizeWorkout(workout = {}) {
  return {
    exercise_name:
      typeof workout.exercise_name === 'string'
        ? workout.exercise_name.trim()
        : '',
    sets: coerceNullableNumber(workout.sets),
    reps: coerceNullableNumber(workout.reps),
    weight: coerceNullableNumber(workout.weight),
    duration:
      typeof workout.duration === 'string' && workout.duration.trim()
        ? workout.duration.trim()
        : null,
    notes:
      typeof workout.notes === 'string' && workout.notes.trim()
        ? workout.notes.trim()
        : null,
  }
}

function getRetrySeconds(errorDetails = []) {
  const retryInfo = errorDetails.find(
    (detail) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
  )

  if (!retryInfo?.retryDelay) {
    return null
  }

  const retrySeconds = Number.parseInt(retryInfo.retryDelay, 10)
  return Number.isFinite(retrySeconds) ? retrySeconds : null
}

router.post('/parse-workout', requireAuthenticatedUser, async (request, response) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  const inputText = request.body?.text

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing GEMINI_API_KEY.' })
  }

  if (apiKey === 'your_gemini_api_key_here') {
    return response.status(500).json({
      error: 'Replace the placeholder GEMINI_API_KEY in backend/.env with your real Google AI Studio key.',
    })
  }

  if (!inputText || !inputText.trim()) {
    return response.status(400).json({ error: 'Please provide workout text.' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      // Use Google's current stable Flash model for structured parsing.
      model: 'gemini-2.5-flash',
      systemInstruction: parsingInstructions,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    })

    const result = await model.generateContent(
      `Parse this workout description into JSON only:\n${inputText.trim()}`,
    )
    const rawText = result.response.text()
    const parsedJson = JSON.parse(rawText)

    if (parsedJson?.error) {
      return response.status(422).json({ error: 'Could not parse workout' })
    }

    const parsedWorkouts = Array.isArray(parsedJson?.workouts)
      ? parsedJson.workouts
      : []
    const normalizedWorkouts = parsedWorkouts
      .map(normalizeWorkout)
      .filter((workout) => workout.exercise_name)

    if (normalizedWorkouts.length === 0) {
      return response.status(422).json({ error: 'Could not parse workout' })
    }

    if (normalizedWorkouts.length === 1) {
      return response.json(normalizedWorkouts[0])
    }

    return response.json(normalizedWorkouts)
  } catch (error) {
    console.error('Gemini workout parsing failed:', error)

    if (error.status === 429) {
      const retrySeconds = getRetrySeconds(error.errorDetails)
      const retryMessage = retrySeconds
        ? ` Try again in about ${retrySeconds} seconds.`
        : ''

      return response.status(429).json({
        error: `Gemini API quota exceeded for this project.${retryMessage}`,
      })
    }

    return response.status(500).json({ error: 'Could not parse workout' })
  }
})

module.exports = router
