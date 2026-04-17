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

export async function getWorkouts() {
  const response = await fetch(`${API_BASE_URL}/workouts`, {
    headers: await createAuthHeaders(),
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load workouts.')
  }

  return data
}

export async function logWorkout(workoutData) {
  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: 'POST',
    headers: await createAuthHeaders(true),
    body: JSON.stringify(workoutData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to save workout.')
  }

  return data
}

export async function updateWorkout(id, workoutData) {
  const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
    method: 'PUT',
    headers: await createAuthHeaders(true),
    body: JSON.stringify(workoutData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update workout.')
  }

  return data
}

export async function deleteWorkout(id) {
  const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
    method: 'DELETE',
    headers: await createAuthHeaders(),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete workout.')
  }

  return data
}
