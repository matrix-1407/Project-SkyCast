/**
 * Vercel Serverless Function
 * Fetches weather data from OpenWeatherMap
 */

export default async function handler(req, res) {
    try {
      if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
      }
  
      const { city } = req.query;
  
      if (!city) {
        return res.status(400).json({ message: "City is required" });
      }
  
      const API_KEY = process.env.WEATHER_API_KEY;
  
      if (!API_KEY) {
        console.error("Missing API key");
        return res.status(500).json({
          message: "Weather API key not configured on server",
        });
      }
  
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
  
      // Use node-compatible fetch
      const response = await fetch(url);
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("OpenWeather error:", data);
        return res.status(response.status).json({
          message: data.message || "Weather API error",
        });
      }
  
      return res.status(200).json(data);
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  