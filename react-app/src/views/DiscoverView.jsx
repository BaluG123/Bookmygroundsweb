import { useState, useEffect, useCallback } from 'react';
import {
  bookingsAPI,
  groundsAPI,
  reviewsAPI,
  asList,
  imageForGround,
  renderMinPrice,
  formatTime,
  resolveMatchingPricingPlan,
  today,
} from '../api';
import ImageGallery from '../components/ImageGallery';

export default function DiscoverView({
  grounds, loadGrounds, favorites, setFavorites,
  token, user, notify, hydratePrivateData
}) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [ordering, setOrdering] = useState('-avg_rating');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [bookingDate, setBookingDate] = useState(today());
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [playerCount, setPlayerCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.full_name || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  // Auto-select first ground
  useEffect(() => {
    if (grounds.length && !selectedId) {
      selectGround(grounds[0].id);
    }
  }, [grounds]); // eslint-disable-line

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loadGrounds(search, city, ordering);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = async (value) => {
    setOrdering(value);
    setLoading(true);
    try {
      await loadGrounds(search, city, value);
    } finally {
      setLoading(false);
    }
  };

  const selectGround = useCallback(async (groundId) => {
    setSelectedId(groundId);
    setSelectedSlotId(null);
    if (!groundId) { setDetail(null); return; }
    try {
      const [ground, revs] = await Promise.all([
        groundsAPI.detail(groundId),
        reviewsAPI.list(groundId),
      ]);
      setDetail(ground);
      setReviews(asList(revs));
      loadSlots(groundId, bookingDate);
    } catch (err) {
      notify(err.message, true);
    }
  }, [bookingDate, notify]); // eslint-disable-line

  const loadSlots = async (groundId, date) => {
    try {
      const payload = await bookingsAPI.listSlots(groundId, date);
      setSlots(asList(payload));
    } catch (err) {
      setSlots([]);
    }
  };

  const handleDateChange = (date) => {
    setBookingDate(date);
    setSelectedSlotId(null);
    if (detail) loadSlots(detail.id, date);
  };

  const handleFavoriteToggle = async () => {
    if (!detail) return;
    if (!token) { notify('Please login to save favorites.', true); return; }
    try {
      const existing = favorites.find((f) => f.ground?.id === detail.id);
      if (existing) {
        await groundsAPI.removeFavorite(existing.id);
        setFavorites(favorites.filter((f) => f.id !== existing.id));
        notify('Removed from favorites.');
      } else {
        const fav = await groundsAPI.addFavorite(detail.id);
        setFavorites([fav, ...favorites]);
        notify('Saved to favorites.');
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  const openMaps = () => {
    if (!detail) return;
    if (detail.latitude && detail.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${detail.latitude},${detail.longitude}`)}`,
        '_blank'
      );
    } else {
      const label = [detail.name, detail.address, detail.city, detail.state].filter(Boolean).join(', ');
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`, '_blank');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!token) { notify('Please login to create a booking.', true); return; }
    const slot = slots.find((s) => s.id === selectedSlotId);
    const plan = slot ? resolveMatchingPricingPlan(detail, slot) : null;
    if (!detail || !slot || !plan) { notify('Select a valid slot first.', true); return; }

    const body = {
      ground: detail.id,
      time_slot: slot.id,
      pricing_plan: plan.id,
      booking_date: bookingDate,
      start_time: slot.start_time,
      end_time: slot.end_time,
      customer_name: customerName,
      customer_phone: customerPhone,
      player_count: Number(playerCount || 1),
      notes: '',
      special_requests: specialRequests,
    };

    try {
      setBookingBusy(true);
      const booking = await bookingsAPI.create(body);
      notify(
        `Booking created for ${booking.booking_date} · ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
      );
      setSpecialRequests('');
      setSelectedSlotId(null);
      await hydratePrivateData();
      await loadSlots(detail.id, bookingDate);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setBookingBusy(false);
    }
  };

  const isFavorited = detail && favorites.some((f) => f.ground?.id === detail.id);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const matchedPlan = selectedSlot ? resolveMatchingPricingPlan(detail, selectedSlot) : null;

  return (
    <div className="discover-layout fade-in">
      {/* Left: Ground list */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">PUBLIC SEARCH</p>
            <h2>Explore Grounds</h2>
          </div>
          <select
            className="input narrow"
            value={ordering}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="-avg_rating">Top rated</option>
            <option value="-created_at">Newest</option>
            <option value="name">Name</option>
            <option value="city">City</option>
          </select>
        </div>

        <form className="form-inline" onSubmit={handleSearch}>
          <input
            className="input"
            type="search"
            placeholder="Search by name, city, address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 140 }}
          />
          <input
            className="input"
            type="text"
            placeholder="Filter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ flex: 0.6, minWidth: 100 }}
          />
          <button className="btn btn-primary" type="submit">
            {loading ? <span className="spinner" /> : 'Search'}
          </button>
        </form>

        <div className="list-stack" style={{ marginTop: 16 }}>
          {!grounds.length && (
            <p className="status-text">No grounds matched your filters.</p>
          )}
          {grounds.map((ground) => (
            <article
              key={ground.id}
              className={`ground-card ${selectedId === ground.id ? 'selected' : ''}`}
              onClick={() => selectGround(ground.id)}
            >
              <div
                className="ground-card-media"
                style={{ backgroundImage: `url('${imageForGround(ground)}')` }}
              >
                {ground.images && ground.images.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    📷 {ground.images.length}
                  </div>
                )}
              </div>
              <div className="ground-card-body">
                <p className="kicker">
                  {ground.ground_type_display || ground.ground_type || 'Ground'}
                </p>
                <h3>{ground.name}</h3>
                <p className="location">
                  {[ground.address, ground.city, ground.state].filter(Boolean).join(', ')}
                </p>
                <div className="tag-row">
                  <span className="tag">⭐ {ground.avg_rating || 'New'}</span>
                  <span className="tag">
                    {ground.surface_type_display || ground.surface_type || 'Surface'}
                  </span>
                  <span className="tag">{ground.max_players || 'Flexible'} players</span>
                </div>
                <span className="price-badge">{renderMinPrice(ground)}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="status-text">{grounds.length} grounds loaded.</p>
      </div>

      {/* Right: Detail */}
      <div className="panel">
        {!detail ? (
          <div className="empty-block">
            <p className="eyebrow">DETAIL</p>
            <h2>Select a ground</h2>
            <p>Ground details, reviews, pricing, slots, and quick booking controls show here.</p>
          </div>
        ) : (
          <div className="fade-in">
            {/* Image Gallery */}
            {detail.images && detail.images.length > 0 ? (
              <ImageGallery images={detail.images} groundName={detail.name} />
            ) : (
              <div
                className="detail-hero"
                style={{ backgroundImage: `url('${imageForGround(detail)}')` }}
              >
                <div className="detail-hero-content">
                  <p className="kicker">{detail.city || 'BookMyGrounds'}</p>
                  <h2>{detail.name}</h2>
                  <p>{[detail.address, detail.city, detail.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            )}

            {/* Ground Info Header */}
            <div style={{ marginBottom: 16 }}>
              <p className="kicker">{detail.city || 'BookMyGrounds'}</p>
              <h2 style={{ marginTop: 8, marginBottom: 8 }}>{detail.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {[detail.address, detail.city, detail.state].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Actions */}
            <div className="panel-section">
              <div className="action-row">
                <button className="btn btn-ghost btn-sm" onClick={handleFavoriteToggle}>
                  {isFavorited ? '❤️ Saved' : '🤍 Save Favorite'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={openMaps}>
                  📍 Open Maps
                </button>
              </div>
              <div className="pill-row" style={{ marginTop: 12 }}>
                <span className="meta-pill">⭐ {detail.avg_rating || 'New'}</span>
                <span className="meta-pill">
                  {detail.ground_type_display || detail.ground_type || 'Ground'}
                </span>
                <span className="meta-pill">
                  {detail.surface_type_display || detail.surface_type || 'Surface'}
                </span>
                <span className="meta-pill">
                  {detail.verification_status_display || (detail.is_verified ? 'Verified' : 'Pending')}
                </span>
                <span className="meta-pill">{detail.total_reviews || 0} reviews</span>
                <span className="meta-pill">{detail.total_bookings || 0} bookings</span>
                <span className="meta-pill">
                  {formatTime(detail.opening_time)} - {formatTime(detail.closing_time)}
                </span>
              </div>
            </div>

            {/* About */}
            <div className="panel-section">
              <h3>About</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {detail.description || 'No description available for this ground yet.'}
              </p>
            </div>

            {/* Amenities + Pricing */}
            <div className="panel-section">
              <div className="two-col">
                <div>
                  <h3>Amenities</h3>
                  <div className="pill-row" style={{ marginTop: 8 }}>
                    {(detail.amenities || []).length ? (
                      detail.amenities.map((a) => (
                        <span key={a.id || a.name} className="chip">{a.name}</span>
                      ))
                    ) : (
                      <span className="chip">Amenities not listed yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3>Pricing</h3>
                  <div className="list-stack" style={{ marginTop: 8 }}>
                    {(detail.pricing_plans || []).filter((p) => p.is_active).length ? (
                      detail.pricing_plans.filter((p) => p.is_active).map((plan) => (
                        <div key={plan.id} className="pricing-item">
                          <strong>{plan.duration_display || plan.duration_type}</strong>
                          <p>Weekday: ₹{plan.price}</p>
                          <p>
                            {plan.weekend_price
                              ? `Weekend: ₹${plan.weekend_price}`
                              : 'Weekend pricing follows standard rate.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="pricing-item">
                        <strong>Pricing unavailable</strong>
                        <p>No active pricing plans yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rules + Cancellation */}
            <div className="panel-section">
              <div className="two-col">
                <div>
                  <h3>Rules</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                    {detail.rules || 'No specific rules listed.'}
                  </p>
                </div>
                <div>
                  <h3>Cancellation</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                    {detail.cancellation_policy || 'Contact the ground owner for cancellation policy.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="panel-section">
              <div className="panel-header" style={{ marginBottom: 12 }}>
                <div>
                  <p className="eyebrow">BOOKING</p>
                  <h3>Reserve a live slot</h3>
                </div>
                <input
                  className="input narrow"
                  type="date"
                  value={bookingDate}
                  min={today()}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              <div className="workflow-strip compact-strip" style={{ marginBottom: 14 }}>
                <div className="workflow-card">
                  <strong>1. Choose date</strong>
                  <p>{bookingDate}</p>
                </div>
                <div className="workflow-card">
                  <strong>2. Select slot</strong>
                  <p>{selectedSlot ? `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}` : 'No slot selected yet.'}</p>
                </div>
                <div className="workflow-card">
                  <strong>3. Confirm booking</strong>
                  <p>{matchedPlan ? `Payable plan: ₹${matchedPlan.price}` : 'Select a valid slot first.'}</p>
                </div>
              </div>

              <div className="slot-grid">
                {!slots.length && (
                  <p className="status-text" style={{ gridColumn: '1 / -1' }}>
                    No slots available for the selected date.
                  </p>
                )}
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    className={`slot-btn ${selectedSlotId === slot.id ? 'selected' : ''}`}
                    disabled={!slot.is_bookable}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="info-card" style={{ marginTop: 16 }}>
                  {matchedPlan ? (
                    <>
                      <strong>
                        {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                      </strong>
                      <p>
                        {matchedPlan.duration_display || matchedPlan.duration_type} · ₹{matchedPlan.price}
                      </p>
                      <p>
                        {user
                          ? 'Complete the form below to create the booking.'
                          : 'Login to create this booking.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>Pricing missing</strong>
                      <p>No active pricing plan for the selected slot duration.</p>
                    </>
                  )}
                </div>
              )}

              {selectedSlot && matchedPlan && user && (
                <form className="form-grid" style={{ marginTop: 14 }} onSubmit={handleBooking}>
                  <input
                    className="input"
                    type="text"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <input
                    className="input"
                    type="tel"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(e.target.value)}
                  />
                  <textarea
                    className="input full-span"
                    rows="3"
                    placeholder="Special requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                  <button
                    className="btn btn-primary full-span"
                    type="submit"
                    disabled={bookingBusy}
                  >
                    {bookingBusy ? 'Creating...' : '🎯 Create Booking'}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews */}
            <div className="panel-section">
              <h3>Reviews</h3>
              <div className="list-stack" style={{ marginTop: 10 }}>
                {reviews.length ? (
                  reviews.map((r, idx) => (
                    <article key={r.id || idx} className="review-card">
                      <strong>
                        {r.customer_info?.full_name || 'Player'} · {r.rating}/5
                      </strong>
                      <p>{r.comment || 'No written review.'}</p>
                      {r.owner_reply && (
                        <p>
                          <strong>Owner reply:</strong> {r.owner_reply}
                        </p>
                      )}
                    </article>
                  ))
                ) : (
                  <article className="review-card">
                    <strong>No reviews yet</strong>
                    <p>Be the first player to leave a review after a completed booking.</p>
                  </article>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
