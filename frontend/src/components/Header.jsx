/**
 * Header Component
 * Displays the app title and placeholder for auth buttons
 * (Auth buttons will be added in commit 2 with Supabase)
 */
function Header() {
  return (
    <header className="header">
      <h1 className="header-title">🌤️ SkyCast</h1>
      <div className="auth-buttons-placeholder">
        {/* Placeholder for auth buttons - will be implemented in commit 2 */}
        <span className="placeholder-text">Sign In (Coming Soon)</span>
      </div>
    </header>
  )
}

export default Header
