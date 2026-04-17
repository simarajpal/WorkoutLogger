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
    <main className="app-shell">
      <section className="card auth-card">
        <p className="eyebrow">Supabase Auth</p>
        <h1>{mode === 'signup' ? 'Create Account' : 'Log In'}</h1>
        <p className="intro">
          Sign up or log in to see only your own workouts.
        </p>

        <form className="workout-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a password"
              required
            />
          </label>

          <div className="form-actions">
            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Working...'
                : mode === 'signup'
                  ? 'Sign Up'
                  : 'Log In'}
            </button>

            <button
              className="secondary-button"
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

          {successMessage && <p className="success-text">{successMessage}</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}
        </form>
      </section>
    </main>
  )
}

export default Auth
