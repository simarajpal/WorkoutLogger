import { useEffect, useState } from 'react'
import WorkoutForm from './components/WorkoutForm'
import Auth from './pages/Auth'
import { supabase } from './config/supabase'
import { deleteWorkout, getWorkouts } from './services/api'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('Loading...')
  const [errorMessage, setErrorMessage] = useState('')
  const [workouts, setWorkouts] = useState([])
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [listMessage, setListMessage] = useState('')
  const [listErrorMessage, setListErrorMessage] = useState('')

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      setSession(currentSession)
      setAuthLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)

      if (event === 'SIGNED_OUT') {
        setWorkouts([])
        setEditingWorkout(null)
        setListMessage('')
        setListErrorMessage('')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    async function loadWorkoutData() {
      if (!session) {
        return
      }

      try {
        const [healthResponse, workoutData] = await Promise.all([
          fetch('http://localhost:3001/health'),
          getWorkouts(),
        ])
        const healthData = await healthResponse.json()
        setBackendStatus(healthData.status)
        setWorkouts(workoutData)
        setErrorMessage('')
      } catch (error) {
        setBackendStatus('Unavailable')
        setErrorMessage(error.message || 'Could not load your workouts.')
      }
    }

    loadWorkoutData()
  }, [session])

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

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <main className="app-shell">
        <section className="card">
          <h1>Loading session...</h1>
          <p>Checking whether you are already logged in.</p>
        </section>
      </main>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <main className="app-shell">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Signed in</p>
          <p className="user-email">{session.user.email}</p>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <h1>Workout Logger</h1>
      <p className="intro">
        Your workouts are now filtered by the logged-in Supabase user.
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
