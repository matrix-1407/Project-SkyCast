import { useState } from "react";

/**
 * SearchForm Component
 * Handles city input and weather search submission.
 *
 * UX improvements:
 * - Clear placeholder
 * - Modern input + button layout
 * - Disabled states handled cleanly
 * - Keyboard-friendly (Enter works)
 *
 * @param {Function} onSearch - Callback when form is submitted
 * @param {boolean} loading - Whether search is in progress
 */
function SearchForm({ onSearch, loading }) {
  // City input state
  const [city, setCity] = useState("");

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!city.trim()) return;

    onSearch(city.trim());
  };

  return (
    <form className="search-form modern-search" onSubmit={handleSubmit}>
      <div className="search-input-wrapper modern-search-wrapper">
        {/* City input */}
        <input
          type="text"
          className="search-input modern-search-input"
          placeholder="Search city (e.g. London, Mumbai)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
          aria-label="City name"
        />

        {/* Search button */}
        <button
          type="submit"
          className="search-button modern-search-button"
          disabled={loading || !city.trim()}
          aria-label="Search weather"
        >
          {loading ? (
            <span className="spinner" aria-hidden="true"></span>
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="search-hint">
        Enter a city name to get real-time weather information
      </p>
    </form>
  );
}

export default SearchForm;
