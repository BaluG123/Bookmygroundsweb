import { useState } from 'react';
import { authAPI } from '../api';

export default function AccountView({ token, user, onLogin, onRegister, onLogout, notify, updateAuth }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regRole, setRegRole] = useState('customer');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regBusy, setRegBusy] = useState(false);

  // Profile edit
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCity, setProfileCity] = useState(user?.city || '');
  const [profileState, setProfileState] = useState(user?.state || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifLoaded, setNotifLoaded] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginBusy(true);
    try {
      await onLogin(loginEmail, loginPassword);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoginBusy(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegBusy(true);
    try {
      await onRegister({
        full_name: regName,
        email: regEmail,
        phone: regPhone,
        city: regCity,
        role: regRole,
        state: '',
        password: regPassword,
        password_confirm: regPasswordConfirm,
      });
      setRegName(''); setRegEmail(''); setRegPhone('');
      setRegCity(''); setRegRole('customer'); setRegPassword(''); setRegPasswordConfirm('');
    } catch (err) {
      notify(err.message, true);
    } finally {
      setRegBusy(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await authAPI.updateProfile({
        full_name: profileName,
        phone: profilePhone,
        city: profileCity,
        state: profileState,
      });
      updateAuth(token, updated);
      notify('Profile updated successfully.');
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      notify('Password changed successfully.');
    } catch (err) {
      notify(err.message, true);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await authAPI.listNotifications();
      setNotifications(Array.isArray(data) ? data : data?.results || []);
      setNotifLoaded(true);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const loggedIn = Boolean(token && user);

  return (
    <div className="three-col-grid fade-in">
      {/* Auth Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">SESSION</p>
            <h2>Authentication</h2>
          </div>
        </div>

        {!loggedIn ? (
          <div>
            <form className="form-grid" onSubmit={handleLoginSubmit}>
              <input
                className="input"
                type="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button className="btn btn-primary full-span" type="submit" disabled={loginBusy}>
                {loginBusy ? 'Logging in...' : '🔐 Login'}
              </button>
            </form>

            <details className="details-block">
              <summary>Create new account</summary>
              <form className="form-grid" style={{ marginTop: 14 }} onSubmit={handleRegisterSubmit}>
                <div className="full-span" style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                    I am a:
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: regRole === 'customer' ? '2px solid var(--accent)' : '2px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: regRole === 'customer' ? 'var(--accent-subtle)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="customer"
                        checked={regRole === 'customer'}
                        onChange={(e) => setRegRole(e.target.value)}
                        style={{ marginRight: 8 }}
                      />
                      <strong>Player</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 24px' }}>
                        Book grounds and play
                      </p>
                    </label>
                    <label
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: regRole === 'admin' ? '2px solid var(--accent)' : '2px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: regRole === 'admin' ? 'var(--accent-subtle)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={regRole === 'admin'}
                        onChange={(e) => setRegRole(e.target.value)}
                        style={{ marginRight: 8 }}
                      />
                      <strong>Ground Owner</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 24px' }}>
                        Manage and rent grounds
                      </p>
                    </label>
                  </div>
                </div>
                <input className="input" type="text" placeholder="Full name" required value={regName} onChange={(e) => setRegName(e.target.value)} />
                <input className="input" type="email" placeholder="Email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                <input className="input" type="tel" placeholder="Phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                <input className="input" type="text" placeholder="City" value={regCity} onChange={(e) => setRegCity(e.target.value)} />
                <input className="input" type="password" placeholder="Password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                <input className="input" type="password" placeholder="Confirm password" required value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} />
                <button className="btn btn-ghost full-span" type="submit" disabled={regBusy}>
                  {regBusy ? 'Creating...' : `Register as ${regRole === 'admin' ? 'Ground Owner' : 'Player'}`}
                </button>
              </form>
            </details>
          </div>
        ) : (
          <div>
            <div className="profile-card">
              <strong>{user.full_name || 'User'}</strong>
              <p>📧 {user.email || ''}</p>
              <p>📍 {user.city || 'City not set'}</p>
              <p>
                👤 {user.role === 'admin' ? '🏟️ Ground Owner' : '⚽ Player'} 
                <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ({user.role || 'customer'})
                </span>
              </p>
            </div>
            <button className="btn btn-danger" style={{ marginTop: 16 }} onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Profile Edit Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">PROFILE</p>
            <h2>Edit Profile</h2>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleProfileUpdate}>
          <input className="input" type="text" placeholder="Full name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
          <input className="input" type="tel" placeholder="Phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
          <input className="input" type="text" placeholder="City" value={profileCity} onChange={(e) => setProfileCity(e.target.value)} />
          <input className="input" type="text" placeholder="State" value={profileState} onChange={(e) => setProfileState(e.target.value)} />
          <button className="btn btn-primary full-span" type="submit">Update Profile</button>
        </form>

        <div className="panel-divider" />

        <h3>Change Password</h3>
        <form className="form-grid" onSubmit={handlePasswordChange}>
          <input className="input" type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <input className="input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button className="btn btn-ghost full-span" type="submit">Change Password</button>
        </form>
      </div>

      {/* Notifications */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">NOTIFICATIONS</p>
            <h2>Inbox</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadNotifications}>Reload</button>
        </div>
        <div className="list-stack">
          {!notifLoaded && <p className="status-text">Click Reload to load notifications.</p>}
          {notifLoaded && !notifications.length && <p className="status-text">No notifications.</p>}
          {notifications.map((n, idx) => (
            <div key={n.id || idx} className="booking-card">
              <strong>{n.title || 'Notification'}</strong>
              <p>{n.message || n.body || ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
