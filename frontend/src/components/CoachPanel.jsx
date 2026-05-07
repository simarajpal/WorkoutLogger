import { useState } from 'react'
import { getCoachReport } from '../services/api'

const recommendationStyles = {
  warning: {
    border: 'border-amber-400/30',
    background: 'bg-amber-400/10',
    label: 'text-amber-200',
  },
  positive: {
    border: 'border-[#22c55e]/30',
    background: 'bg-[#22c55e]/10',
    label: 'text-[#86efac]',
  },
  suggestion: {
    border: 'border-blue-400/30',
    background: 'bg-blue-400/10',
    label: 'text-blue-200',
  },
}

function CoachPanel() {
  const [coachReport, setCoachReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleGetCoachReport() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const report = await getCoachReport()
      setCoachReport(report)
    } catch (error) {
      setErrorMessage(error.message || 'Could not generate coach report.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-[#1e1e1e] bg-[#141414] p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
            AI progress coach
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Training report
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Get a fresh, data-grounded read on your recent workout patterns.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-[#22c55e] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          onClick={handleGetCoachReport}
          disabled={isLoading}
        >
          {isLoading ? 'Building report...' : 'Get AI Coach Report'}
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
            Reading your last 30 days of training...
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            This usually takes a few seconds while Gemini reviews the pattern.
          </p>
        </div>
      )}

      {coachReport && !isLoading && (
        <div className="mt-6 rounded-3xl border border-[#1e1e1e] bg-[#0f0f0f] p-5">
          <p className="text-sm leading-6 text-zinc-300">{coachReport.summary}</p>

          {coachReport.insufficientData ? (
            <p className="mt-4 rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm leading-6 text-blue-200">
              {coachReport.coachNote}
            </p>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {coachReport.recommendations.map((recommendation, index) => {
                const styles =
                  recommendationStyles[recommendation.type] ||
                  recommendationStyles.suggestion

                return (
                  <article
                    className={`rounded-3xl border ${styles.border} ${styles.background} p-4`}
                    key={`${recommendation.title}-${index}`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${styles.label}`}
                    >
                      {recommendation.type}
                    </p>
                    <h3 className="mt-3 text-lg font-bold tracking-tight text-white">
                      {recommendation.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {recommendation.detail}
                    </p>
                  </article>
                )
              })}
            </div>
          )}

          {coachReport.coachNote && !coachReport.insufficientData && (
            <p className="mt-5 rounded-2xl border border-[#1e1e1e] bg-[#141414] px-4 py-3 text-sm leading-6 text-zinc-400">
              {coachReport.coachNote}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default CoachPanel
