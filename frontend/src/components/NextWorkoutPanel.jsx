import { useState } from 'react'
import { generateNextWorkout } from '../services/api'

function formatSuggestedWeight(weight) {
  return weight === null || weight === undefined ? 'bodyweight' : weight
}

function NextWorkoutPanel({ onLoadIntoForm }) {
  const [nextWorkout, setNextWorkout] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleGenerateNextWorkout() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const workout = await generateNextWorkout()
      setNextWorkout(workout)
    } catch (error) {
      setErrorMessage(error.message || 'Could not generate next workout.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasExercises = nextWorkout?.exercises?.length > 0

  return (
    <section className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
            AI next workout
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Generate your next session
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Build a session from your logged history and recent recovery.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-[#22c55e] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          onClick={handleGenerateNextWorkout}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              Generating...
            </span>
          ) : (
            'Generate Next Workout'
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      {isLoading && (
        <div className="mt-6 rounded-3xl border border-[#1e1e1e] bg-[#0f0f0f] p-5">
          <p className="text-sm font-semibold text-white">
            Checking your recent training balance...
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            The coach is choosing rested muscle groups and matching weights to
            your history.
          </p>
        </div>
      )}

      {nextWorkout?.insufficientData && !isLoading && (
        <p className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm leading-6 text-blue-200">
          Log at least one workout so the AI can personalize your next session
        </p>
      )}

      {hasExercises && !isLoading && (
        <div className="mt-6 rounded-3xl border border-[#1e1e1e] bg-[#0f0f0f] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                {nextWorkout.sessionTitle}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#86efac]">
                {nextWorkout.focusArea}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm italic leading-6 text-zinc-400">
            {nextWorkout.reasoning}
          </p>

          <div className="mt-5 grid gap-3">
            {nextWorkout.exercises.map((exercise, index) => (
              <article
                className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-4"
                key={`${exercise.name}-${index}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-lg font-bold tracking-tight text-white">
                      {exercise.name}
                    </h4>
                    <p className="mt-1 text-sm text-zinc-400">
                      <span className="font-semibold text-white">
                        {exercise.sets}
                      </span>{' '}
                      sets x{' '}
                      <span className="font-semibold text-white">
                        {exercise.reps}
                      </span>{' '}
                      reps
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-left sm:text-right">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                      Weight
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      {formatSuggestedWeight(exercise.suggestedWeight)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {exercise.notes}
                </p>
              </article>
            ))}
          </div>

          <button
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#22c55e] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#4ade80]"
            type="button"
            onClick={() => onLoadIntoForm(nextWorkout)}
          >
            Load into Form
          </button>
        </div>
      )}
    </section>
  )
}

export default NextWorkoutPanel
