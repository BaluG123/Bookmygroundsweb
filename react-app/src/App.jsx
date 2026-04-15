import { useState, useCallback, useEffect, useRef } from 'react';
import {
  authAPI,
  groundsAPI,
  bookingsAPI,
  asList,
  getToken,
  getUser,
  setToken,
  setUser,
} from './api';
import Navbar from './components/Navbar';
import TabBar from './components/TabBar';
import HeroSection from './components/HeroSection';
import DiscoverView from './views/DiscoverView';
import AccountView from './views/AccountView';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import Toast from './components/Toast';

const TABS = ['Discover', 'Account', 'Customer', 'Admin'];

export default function App() {
  const [activeTab, setActiveTab] = useState('Discover');
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getUser());
  
  // Filter tabs based on user role
  const visibleTabs = TABS.filter(tab => {
    if (tab === 'Admin') {
      return user?.role === 'admin' || user?.is_staff;
    }
    if (tab === 'Customer') {
      return user?.role === 'customer' || user?.role === 'admin' || user?.is_staff;
    }
    return true;
  });
  const [grounds, setGrounds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const updateAuth = useCallback((newToken, newUser) => {
    setTokenState(newToken);
    setUserState(newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const hydratePrivateData = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [profile, favs, bks] = await Promise.all([
        authAPI.getProfile(),
        groundsAPI.listFavorites(),
        bookingsAPI.list(),
      ]);
      setUserState(profile);
      setUser(profile);
      setFavorites(asList(favs));
      setBookings(asList(bks));
    } catch (err) {
      notify(err.message, true);
    }
  }, [notify]);

  const loadGrounds = useCallback(async (search = '', city = '', ordering = '-avg_rating') => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (ordering) params.set('ordering', ordering);
    const data = await groundsAPI.list(Object.fromEntries(params.entries()));
    const list = asList(data);
    setGrounds(list);
    return list;
  }, []);

  useEffect(() => {
    loadGrounds().catch(() => {});
    if (token) hydratePrivateData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    updateAuth(data.token || '', data.user || null);
    await hydratePrivateData();
    notify('Welcome back!');
  }, [updateAuth, hydratePrivateData, notify]);

  const handleRegister = useCallback(async (body) => {
    await authAPI.register(body);
    notify('Account created successfully! Please login to continue.');
  }, [notify]);

  const handleLogout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {}
    updateAuth('', null);
    setFavorites([]);
    setBookings([]);
    notify('You have been logged out successfully.');
  }, [updateAuth, notify]);

  const refreshAll = useCallback(async () => {
    await loadGrounds();
    if (getToken()) await hydratePrivateData();
    notify('Data refreshed successfully.');
  }, [loadGrounds, hydratePrivateData, notify]);

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        token={token}
        onAuthClick={() => setActiveTab('Account')}
        onRefresh={refreshAll}
      />

      <HeroSection
        groundsCount={grounds.length}
        favoritesCount={favorites.length}
        bookingsCount={bookings.length}
      />

      <TabBar tabs={visibleTabs} active={activeTab} onChange={setActiveTab} />

      <main>
        <div className={`view ${activeTab === 'Discover' ? 'active' : ''}`}>
          <DiscoverView
            grounds={grounds}
            loadGrounds={loadGrounds}
            favorites={favorites}
            setFavorites={setFavorites}
            token={token}
            user={user}
            notify={notify}
            hydratePrivateData={hydratePrivateData}
          />
        </div>

        <div className={`view ${activeTab === 'Account' ? 'active' : ''}`}>
          <AccountView
            token={token}
            user={user}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            notify={notify}
            updateAuth={updateAuth}
          />
        </div>

        <div className={`view ${activeTab === 'Customer' ? 'active' : ''}`}>
          <CustomerView
            token={token}
            user={user}
            favorites={favorites}
            bookings={bookings}
            setFavorites={setFavorites}
            setBookings={setBookings}
            notify={notify}
            hydratePrivateData={hydratePrivateData}
          />
        </div>

        <div className={`view ${activeTab === 'Admin' ? 'active' : ''}`}>
          <AdminView
            token={token}
            user={user}
            notify={notify}
          />
        </div>
      </main>

      {toast && <Toast message={toast.message} isError={toast.isError} />}
    </div>
  );
}
