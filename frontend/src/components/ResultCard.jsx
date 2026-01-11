/**
 * ResultCard Component
 * Displays weather information in a card format
 * @param {Object} data - Weather data from the API
 */
function ResultCard({ data }) {
  // Extract relevant data from the API response
  const cityName = data.name || 'Unknown'
  const temperature = data.main?.temp?.toFixed(1) || 'N/A'
  const feelsLike = data.main?.feels_like?.toFixed(1) || 'N/A'
  const humidity = data.main?.humidity || 'N/A'
  const description = data.weather?.[0]?.description || 'N/A'
  const mainCondition = data.weather?.[0]?.main || 'N/A'
  const windSpeed = data.wind?.speed?.toFixed(1) || 'N/A'
  const icon = data.weather?.[0]?.icon

  // Build icon URL from OpenWeatherMap
  const iconUrl = icon 
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : null

  return (
    <div className="result-card">
      <div className="result-header">
        <h2 className="result-city">{cityName}</h2>
        {iconUrl && (
          <img 
            src={iconUrl} 
            alt={description} 
            className="weather-icon"
            loading="lazy"
          />
        )}
      </div>
      
      <div className="result-main">
        <div className="temperature">
          <span className="temp-value">{temperature}</span>
          <span className="temp-unit">°C</span>
        </div>
        <p className="condition">{description}</p>
      </div>

      <div className="result-details">
        <div className="detail-item">
          <span className="detail-label">Feels like:</span>
          <span className="detail-value">{feelsLike}°C</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Humidity:</span>
          <span className="detail-value">{humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind:</span>
          <span className="detail-value">{windSpeed} m/s</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Condition:</span>
          <span className="detail-value">{mainCondition}</span>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
