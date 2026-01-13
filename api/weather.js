/**
 * Vercel Serverless Function
 * OpenWeatherMap proxy
 */
export default async function handler(req, res) {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const { city } = req.query;
  
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }
  
    try {
      const API_KEY = process.env.VITE_WEATHER_API_KEY;
  
      if (!API_KEY) {
        return res.status(500).json({
          message: "Weather API key missing",
        });
      }
  
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
  
      const response = await fetch(url);
      const data = await response.json();
  
      if (!response.ok) {
        return res.status(response.status).json({
          message: data.message || "Failed to fetch weather",
        });
      }
  
      res.status(200).json(data);
    } catch (err) {
      console.error("Weather API error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
  