export default function Navbar({ user, token, onAuthClick, onRefresh }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">BG</div>
        <div className="brand-text">
          <span>BookMyGrounds</span>
          <span>Book Your Perfect Ground</span>
        </div>
      </div>
      <div className="navbar-actions">
        <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
          ↻ Refresh
        </button>
        <button className="btn btn-primary btn-sm" onClick={onAuthClick}>
          {token && user ? `Hi, ${user.full_name?.split(' ')[0] || 'User'}` : 'Login'}
        </button>
      </div>
    </nav>
  );
}
