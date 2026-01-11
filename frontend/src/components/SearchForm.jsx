import { useState } from 'react'

/**
 * SearchForm Component
 * Handles city name input and form submission
 * @param {Function} onSearch - Callback when form is submitted
 * @param {boolean} loading - Whether a search is in progress
 */
function SearchForm({ onSearch, loading }) {
  // State to store the input value
  const [city, setCity] = useState('')

  /**
   * Handles form submission
   * Prevents default form behavior and calls onSearch callback
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    // Only search if city is not empty
    if (city.trim()) {
      onSearch(city.trim())
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name (e.g., London, New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
          aria-label="City name input"
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading || !city.trim()}
          aria-label="Search weather"
        >
          {loading ? (
            <span className="spinner" aria-hidden="true"></span>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </form>
  )
}

export default SearchForm
