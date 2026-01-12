import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import AuthForm from "./components/AuthForm";
import Welcome from "./components/Welcome";
import { supabase } from "./supabaseClient";

/**
 * Main App Component
 * Manages authentication, welcome flow, searching and history
 */
function App() {
  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auth state
  const [user, setUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Welcome screen control (true = show welcome first)
  const [showWelcome, setShowWelcome] = useState(true);

  // History
  const [previousSearches, setPreviousSearches] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ------------------------------
     Auth initialization & listener
     ------------------------------ */
  useEffect(() => {
    // Get current session (page refresh handling)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuthForm(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ------------------------------
     Fetch previous searches when user changes
     ------------------------------ */
  useEffect(() => {
    if (user && user.id) {
      fetchPreviousSearches(user.id);
    } else {
      setPreviousSearches([]);
    }
  }, [user]);

  /* ------------------------------
     Save a search to Supabase
     (non-blocking, logs errors)
     ------------------------------ */
  const saveSearchToDatabase = async (city, weatherData) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session for DB insert:", sessionError);
        return;
      }

      if (!session?.user) {
        // no active session — skip insert
        return;
      }

      const userId = session.user.id;
      const temperature = weatherData.main?.temp;
      const weatherDescription =
        weatherData.weather?.[0]?.main ||
        weatherData.weather?.[0]?.description ||
        "Unknown";

      const insertPayload = {
        user_id: userId,
        city,
        temperature,
        weather: weatherDescription,
      };

      const { data, error } = await supabase
        .from("user_searches")
        .insert(insertPayload)
        .select();

      if (error) {
        console.error("Error saving search to database:", error);
        return;
      }

      // Refresh history after successful insert
      fetchPreviousSearches(userId);
      console.log("Saved search to DB:", data);
    } catch (err) {
      console.error("Unexpected error saving search to database:", err);
    }
  };

  /* ------------------------------
     Fetch last 5 previous searches
     ------------------------------ */
  const fetchPreviousSearches = async (userId) => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("user_searches")
      .select("city, temperature, weather, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching previous searches:", error);
      setPreviousSearches([]);
    } else {
      setPreviousSearches(data || []);
    }

    setLoadingHistory(false);
  };

  /* ------------------------------
     Handle weather search
     ------------------------------ */
  const handleSearch = async (city) => {
    setError(null);
    setWeatherData(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );
      if (!response.ok) {
        const errInfo = await response.json().catch(() => ({}));
        throw new Error(errInfo.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setWeatherData(data);

      // Save search if signed in — don't await (non-blocking)
      if (user?.id) saveSearchToDatabase(city, data);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------
     Auth callbacks
     ------------------------------ */
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthForm(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Error signing out:", error);
      // listener will update user state
    } catch (err) {
      console.error("Unexpected sign out error:", err);
    }
  };

  /* ------------------------------
     Welcome / Enter control
     ------------------------------ */
  const enterApp = () => setShowWelcome(false);

  /* ------------------------------
     Loading placeholder while checking auth
     ------------------------------ */
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  /* ------------------------------
     Render
     ------------------------------ */
  return (
    <div className="app">
      <Header user={user} onSignOut={handleSignOut} onShowAuth={() => setShowAuthForm(true)} />

      <main className="main-content">
        {showWelcome ? (
          // Show welcome landing screen first
          <Welcome onEnter={enterApp} onShowAuth={() => setShowAuthForm(true)} />
        ) : (
          // Main application card
          <div className="card">
            {/* Auth modal / form */}
            {showAuthForm && !user && <AuthForm onAuthSuccess={handleAuthSuccess} />}

            {/* Search */}
            <SearchForm onSearch={handleSearch} loading={loading} />

            {/* Error */}
            {error && <div className="error-message" role="alert">{error}</div>}

            {/* Result */}
            {weatherData && <ResultCard data={weatherData} />}

            {/* Previous Searches */}
            {user && (
              <div className="previous-searches" style={{ marginTop: 20 }}>
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
                      <small>{new Date(search.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
