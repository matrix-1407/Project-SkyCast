import Header from './components/Header'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'
import AuthForm from './components/AuthForm'
import { supabase } from './supabaseClient'
import { useEffect, useState } from "react";


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

  // Stores previous weather searches of logged-in user
  const [previousSearches, setPreviousSearches] = useState([]);

  // Loading state while fetching history
  const [loadingHistory, setLoadingHistory] = useState(false);


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
  * Load previous searches whenever user logs in or changes
  */
  useEffect(() => {
    if (user && user.id) {
      fetchPreviousSearches(user.id)
    } else {
      setPreviousSearches([])
    }
  }, [user])


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
   * Saves a weather search to the Supabase database
   * This function runs asynchronously and does not block the UI
   * Errors are logged to console but not shown to the user
   * 
   * @param {string} city - The city name that was searched
   * @param {Object} weatherData - The weather data object from the API
   */
  const saveSearchToDatabase = async (city, weatherData) => {
    try {
      // Get the current session - the Supabase client uses this automatically for RLS
      // RLS policy evaluates auth.uid() from the session token in the request headers
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session for database insert:', sessionError)
        return
      }

      if (!session || !session.user) {
        console.log('No active session - skipping database insert')
        return
      }

      // Get the authenticated user's ID from the session
      // RLS policy requires: auth.uid() = user_id
      // The Supabase client automatically includes the session token in requests
      // auth.uid() in the RLS policy will extract the user ID from the JWT token
      const userId = session.user.id

      // Verify session has access token (required for RLS)
      if (!session.access_token) {
        console.error('Session missing access token - cannot authenticate database request')
        return
      }

      // Extract temperature and weather description from API response
      const temperature = weatherData.main?.temp
      const weatherDescription = weatherData.weather?.[0]?.main || weatherData.weather?.[0]?.description || 'Unknown'

      // Prepare the insert payload
      // The user_id must match auth.uid() from the session token for RLS to allow the insert
      const insertPayload = {
        user_id: userId,
        city: city,
        temperature: temperature,
        weather: weatherDescription
      }

      // Debug logging to verify data before insert
      console.log('Attempting to insert search:', {
        userId: userId,
        userIdType: typeof userId,
        city: city,
        temperature: temperature,
        weather: weatherDescription,
        hasAccessToken: !!session.access_token
      })

      // Insert the search into the user_searches table
      // The Supabase client automatically includes the session's access_token in the Authorization header
      // RLS policy evaluates: auth.uid() (from JWT) = user_id (from insert payload)
      const { data, error } = await supabase
        .from('user_searches')
        .insert(insertPayload)
        .select()

      // Log errors to console for debugging, but don't show to user
      if (error) {
        console.error('Error saving search to database:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        console.error('Session user ID:', userId)
        console.error('Insert payload:', insertPayload)
      } else {
        console.log('Successfully saved search to database:', data)
      }
    } catch (err) {
      // Catch any unexpected errors and log them
      // This ensures database errors don't break the application
      console.error('Unexpected error saving search to database:', err)
    }
  }

  /**
   * Handles the search form submission
   * Fetches weather data from the backend API
   * @param {string} city - The city name to search for
   */

    /**
   * Fetch last 5 previous weather searches for the logged-in user
   * Uses Supabase Row Level Security (RLS)
   */
  const fetchPreviousSearches = async (userId) => {
    setLoadingHistory(true)

    const { data, error } = await supabase
      .from('user_searches')
      .select('city, temperature, weather, created_at')
      .eq('user_id', userId) // Ensures only user's own data
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching previous searches:', error)
      setPreviousSearches([])
    } else {
      setPreviousSearches(data)
    }

    setLoadingHistory(false)
  }


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

      // Save search to database if user is authenticated
      // This runs asynchronously and won't block the UI or break weather display if it fails
      // We check user state, but saveSearchToDatabase will verify the session directly
      if (user && user.id) {
        // Fire-and-forget: don't await this to avoid blocking UI
        // The function will get the user ID from the active session for RLS compatibility
        saveSearchToDatabase(city, data)
      }
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
        {/* Previous Searches - visible only when logged in */}
        {user && (
          <div style={{ marginTop: '20px' }}>
            <h3>Previous Searches</h3>

            {loadingHistory && <p>Loading previous searches...</p>}

            {!loadingHistory && previousSearches.length === 0 && (
              <p>No previous searches found.</p>
            )}

            <ul>
              {previousSearches.map((search, index) => (
                <li key={index}>
                  <strong>{search.city}</strong> — {search.temperature}°C, {search.weather}
                  <br />
                  <small>
                    {new Date(search.created_at).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
