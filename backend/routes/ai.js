const express = require('express')
const Groq = require('groq-sdk')
const { requireAuthenticatedUser } = require('../src/middleware/requireAuthenticatedUser')

const router = express.Router()
const GROQ_MODEL = 'llama-3.1-8b-instant'

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

const coachInstructions = `
You are a data-driven fitness coach for a workout logging app.

Return JSON only. Never return markdown. Never explain your reasoning.

Use only the workout history provided. Do not invent exercises, dates, weights, sets, reps, or goals.

Return an object with this exact shape:
{
  "summary": "string",
  "recommendations": [
    {
      "title": "string",
      "detail": "string",
      "type": "warning" | "positive" | "suggestion"
    }
  ],
  "coachNote": "string"
}

Rules:
- Return exactly 3 recommendations.
- Ground each recommendation in the actual dates, exercises, frequencies, sets, reps, weights, or notes from the data.
- Identify useful patterns.
- Flag possible overtraining when the same exercise or muscle group appears very frequently without variety.
- Flag neglected muscle groups or movement types when the data supports it.
- Keep the summary concise and specific.
- Keep each recommendation actionable, practical, and friendly.
`.trim()

const nextWorkoutInstructions = `
You are a practical strength coach for a workout logging app.

Return JSON only. Never return markdown. Never explain your reasoning.

Return an object with this exact shape:
{
  "sessionTitle": "string",
  "focusArea": "string",
  "reasoning": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": number,
      "suggestedWeight": number or null,
      "notes": "string"
    }
  ]
}

Rules:
- Generate one specific next workout session with 4 to 6 exercises.
- Prioritize undertrained or rested muscle groups from the workout history.
- Avoid muscle groups trained in the last 48 hours.
- Use the muscle group and historical weight data provided by the app.
- Base suggestedWeight on the user's historical weights for that exercise when available.
- If no historical weight exists for an exercise, suggest a beginner-friendly starting weight or null for bodyweight movements.
- Keep the reasoning to 1 or 2 sentences.
- Make notes short, useful form tips or reasons for inclusion.
`.trim()

const exerciseTypePatterns = [
  {
    type: 'chest / push',
    patterns: ['bench', 'push up', 'push-up', 'chest', 'dip', 'fly'],
  },
  {
    type: 'back / pull',
    patterns: ['row', 'pull up', 'pull-up', 'pulldown', 'lat', 'deadlift'],
  },
  {
    type: 'legs',
    patterns: ['squat', 'lunge', 'leg', 'quad', 'hamstring', 'calf', 'hip thrust'],
  },
  {
    type: 'shoulders',
    patterns: ['shoulder', 'press', 'overhead', 'lateral raise', 'rear delt'],
  },
  {
    type: 'arms',
    patterns: ['curl', 'tricep', 'bicep', 'extension'],
  },
  {
    type: 'core',
    patterns: ['plank', 'crunch', 'sit up', 'sit-up', 'abs', 'core'],
  },
  {
    type: 'cardio / conditioning',
    patterns: ['run', 'jog', 'bike', 'cycle', 'rower', 'walk', 'cardio', 'swim'],
  },
]

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

function getExerciseType(exerciseName = '') {
  const normalizedName = exerciseName.toLowerCase()
  const match = exerciseTypePatterns.find(({ patterns }) =>
    patterns.some((pattern) => normalizedName.includes(pattern)),
  )

  return match?.type || 'general strength'
}

function formatWorkoutEntry(workout) {
  const details = [
    `${workout.sets ?? '-'} sets`,
    `${workout.reps ?? '-'} reps`,
    `${workout.weight ?? '-'} weight`,
  ]

  if (workout.notes) {
    details.push(`notes: ${workout.notes}`)
  }

  return `${workout.exercise_name} (${getExerciseType(workout.exercise_name)}): ${details.join(', ')}`
}

function buildCoachHistorySummary(workouts) {
  const sessionsByDate = workouts.reduce((sessions, workout) => {
    const dateKey = new Date(workout.created_at).toISOString().slice(0, 10)

    if (!sessions[dateKey]) {
      sessions[dateKey] = []
    }

    sessions[dateKey].push(workout)
    return sessions
  }, {})

  const exerciseFrequency = {}
  const typeFrequency = {}

  workouts.forEach((workout) => {
    const exerciseName = workout.exercise_name || 'Unknown exercise'
    const exerciseType = getExerciseType(exerciseName)

    exerciseFrequency[exerciseName] = (exerciseFrequency[exerciseName] || 0) + 1
    typeFrequency[exerciseType] = (typeFrequency[exerciseType] || 0) + 1
  })

  const sessionLines = Object.entries(sessionsByDate)
    .map(([date, workoutsForDate]) => {
      const entries = workoutsForDate.map(formatWorkoutEntry).join('; ')
      return `- ${date}: ${entries}`
    })
    .join('\n')

  return `
Last 30 days workout history:

Total logged workout entries: ${workouts.length}
Training dates: ${Object.keys(sessionsByDate).join(', ')}

Exercise frequency:
${JSON.stringify(exerciseFrequency, null, 2)}

Muscle group / exercise type frequency:
${JSON.stringify(typeFrequency, null, 2)}

Sessions:
${sessionLines}
`.trim()
}

function getMuscleGroupsFromWorkout(workout) {
  return [getExerciseType(workout.exercise_name || 'Unknown exercise')]
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

function buildExerciseWeightHistory(workouts) {
  return workouts.reduce((history, workout) => {
    const exerciseName = workout.exercise_name || 'Unknown exercise'
    const weight = coerceNullableNumber(workout.weight)

    if (weight === null) {
      return history
    }

    if (!history[exerciseName]) {
      history[exerciseName] = []
    }

    history[exerciseName].push({
      weight,
      sets: coerceNullableNumber(workout.sets),
      reps: coerceNullableNumber(workout.reps),
      date: workout.created_at,
    })

    return history
  }, {})
}

function buildNextWorkoutHistorySummary(workouts) {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000
  const recentSevenDayWorkouts = workouts.filter(
    (workout) => new Date(workout.created_at).getTime() >= sevenDaysAgo,
  )
  const recentFortyEightHourWorkouts = workouts.filter(
    (workout) => new Date(workout.created_at).getTime() >= fortyEightHoursAgo,
  )
  const trainedLastSevenDays = uniqueValues(
    recentSevenDayWorkouts.flatMap(getMuscleGroupsFromWorkout),
  )
  const trainedLastFortyEightHours = uniqueValues(
    recentFortyEightHourWorkouts.flatMap(getMuscleGroupsFromWorkout),
  )
  const allKnownMuscleGroups = uniqueValues(workouts.flatMap(getMuscleGroupsFromWorkout))
  const undertrainedOrRestedMuscleGroups = allKnownMuscleGroups.filter(
    (muscleGroup) => !trainedLastSevenDays.includes(muscleGroup),
  )
  const exerciseWeightHistory = buildExerciseWeightHistory(workouts)
  const historyLines = workouts
    .map((workout) => {
      const dateKey = new Date(workout.created_at).toISOString().slice(0, 10)
      return `- ${dateKey}: ${formatWorkoutEntry(workout)}`
    })
    .join('\n')

  return `
Full workout history:

Total logged workout entries: ${workouts.length}

Muscle groups trained in the last 7 days:
${JSON.stringify(trainedLastSevenDays, null, 2)}

Muscle groups trained in the last 48 hours that must be avoided:
${JSON.stringify(trainedLastFortyEightHours, null, 2)}

Undertrained or rested muscle groups:
${JSON.stringify(undertrainedOrRestedMuscleGroups, null, 2)}

Historical weights by exercise:
${JSON.stringify(exerciseWeightHistory, null, 2)}

Workout entries:
${historyLines}
`.trim()
}

function normalizeCoachReport(report = {}) {
  const recommendations = Array.isArray(report.recommendations)
    ? report.recommendations
        .slice(0, 3)
        .map((recommendation) => ({
          title:
            typeof recommendation.title === 'string'
              ? recommendation.title.trim()
              : 'Training recommendation',
          detail:
            typeof recommendation.detail === 'string'
              ? recommendation.detail.trim()
              : '',
          type: ['warning', 'positive', 'suggestion'].includes(recommendation.type)
            ? recommendation.type
            : 'suggestion',
        }))
        .filter((recommendation) => recommendation.title && recommendation.detail)
    : []

  return {
    summary:
      typeof report.summary === 'string'
        ? report.summary.trim()
        : 'Here is your AI coach report.',
    recommendations,
    coachNote:
      typeof report.coachNote === 'string' ? report.coachNote.trim() : '',
  }
}

function normalizeNextWorkoutSession(session = {}) {
  const exercises = Array.isArray(session.exercises)
    ? session.exercises
        .slice(0, 6)
        .map((exercise) => ({
          name:
            typeof exercise.name === 'string'
              ? exercise.name.trim()
              : 'Strength exercise',
          sets: coerceNullableNumber(exercise.sets),
          reps: coerceNullableNumber(exercise.reps),
          suggestedWeight: coerceNullableNumber(exercise.suggestedWeight),
          notes:
            typeof exercise.notes === 'string' && exercise.notes.trim()
              ? exercise.notes.trim()
              : 'Move with control and keep clean form.',
        }))
        .filter((exercise) => exercise.name && exercise.sets && exercise.reps)
    : []

  return {
    sessionTitle:
      typeof session.sessionTitle === 'string' && session.sessionTitle.trim()
        ? session.sessionTitle.trim()
        : 'Next Strength Session',
    focusArea:
      typeof session.focusArea === 'string' && session.focusArea.trim()
        ? session.focusArea.trim()
        : 'Balanced Strength',
    reasoning:
      typeof session.reasoning === 'string' && session.reasoning.trim()
        ? session.reasoning.trim()
        : 'This session was selected from your recent training balance.',
    exercises,
  }
}

function getGroqClient(apiKey) {
  return new Groq({ apiKey })
}

async function createJsonCompletion({ apiKey, systemPrompt, userPrompt }) {
  const groq = getGroqClient(apiKey)
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  })

  const content = completion.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Groq returned an empty response.')
  }

  return JSON.parse(content)
}

router.post('/parse-workout', requireAuthenticatedUser, async (request, response) => {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  const inputText = request.body?.text

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing GROQ_API_KEY.' })
  }

  if (apiKey === 'your_groq_api_key_here') {
    return response.status(500).json({
      error: 'Replace the placeholder GROQ_API_KEY in backend/.env with your real Groq API key.',
    })
  }

  if (!inputText || !inputText.trim()) {
    return response.status(400).json({ error: 'Please provide workout text.' })
  }

  try {
    const parsedJson = await createJsonCompletion({
      apiKey,
      systemPrompt: parsingInstructions,
      userPrompt: `Parse this workout description into JSON only:\n${inputText.trim()}`,
    })

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
    console.error('Groq workout parsing failed:', error)

    if (error.status === 429) {
      return response.status(429).json({
        error: 'Groq API rate limit exceeded for this project. Please try again soon.',
      })
    }

    return response.status(500).json({ error: 'Could not parse workout' })
  }
})

router.post('/coach', requireAuthenticatedUser, async (request, response) => {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  const { supabase } = request.auth

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing GROQ_API_KEY.' })
  }

  if (apiKey === 'your_groq_api_key_here') {
    return response.status(500).json({
      error: 'Replace the placeholder GROQ_API_KEY in backend/.env with your real Groq API key.',
    })
  }

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('id, exercise_name, sets, reps, weight, notes, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    if (!workouts || workouts.length < 3) {
      return response.json({
        summary:
          'Log at least 3 workouts so your AI coach has enough recent training data to spot useful patterns.',
        recommendations: [],
        coachNote:
          'Once you have a few sessions in your history, I can give you a more specific progress report.',
        insufficientData: true,
      })
    }

    const historySummary = buildCoachHistorySummary(workouts)
    const rawCoachReport = await createJsonCompletion({
      apiKey,
      systemPrompt: coachInstructions,
      userPrompt: `Create an AI progress coach report from this structured workout history:\n${historySummary}`,
    })
    const coachReport = normalizeCoachReport(rawCoachReport)

    if (coachReport.recommendations.length !== 3) {
      return response.status(502).json({
        error: 'Could not generate a complete coach report. Please try again.',
      })
    }

    return response.json(coachReport)
  } catch (error) {
    console.error('Groq coach report failed:', error)

    if (error.status === 429) {
      return response.status(429).json({
        error: 'Groq API rate limit exceeded for this project. Please try again soon.',
      })
    }

    return response.status(500).json({ error: 'Could not generate coach report' })
  }
})

router.post('/next-workout', requireAuthenticatedUser, async (request, response) => {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  const { supabase } = request.auth

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing GROQ_API_KEY.' })
  }

  if (apiKey === 'your_groq_api_key_here') {
    return response.status(500).json({
      error: 'Replace the placeholder GROQ_API_KEY in backend/.env with your real Groq API key.',
    })
  }

  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('id, exercise_name, sets, reps, weight, notes, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    if (!workouts || workouts.length === 0) {
      return response.json({
        message: 'Log at least one workout so the AI can personalize your next session',
        insufficientData: true,
      })
    }

    const historySummary = buildNextWorkoutHistorySummary(workouts)
    const rawNextWorkout = await createJsonCompletion({
      apiKey,
      systemPrompt: nextWorkoutInstructions,
      userPrompt: `Generate the user's next workout from this structured workout history:\n${historySummary}`,
    })
    const nextWorkout = normalizeNextWorkoutSession(rawNextWorkout)

    if (nextWorkout.exercises.length < 4) {
      return response.status(502).json({
        error: 'Could not generate a complete next workout. Please try again.',
      })
    }

    return response.json(nextWorkout)
  } catch (error) {
    console.error('Groq next workout generation failed:', error)

    if (error.status === 429) {
      return response.status(429).json({
        error: 'Groq API rate limit exceeded for this project. Please try again soon.',
      })
    }

    return response.status(500).json({ error: 'Could not generate next workout' })
  }
})

module.exports = router
