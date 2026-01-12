import React from "react";

/**
 * Welcome screen component shown before the main app.
 * Props:
 *  - onEnter: function to call when user clicks "Enter SkyCast"
 *  - onShowAuth: function to open auth form (optional)
 */
export default function Welcome({ onEnter, onShowAuth }) {
  return (
    <div className="welcome-wrapper">
      <div className="welcome-card card">
        <h1 className="welcome-title">Welcome to SkyCast 🌤️</h1>
        <p className="welcome-sub">
          Fast, simple weather updates for any city. Sign up to save searches and
          view history.
        </p>

        <div className="welcome-actions">
          <button className="primary-btn" onClick={onEnter}>
            Enter SkyCast
          </button>

          <button
            className="secondary-btn"
            onClick={() => (typeof onShowAuth === "function") && onShowAuth()}
          >
            Sign In / Sign Up
          </button>
        </div>

        <p className="welcome-note">
          Tip: You can use the app as guest or sign in to save searches.
        </p>
      </div>
    </div>
  );
}
