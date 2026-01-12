/**
 * Header Component
 * 
 * Displays the app title and authentication UI.
 * 
 * When user is logged out:
 * - Shows "Sign In" and "Sign Up" buttons that open the auth form
 * 
 * When user is logged in:
 * - Shows user's email address
 * - Shows "Sign Out" button
 * 
 * @param {Object|null} user - Current authenticated user object (null if not logged in)
 * @param {Function} onSignOut - Callback function called when user clicks sign out
 * @param {Function} onShowAuth - Callback function called when user clicks sign in/up
 */
function Header({ user, onSignOut, onShowAuth }) {
  return (
    <header className="header">
      <h1 className="header-title">🌤️ SkyCast</h1>
      
      <div className="auth-section">
        {user ? (
          // User is logged in - show email and sign out button
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
          // User is logged out - show sign in/up buttons
          <div className="auth-buttons">
            <button
              className="auth-button auth-button-primary"
              onClick={onShowAuth}
              aria-label="Sign in"
            >
              Sign In / Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
