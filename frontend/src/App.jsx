import { useState, useEffect } from 'react'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'
import AuthForm from './components/AuthForm'
import { supabase } from './supabaseClient'

/**
 * Main App Component
 * Manages the overall application state and layout, including authentication
 */
function App() {
  // State to store weather data from API
  const [weatherData, setWeatherData] = useState(null)
  // State to track loading status for weather search
  const [loading, setLoading] = useState(false)
  // State to store error messages for weather search
  const [error, setError] = useState(null)
  
  // Authentication state
  // State to store the current authenticated user (null if not logged in)
  const [user, setUser] = useState(null)
  // State to control whether auth form is visible
  const [showAuthForm, setShowAuthForm] = useState(false)
  // State to track initial auth check (prevents flash of wrong UI)
  const [authLoading, setAuthLoading] = useState(true)

  /**
   * Effect hook to check authentication state on component mount
   * and listen for auth state changes (sign in, sign out, etc.)
   * 
   * This runs once when the component first loads
   */
  useEffect(() => {
    // Check if user is already logged in (e.g., page refresh)
    // This gets the current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth state changes (sign in, sign out, token refresh, etc.)
    // This subscription will fire whenever auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Update user state when auth state changes
      setUser(session?.user ?? null)
      // Hide auth form when user successfully signs in
      if (session?.user) {
        setShowAuthForm(false)
      }
    })

    // Cleanup: unsubscribe when component unmounts to prevent memory leaks
    return () => subscription.unsubscribe()
  }, [])

  /**
   * Handles successful authentication
   * Called by AuthForm component after user signs in or signs up
   * @param {Object} userData - The authenticated user object from Supabase
   */
  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuthForm(false) // Hide auth form after successful authentication
  }

  /**
   * Handles user sign out
   * Signs out the current user using Supabase auth
   */
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        // Optionally show error message to user
      } else {
        // User state will be updated automatically by the auth state listener
        setUser(null)
      }
    } catch (err) {
      console.error('Unexpected error signing out:', err)
    }
  }

  /**
   * Handles the search form submission
   * Fetches weather data from the backend API
   * @param {string} city - The city name to search for
   */
  const handleSearch = async (city) => {
    // Reset previous error and data
    setError(null)
    setWeatherData(null)
    setLoading(true)

    try {
      // Call backend API endpoint
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Parse JSON response
      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      // Handle errors (network, parsing, etc.)
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      // Always stop loading indicator
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header 
        user={user} 
        onSignOut={handleSignOut}
        onShowAuth={() => setShowAuthForm(true)}
      />
      <main className="main-content">
        {/* Show auth form if user clicked sign in/up and is not logged in */}
        {showAuthForm && !user && (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        )}
        
        {/* Weather search form and results (always visible) */}
        <SearchForm onSearch={handleSearch} loading={loading} />
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        {weatherData && <ResultCard data={weatherData} />}
      </main>
    </div>
  )
}

export default App
