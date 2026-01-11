# task1-skycast

A full-stack weather application built with React + Vite frontend and Express backend. This project demonstrates server-side API proxying for secure weather data fetching.

## Project Structure

```
task1-skycast/
├── frontend/          # React + Vite frontend application
├── backend/           # Express API server
├── .env.example       # Environment variables template
├── vercel.json        # Vercel deployment configuration
└── README.md          # This file
```

## Features

- 🌤️ Weather search by city name
- 🔒 Secure server-side API proxy (hides API keys from frontend)
- 📱 Mobile-first responsive design
- ⚡ Fast development with Vite
- 🚀 Ready for Vercel serverless deployment

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/matrix-1407/task1-skycast.git
cd task1-skycast

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
# From project root
cp .env.example backend/.env
```

Edit `backend/.env` and add your OpenWeatherMap API key:

```
OPENWEATHER_API_KEY=your_api_key_here
SUPABASE_URL=placeholder_will_add_later
SUPABASE_ANON_KEY=placeholder_will_add_later
```

### 3. Run Backend

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

### 4. Run Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing Locally

### Test Backend Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok"}
```

### Test Weather API

```bash
curl "http://localhost:3000/api/weather?city=London"
```

### Test Frontend

1. Open `http://localhost:5173` in your browser
2. Enter a city name (e.g., "London", "New York")
3. Click "Search" or press Enter
4. View weather results

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### `GET /api/weather?city={CITY_NAME}`
Fetches weather data for a city.

**Query Parameters:**
- `city` (required): City name (e.g., "London", "New York")

**Response:**
```json
{
  "name": "London",
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 65
  },
  "weather": [{
    "main": "Clouds",
    "description": "scattered clouds",
    "icon": "03d"
  }],
  "wind": {
    "speed": 3.2
  }
}
```

**Error Responses:**
- `400`: Bad request (missing city parameter)
- `404`: City not found
- `429`: Rate limit exceeded
- `500`: Server error

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

From the project root:

```bash
vercel
```

Follow the prompts to link your project.

### 3. Set Environment Variables

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key
   - `SUPABASE_URL`: (Will be added in commit 2)
   - `SUPABASE_ANON_KEY`: (Will be added in commit 2)

### 4. Redeploy

After setting environment variables, redeploy:

```bash
vercel --prod
```

## Screenshots to Capture

1. **Homepage**: Empty state with search form
2. **Search Results**: Weather card displaying city, temperature, conditions
3. **Error State**: Invalid city or API error message
4. **Mobile View**: Responsive design on mobile device

## Database Setup (For Future Commit)

When integrating Supabase, run this SQL in your Supabase SQL editor:

```sql
-- Create user_searches table
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  search_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created_at ON user_searches(created_at DESC);
```

## Next Steps (Commit 2)

The following features will be added in the next commit:

1. **Supabase Integration**
   - Install Supabase client libraries
   - Configure Supabase connection
   - Set up authentication

2. **OAuth Authentication**
   - Google OAuth sign-in
   - GitHub OAuth sign-in
   - Sign out functionality

3. **Search History**
   - Save last search to `user_searches` table
   - Display user's recent searches

4. **UI Enhancements**
   - Authentication buttons (sign in/sign out)
   - User profile display
   - Search history sidebar

## Development Checklist

- [x] ✅ Initial project scaffold
- [ ] 🔄 Integrate Supabase Auth (signup/login/logout)
- [ ] 🔄 Save last search to Supabase `user_searches` table
- [ ] 🔄 UI polish and responsive design
- [ ] 🔄 Deploy to Vercel and set env vars

## Tech Stack

- **Frontend**: React 18, Vite, Plain JavaScript
- **Build Tool**: Vite
- **Backend**: Node.js, Express
- **Deployment**: Vercel (Serverless)
- **API**: OpenWeatherMap Current Weather API
- **Future**: Supabase (Auth + Database)

## License

MIT

## Author

Created as part of an internship project.
