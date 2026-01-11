import express from 'express'
import dotenv from 'dotenv'
// Using native fetch (available in Node.js 18+)
// No need to import node-fetch

// Load environment variables from .env file
dotenv.config()

// Create Express app
const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Enable CORS for frontend (adjust origin in production)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns server status
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

/**
 * Weather API Endpoint
 * GET /api/weather?city={CITY_NAME}
 * Proxies request to OpenWeatherMap API
 * 
 * This endpoint:
 * - Validates the city parameter
 * - Fetches weather data from OpenWeatherMap
 * - Handles errors gracefully
 * - Returns rate-limit-friendly responses
 */
app.get('/api/weather', async (req, res) => {
  try {
    // Get city from query parameters
    const city = req.query.city

    // Validate city parameter
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'City parameter is required and must be a non-empty string'
      })
    }

    // Get API key from environment variables
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY is not set in environment variables')
      return res.status(500).json({
        error: 'Server Configuration Error',
        message: 'Weather API key is not configured'
      })
    }

    // Build OpenWeatherMap API URL
    // Using metric units for temperature in Celsius
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${apiKey}`

    // Fetch weather data from OpenWeatherMap
    const response = await fetch(apiUrl)

    // Handle rate limiting (429 status)
    if (response.status === 429) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.'
      })
    }

    // Handle city not found (404)
    if (response.status === 404) {
      return res.status(404).json({
        error: 'City Not Found',
        message: `Could not find weather data for "${city}". Please check the city name and try again.`
      })
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenWeatherMap API error: ${response.status} - ${errorText}`)
      return res.status(response.status).json({
        error: 'Weather API Error',
        message: 'Failed to fetch weather data. Please try again later.'
      })
    }

    // Parse JSON response
    const data = await response.json()

    // Return weather data to frontend
    res.json(data)

  } catch (error) {
    // Handle network errors, parsing errors, etc.
    console.error('Error fetching weather data:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.'
    })
  }
})

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🌤️  Weather API: http://localhost:${PORT}/api/weather?city=London`)
})

// Export app for Vercel serverless
export default app
