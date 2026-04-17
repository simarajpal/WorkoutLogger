import { useState } from 'react'
import { logWorkout } from '../services/api'

function WorkoutForm({ onWorkoutLogged }) {
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const newWorkout = await logWorkout({
        exercise_name: exerciseName,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        notes,
      })

      setSuccessMessage(`Saved ${newWorkout.exercise_name} successfully.`)
      setExerciseName('')
      setSets('')
      setReps('')
      setWeight('')
      setNotes('')

      if (onWorkoutLogged) {
        onWorkoutLogged(newWorkout)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h2>Log a Workout</h2>
      <form className="workout-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Exercise Name</span>
          <input
            type="text"
            value={exerciseName}
            onChange={(event) => setExerciseName(event.target.value)}
            placeholder="Bench Press"
            required
          />
        </label>

        <label className="form-field">
          <span>Sets</span>
          <input
            type="number"
            value={sets}
            onChange={(event) => setSets(event.target.value)}
            placeholder="3"
            min="1"
            required
          />
        </label>

        <label className="form-field">
          <span>Reps</span>
          <input
            type="number"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            placeholder="10"
            min="1"
            required
          />
        </label>

        <label className="form-field">
          <span>Weight</span>
          <input
            type="number"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="135"
            min="0"
            required
          />
        </label>

        <label className="form-field">
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Felt strong today"
            rows="4"
          />
        </label>

        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </button>

        {successMessage && <p className="success-text">{successMessage}</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </form>
    </section>
  )
}

export default WorkoutForm
