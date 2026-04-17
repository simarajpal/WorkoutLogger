import { useEffect, useState } from 'react'
import WorkoutForm from './components/WorkoutForm'
import Auth from './pages/Auth'
import { supabase } from './config/supabase'
import { API_BASE_URL, deleteWorkout, getWorkouts } from './services/api'

function formatWorkoutDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

function formatDateLabel(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
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
        const workoutData = await getWorkouts()
        setWorkouts(workoutData)
        setErrorMessage('')
      } catch (error) {
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

  const totalSessions = workouts.length
  const totalSets = workouts.reduce((sum, workout) => sum + workout.sets, 0)
  const lastWorkout = workouts[0]
  const groupedWorkouts = workouts.reduce((groups, workout) => {
    const dateKey = new Date(workout.created_at).toDateString()

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }

    groups[dateKey].push(workout)
    return groups
  }, {})

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Loading session...
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Checking whether you are already logged in.
          </p>
        </section>
      </main>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#1e1e1e] bg-[#141414] p-4 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Training dashboard
            </p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Workout Logger
              </h1>
              <p className="text-sm text-zinc-400">{session.user.email}</p>
            </div>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-full border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-[#22c55e]/40 hover:bg-[#181818]"
            type="button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </header>

        <section className="rounded-3xl border border-[#1e1e1e] bg-gradient-to-br from-[#141414] via-[#141414] to-[#171717] p-6 shadow-2xl shadow-black/30">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
              Personal dashboard
            </p>
            <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Nike Training Club energy, simple dashboard structure. Each account
              only sees its own workouts through Supabase Auth and RLS.
            </p>
          </div>
        </section>

        {errorMessage && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-5 shadow-xl shadow-black/20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Total sessions
            </p>
            <p className="mt-4 text-4xl font-black tracking-tight text-white">
              {totalSessions}
            </p>
          </article>

          <article className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-5 shadow-xl shadow-black/20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Total sets
            </p>
            <p className="mt-4 text-4xl font-black tracking-tight text-white">
              {totalSets}
            </p>
          </article>

          <article className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-5 shadow-xl shadow-black/20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Last workout
            </p>
            <p className="mt-4 text-2xl font-black tracking-tight text-white">
              {lastWorkout ? lastWorkout.exercise_name : 'None yet'}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {lastWorkout ? formatWorkoutDate(lastWorkout.created_at) : 'Log your first session'}
            </p>
          </article>
        </section>

        <WorkoutForm
          editingWorkout={editingWorkout}
          onWorkoutSaved={handleWorkoutSaved}
          onCancelEdit={() => setEditingWorkout(null)}
        />

        <section className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Workout list
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Recent sessions
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                Every card below is loaded from Supabase through your Express API.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-sm text-zinc-300">
              <span className="font-semibold text-white">{workouts.length}</span>{' '}
              workout{workouts.length === 1 ? '' : 's'}
            </div>
          </div>

          {listMessage && (
            <p className="mt-4 rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-3 text-sm text-[#86efac]">
              {listMessage}
            </p>
          )}
          {listErrorMessage && (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {listErrorMessage}
            </p>
          )}

          {workouts.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[#1e1e1e] bg-[#0f0f0f] px-6 py-10 text-center">
              <p className="text-lg font-semibold text-white">No workouts yet</p>
              <p className="mt-2 text-sm text-zinc-500">
                Log your first session to see it appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {Object.entries(groupedWorkouts).map(([dateKey, workoutsForDate]) => (
                <section key={dateKey}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#1e1e1e]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                      {formatDateLabel(workoutsForDate[0].created_at)}
                    </p>
                    <div className="h-px flex-1 bg-[#1e1e1e]" />
                  </div>

                  <div className="space-y-3">
                    {workoutsForDate.map((workout) => (
                      <article
                        className="rounded-3xl border border-[#1e1e1e] bg-[#0f0f0f] p-5 shadow-lg shadow-black/20"
                        key={workout.id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold tracking-tight text-white">
                              {workout.exercise_name}
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                              <span className="font-semibold text-white">
                                {workout.sets}
                              </span>{' '}
                              sets x{' '}
                              <span className="font-semibold text-white">
                                {workout.reps}
                              </span>{' '}
                              reps
                            </p>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                              {workout.notes || 'No notes yet.'}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-start gap-2">
                            <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] px-4 py-3 text-right">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                                Weight
                              </p>
                              <p className="mt-1 text-2xl font-black text-white">
                                {workout.weight}
                              </p>
                            </div>

                            <button
                              aria-label={`Edit ${workout.exercise_name}`}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#1e1e1e] bg-[#141414] text-zinc-200 transition hover:border-[#22c55e]/40 hover:text-white"
                              type="button"
                              onClick={() => handleStartEdit(workout)}
                            >
                              <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487a2.1 2.1 0 113.03 2.908L8.25 19.5 4 20l.5-4.25 12.362-11.263z"
                                />
                              </svg>
                            </button>

                            <button
                              aria-label={`Delete ${workout.exercise_name}`}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#1e1e1e] bg-[#141414] text-zinc-200 transition hover:border-[#22c55e]/40 hover:text-white"
                              type="button"
                              onClick={() => handleDeleteWorkout(workout.id)}
                            >
                              <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 7h12M9 7V5h6v2m-7 4v6m4-6v6m4-6v6M7 7l1 12h8l1-12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
