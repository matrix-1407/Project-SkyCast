import { useState } from 'react'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'

/**
 * Main App Component
 * Manages the overall application state and layout
 */
function App() {
  // State to store weather data from API
  const [weatherData, setWeatherData] = useState(null)
  // State to track loading status
  const [loading, setLoading] = useState(false)
  // State to store error messages
  const [error, setError] = useState(null)

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

  return (
    <div className="app">
      <Header />
      <main className="main-content">
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
