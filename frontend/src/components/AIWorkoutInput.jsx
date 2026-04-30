import { useState } from 'react'
import { parseWorkoutWithAI } from '../services/api'

function AIWorkoutInput({ onParsed }) {
  const [inputText, setInputText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleParse() {
    if (!inputText.trim()) {
      setErrorMessage('Enter a workout description first.')
      return
    }

    setIsParsing(true)
    setErrorMessage('')

    try {
      const parsedWorkouts = await parseWorkoutWithAI(inputText)
      onParsed(parsedWorkouts)
    } catch (error) {
      setErrorMessage(
        error.message || "Couldn't understand that, try rephrasing.",
      )
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <section className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-6 shadow-2xl shadow-black/30">
      <div className="mb-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
          AI workout input
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Describe your workout naturally
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          Type a sentence like &quot;Did 3 sets of bench press at 185 lbs, 8 reps
          each&quot; and the app will turn it into reviewable workout entries.
        </p>
      </div>

      <div className="grid gap-4">
        <textarea
          className="min-h-32 rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder='Example: "Squats: 4x10 at 225, then deadlifts 3x5 at 315"'
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="inline-flex items-center justify-center rounded-full bg-[#22c55e] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            onClick={handleParse}
            disabled={isParsing}
          >
            {isParsing ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Parsing...
              </span>
            ) : (
              'Parse with AI'
            )}
          </button>

          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Nothing is saved until you confirm it.
          </p>
        </div>

        {errorMessage && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default AIWorkoutInput
