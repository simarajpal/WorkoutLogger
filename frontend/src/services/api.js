const API_BASE_URL = 'http://localhost:3001'

export async function getWorkouts() {
  const response = await fetch(`${API_BASE_URL}/workouts`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load workouts.')
  }

  return data
}

export async function logWorkout(workoutData) {
  const response = await fetch(`${API_BASE_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete workout.')
  }

  return data
}
