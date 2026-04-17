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
    <section className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-6 shadow-2xl shadow-black/30">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
            Workout form
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {editingWorkout ? 'Edit Workout' : 'Log a Workout'}
          </h2>
        </div>

        {editingWorkout && (
          <div className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-3 text-sm text-[#86efac]">
            You are editing an existing workout.
          </div>
        )}
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-200">
              Exercise Name
            </span>
            <input
              className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
              type="text"
              value={exerciseName}
              onChange={(event) => setExerciseName(event.target.value)}
              placeholder="Bench Press"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-200">Sets</span>
            <input
              className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
              type="number"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
              placeholder="3"
              min="1"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-200">Reps</span>
            <input
              className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
              type="number"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              placeholder="10"
              min="1"
              required
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-200">Weight</span>
            <input
              className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
              type="number"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="135"
              min="0"
              required
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-200">Notes</span>
          <textarea
            className="min-h-28 rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Felt strong today"
            rows="4"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex items-center justify-center rounded-full bg-[#22c55e] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : editingWorkout
                ? 'Update Workout'
                : 'Save Workout'}
          </button>

          {editingWorkout && (
            <button
              className="inline-flex items-center justify-center rounded-full border border-[#1e1e1e] bg-[#0f0f0f] px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-[#22c55e]/40 hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {successMessage && (
          <p className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-3 text-sm text-[#86efac]">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  )
}

export default WorkoutForm
