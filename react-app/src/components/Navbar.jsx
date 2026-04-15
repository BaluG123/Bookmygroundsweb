export default function Navbar({ user, token, onAuthClick, onRefresh }) {
  const getRoleIcon = () => {
    if (!user) return '';
    return user.role === 'admin' || user.is_staff ? '🏟️' : '⚽';
  };

  const getUserGreeting = () => {
    if (!user) return 'Login';
    const firstName = user.full_name?.split(' ')[0] || 'User';
    const roleLabel = user.role === 'admin' || user.is_staff ? 'Owner' : 'Player';
    return `${getRoleIcon()} ${firstName} (${roleLabel})`;
  };

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
          {token && user ? getUserGreeting() : 'Login'}
        </button>
      </div>
    </nav>
  );
}
