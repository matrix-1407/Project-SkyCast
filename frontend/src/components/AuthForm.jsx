import { useState } from 'react'
import { supabase } from '../supabaseClient'

/**
 * AuthForm Component
 * 
 * Handles user authentication (sign up and sign in) using email and password.
 * 
 * This component provides:
 * - Email and password input fields
 * - Sign Up button (creates new account)
 * - Sign In button (logs in existing user)
 * - Basic error handling and validation
 * 
 * @param {Function} onAuthSuccess - Callback function called after successful authentication
 */
function AuthForm({ onAuthSuccess }) {
  // State to store email input value
  const [email, setEmail] = useState('')
  // State to store password input value
  const [password, setPassword] = useState('')
  // State to track if we're in "sign up" mode (true) or "sign in" mode (false)
  const [isSignUp, setIsSignUp] = useState(false)
  // State to store error messages to display to user
  const [error, setError] = useState(null)
  // State to track loading state during authentication
  const [loading, setLoading] = useState(false)

  /**
   * Handles form submission for both sign up and sign in
   * Prevents default form behavior and calls the appropriate Supabase auth function
   */
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent page refresh
    
    // Reset error state
    setError(null)

    // Validate that email and password are not empty
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Password length validation (minimum 6 characters)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up: Create a new user account
        // Supabase will send a confirmation email by default
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        })

        if (signUpError) {
          // Handle sign up errors (e.g., email already exists, weak password)
          setError(signUpError.message || 'Failed to create account')
          return
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setError('Please check your email to confirm your account')
          return
        }

        // If we have a session, user is automatically signed in
        if (data.session) {
          onAuthSuccess(data.user)
        }
      } else {
        // Sign in: Authenticate existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        if (signInError) {
          // Handle sign in errors (e.g., invalid credentials, user not found)
          setError(signInError.message || 'Invalid email or password')
          return
        }

        // On successful sign in, call the success callback with user data
        if (data.user) {
          onAuthSuccess(data.user)
        }
      }
    } catch (err) {
      // Handle unexpected errors (network issues, etc.)
      setError('An unexpected error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      // Always stop loading indicator
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3 className="auth-form-title">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h3>

        {/* Display error message if any */}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {/* Email input field */}
        <div className="auth-field">
          <label htmlFor="auth-email" className="auth-label">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            className="auth-input"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            aria-label="Email address"
          />
        </div>

        {/* Password input field */}
        <div className="auth-field">
          <label htmlFor="auth-password" className="auth-label">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            className="auth-input"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
            aria-label="Password"
          />
        </div>

        {/* Submit button - changes text based on sign up/sign in mode */}
        <button
          type="submit"
          className="auth-submit-button"
          disabled={loading}
          aria-label={isSignUp ? 'Sign up' : 'Sign in'}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        {/* Toggle between sign up and sign in modes */}
        <div className="auth-toggle">
          <button
            type="button"
            className="auth-toggle-button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null) // Clear errors when switching modes
              setEmail('') // Clear form
              setPassword('')
            }}
            disabled={loading}
            aria-label={isSignUp ? 'Switch to sign in' : 'Switch to sign up'}
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AuthForm
