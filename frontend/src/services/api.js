import { supabase } from '../config/supabase'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function createAuthHeaders(includeJson = false) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('You must be logged in to manage workouts.')
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
  }

  if (includeJson) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

async function requestJson(path, options = {}, fallbackMessage) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new Error(
      'Could not reach the backend. Check that the backend server is running and that VITE_API_BASE_URL is correct.',
    )
  }

  const responseText = await response.text()
  const data = responseText ? JSON.parse(responseText) : null

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }

  return data
}

export async function getWorkouts() {
  return requestJson(
    '/workouts',
    {
      headers: await createAuthHeaders(),
    },
    'Failed to load workouts.',
  )
}

export async function parseWorkoutWithAI(text) {
  const data = await requestJson(
    '/api/ai/parse-workout',
    {
      method: 'POST',
      headers: await createAuthHeaders(true),
      body: JSON.stringify({ text }),
    },
    'Could not parse workout.',
  )

  return Array.isArray(data) ? data : [data]
}

export async function logWorkout(workoutData) {
  return requestJson(
    '/workouts',
    {
      method: 'POST',
      headers: await createAuthHeaders(true),
      body: JSON.stringify(workoutData),
    },
    'Failed to save workout.',
  )
}

export async function updateWorkout(id, workoutData) {
  return requestJson(
    `/workouts/${id}`,
    {
      method: 'PUT',
      headers: await createAuthHeaders(true),
      body: JSON.stringify(workoutData),
    },
    'Failed to update workout.',
  )
}

export async function deleteWorkout(id) {
  return requestJson(
    `/workouts/${id}`,
    {
      method: 'DELETE',
      headers: await createAuthHeaders(),
    },
    'Failed to delete workout.',
  )
}
