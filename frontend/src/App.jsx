import { useEffect, useState } from 'react'
import WorkoutForm from './components/WorkoutForm'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Loading...')
  const [errorMessage, setErrorMessage] = useState('')
  const [latestWorkoutName, setLatestWorkoutName] = useState('')

  useEffect(() => {
    async function loadBackendStatus() {
      try {
        const response = await fetch('http://localhost:3001/health')
        const data = await response.json()
        setBackendStatus(data.status)
      } catch (error) {
        setBackendStatus('Unavailable')
        setErrorMessage('Could not reach the backend server.')
      }
    }

    loadBackendStatus()
  }, [])

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
        onWorkoutLogged={(newWorkout) => {
          setLatestWorkoutName(newWorkout.exercise_name)
        }}
      />

      {latestWorkoutName && (
        <section className="card">
          <h2>Latest Saved Workout</h2>
          <p>
            Most recent save: <strong>{latestWorkoutName}</strong>
          </p>
        </section>
      )}
    </main>
  )
}

export default App
