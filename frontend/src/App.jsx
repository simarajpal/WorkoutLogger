import { useEffect, useState } from 'react'
import WorkoutForm from './components/WorkoutForm'
import { deleteWorkout, getWorkouts } from './services/api'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Loading...')
  const [errorMessage, setErrorMessage] = useState('')
  const [workouts, setWorkouts] = useState([])
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [listMessage, setListMessage] = useState('')
  const [listErrorMessage, setListErrorMessage] = useState('')

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [healthResponse, workoutData] = await Promise.all([
          fetch('http://localhost:3001/health'),
          getWorkouts(),
        ])
        const healthData = await healthResponse.json()
        setBackendStatus(healthData.status)
        setWorkouts(workoutData)
      } catch (error) {
        setBackendStatus('Unavailable')
        setErrorMessage('Could not load data from the backend server.')
      }
    }

    loadInitialData()
  }, [])

  async function handleDeleteWorkout(id) {
    const workoutToDelete = workouts.find((workout) => workout.id === id)
    const nextWorkouts = workouts.filter((workout) => workout.id !== id)

    setWorkouts(nextWorkouts)
    setListMessage('')
    setListErrorMessage('')

    if (editingWorkout?.id === id) {
      setEditingWorkout(null)
    }

    try {
      await deleteWorkout(id)
      setListMessage(`Deleted ${workoutToDelete?.exercise_name || 'workout'}.`)
    } catch (error) {
      setWorkouts(workouts)
      setListErrorMessage(error.message)
    }
  }

  function handleStartEdit(workout) {
    setEditingWorkout(workout)
    setListMessage('')
    setListErrorMessage('')
  }

  function handleWorkoutSaved(savedWorkout) {
    setListErrorMessage('')

    if (editingWorkout) {
      setWorkouts((currentWorkouts) =>
        currentWorkouts.map((workout) =>
          workout.id === savedWorkout.id ? savedWorkout : workout,
        ),
      )
      setEditingWorkout(null)
      setListMessage(`Updated ${savedWorkout.exercise_name}.`)
      return
    }

    setWorkouts((currentWorkouts) => [savedWorkout, ...currentWorkouts])
    setListMessage(`Added ${savedWorkout.exercise_name}.`)
  }

  return (
    <main className="app-shell">
      <p className="eyebrow">Frontend is running</p>
      <h1>Workout Logger</h1>
      <p className="intro">
        This page now makes one test request to your Express backend when it
        loads.
      </p>

      <section className="card">
        <h2>Frontend to Backend Test</h2>
        <p>
          Backend status: <strong>{backendStatus}</strong>
        </p>
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </section>

      <WorkoutForm
        editingWorkout={editingWorkout}
        onWorkoutSaved={handleWorkoutSaved}
        onCancelEdit={() => setEditingWorkout(null)}
      />

      <section className="card">
        <h2>Workout List</h2>
        <p className="list-intro">
          This is your current workout data loaded from Supabase through the
          Express backend.
        </p>
        {listMessage && <p className="success-text">{listMessage}</p>}
        {listErrorMessage && <p className="error-text">{listErrorMessage}</p>}

        {workouts.length === 0 ? (
          <p>No workouts logged yet.</p>
        ) : (
          <div className="workout-list">
            {workouts.map((workout) => (
              <article className="workout-item" key={workout.id}>
                <div>
                  <h3>{workout.exercise_name}</h3>
                  <p>
                    {workout.sets} sets x {workout.reps} reps at {workout.weight}
                  </p>
                  <p>{workout.notes || 'No notes yet.'}</p>
                </div>
                <div className="item-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleStartEdit(workout)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => handleDeleteWorkout(workout.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
