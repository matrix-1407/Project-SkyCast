/**
 * Header Component
 *
 * Displays the app title and authentication UI.
 *
 * When user is logged out:
 * - Shows "Sign In / Sign Up" button
 *
 * When user is logged in:
 * - Shows user's email
 * - Shows "Sign Out" button
 *
 * @param {Object|null} user - Current authenticated user object
 * @param {Function} onSignOut - Callback when user signs out
 * @param {Function} onShowAuth - Callback to show auth form
 */
function Header({ user, onSignOut, onShowAuth }) {
  return (
    <header className="header header-dark">
      {/* Left side: App name */}
      <div className="header-left">
        <h1 className="header-title">🌤️ SkyCast</h1>
        <p className="header-subtitle">
          Simple, fast weather updates
        </p>
      </div>

      {/* Right side: Auth actions */}
      <div className="auth-section">
        {user ? (
          // User logged in
          <div className="auth-user-info">
            <span className="user-email" title={user.email}>
              {user.email}
            </span>
            <button
              className="auth-button auth-button-signout"
              onClick={onSignOut}
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          // User logged out
          <button
            className="auth-button auth-button-primary"
            onClick={onShowAuth}
            aria-label="Sign in or sign up"
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
