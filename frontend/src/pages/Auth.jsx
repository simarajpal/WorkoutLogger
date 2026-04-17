import { useState } from 'react'
import { supabase } from '../config/supabase'

function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          throw error
        }

        if (data.session) {
          setSuccessMessage('Account created and signed in successfully.')
        } else {
          setSuccessMessage(
            'Account created. Check your email if email confirmation is enabled.',
          )
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        setSuccessMessage('Logged in successfully.')
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-[2rem] border border-[#1e1e1e] bg-[#141414] p-6 shadow-2xl shadow-black/40 sm:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#22c55e]">
            Supabase Auth
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign up or log in to access your private workout dashboard.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-200">Email</span>
            <input
              className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-200">Password</span>
            <input
              className="rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/20"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a password"
              required
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="inline-flex items-center justify-center rounded-full bg-[#22c55e] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Working...'
                : mode === 'signup'
                  ? 'Sign Up'
                  : 'Log In'}
            </button>

            <button
              className="inline-flex items-center justify-center rounded-full border border-[#1e1e1e] bg-[#0f0f0f] px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-[#22c55e]/40 hover:bg-[#181818] disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={() =>
                setMode((currentMode) =>
                  currentMode === 'signup' ? 'login' : 'signup',
                )
              }
              disabled={isSubmitting}
            >
              {mode === 'signup' ? 'Switch to Log In' : 'Switch to Sign Up'}
            </button>
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
    </main>
  )
}

export default Auth
