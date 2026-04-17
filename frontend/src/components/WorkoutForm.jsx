import { useEffect, useState } from 'react'
import { logWorkout, updateWorkout } from '../services/api'

function WorkoutForm({ editingWorkout, onWorkoutSaved, onCancelEdit }) {
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (editingWorkout) {
      setExerciseName(editingWorkout.exercise_name)
      setSets(String(editingWorkout.sets))
      setReps(String(editingWorkout.reps))
      setWeight(String(editingWorkout.weight))
      setNotes(editingWorkout.notes || '')
      setSuccessMessage('')
      setErrorMessage('')
      return
    }

    setExerciseName('')
    setSets('')
    setReps('')
    setWeight('')
    setNotes('')
  }, [editingWorkout])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const workoutPayload = {
        exercise_name: exerciseName,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        notes,
      }

      let savedWorkout

      if (editingWorkout) {
        savedWorkout = await updateWorkout(editingWorkout.id, workoutPayload)
        setSuccessMessage(`Updated ${savedWorkout.exercise_name} successfully.`)
      } else {
        savedWorkout = await logWorkout(workoutPayload)
        setSuccessMessage(`Saved ${savedWorkout.exercise_name} successfully.`)
        setExerciseName('')
        setSets('')
        setReps('')
        setWeight('')
        setNotes('')
      }

      if (onWorkoutSaved) {
        onWorkoutSaved(savedWorkout)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h2>{editingWorkout ? 'Edit Workout' : 'Log a Workout'}</h2>
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

        <div className="form-actions">
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : editingWorkout
                ? 'Update Workout'
                : 'Save Workout'}
          </button>

          {editingWorkout && (
            <button
              className="secondary-button"
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {successMessage && <p className="success-text">{successMessage}</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </form>
    </section>
  )
}

export default WorkoutForm
