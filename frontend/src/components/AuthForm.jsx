import { useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * AuthForm Component
 *
 * Handles user authentication (sign up / sign in)
 * with a modern dark-themed UI.
 *
 * @param {Function} onAuthSuccess - Callback after successful auth
 */
function AuthForm({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message || "Failed to create account");
          return;
        }

        if (data.user && !data.session) {
          setError("Please check your email to confirm your account");
          return;
        }

        if (data.session) onAuthSuccess(data.user);
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) {
          setError(signInError.message || "Invalid email or password");
          return;
        }

        if (data.user) onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form auth-form-dark" onSubmit={handleSubmit}>
        <h3 className="auth-form-title">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h3>

        <p className="auth-form-subtitle">
          {isSignUp
            ? "Sign up to save your weather searches"
            : "Sign in to continue to SkyCast"}
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            type="email"
            className="auth-input auth-input-dark"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input
            type="password"
            className="auth-input auth-input-dark"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="auth-submit-button auth-submit-dark"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isSignUp
            ? "Sign Up"
            : "Sign In"}
        </button>

        <div className="auth-toggle">
          <button
            type="button"
            className="auth-toggle-button auth-toggle-dark"
            disabled={loading}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail("");
              setPassword("");
            }}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuthForm;
