import { useState, useEffect, useCallback } from 'react';
import { bookingsAPI, groundsAPI, formatTime, asList, today } from '../api';
import MapPicker from '../components/MapPicker';
import ImageUploader from '../components/ImageUploader';

export default function AdminView({ token, user, notify }) {
  const [isAdmin] = useState(user?.role === 'admin' || user?.is_staff);
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [groundId, setGroundId] = useState(null);
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gAddress, setGAddress] = useState('');
  const [gCity, setGCity] = useState('');
  const [gState, setGState] = useState('');
  const [gPincode, setGPincode] = useState('');
  const [gLat, setGLat] = useState('');
  const [gLon, setGLon] = useState('');
  const [gOpen, setGOpen] = useState('');
  const [gClose, setGClose] = useState('');
  const [gPlayers, setGPlayers] = useState('');
  const [gRules, setGRules] = useState('');
  const [gCancel, setGCancel] = useState('');
  const [gType, setGType] = useState('cricket');
  const [gSurface, setGSurface] = useState('natural_grass');
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [groundImages, setGroundImages] = useState([]);

  const [pricingActive, setPricingActive] = useState([]);
  const [pDuration, setPDuration] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pWeekend, setPWeekend] = useState('');

  const [slotsDate, setSlotsDate] = useState(today());
  const [slotsData, setSlotsData] = useState([]);

  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);

  const activeGround = grounds.find((item) => item.id === groundId) || null;

  const resetGroundForm = useCallback(() => {
    setGName('');
    setGDesc('');
    setGAddress('');
    setGCity('');
    setGState('');
    setGPincode('');
    setGLat('');
    setGLon('');
    setGOpen('');
    setGClose('');
    setGPlayers('');
    setGRules('');
    setGCancel('');
    setGType('cricket');
    setGSurface('natural_grass');
    setSelectedAmenities([]);
    setPricingActive([]);
    setSlotsData([]);
  }, []);

  const loadData = useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const [g, b, a] = await Promise.all([
        groundsAPI.myGrounds(),
        bookingsAPI.adminBookings(),
        groundsAPI.amenities(),
      ]);
      setGrounds(asList(g));
      setBookings(asList(b));
      setAmenities(asList(a));
    } catch (err) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, notify]);

  const selectGround = useCallback(async (id) => {
    setGroundId(id);

    if (!id) {
      resetGroundForm();
      return;
    }

    try {
      const data = await groundsAPI.detail(id);
      setGName(data.name || '');
      setGDesc(data.description || '');
      setGAddress(data.address || '');
      setGCity(data.city || '');
      setGState(data.state || '');
      setGPincode(data.pincode || '');
      setGLat(data.latitude || '');
      setGLon(data.longitude || '');
      setGOpen(data.opening_time || '');
      setGClose(data.closing_time || '');
      setGPlayers(data.max_players || '');
      setGRules(data.rules || '');
      setGCancel(data.cancellation_policy || '');
      setGType(data.ground_type || 'cricket');
      setGSurface(data.surface_type || 'natural_grass');
      setSelectedAmenities((data.amenities || []).map(a => a.id));
      setGroundImages(data.images || []);
      setPricingActive(data.pricing_plans || []);
    } catch (err) {
      notify(err.message, true);
    }
  }, [notify, resetGroundForm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!groundId) return;

    const loadSlotsForGround = async () => {
      try {
        const s = await bookingsAPI.listSlots(groundId, slotsDate);
        setSlotsData(asList(s));
      } catch {
        setSlotsData([]);
      }
    };

    loadSlotsForGround();
  }, [groundId, slotsDate]);

  const handleDeleteImage = async (imageId) => {
    if (!groundId || !window.confirm('Delete this image?')) return;

    try {
      await groundsAPI.deleteImage(groundId, imageId);
      notify('Image deleted successfully');
      await selectGround(groundId);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleGroundSave = async (e) => {
    e.preventDefault();

    const body = {
      name: gName,
      description: gDesc,
      ground_type: gType,
      surface_type: gSurface,
      address: gAddress,
      city: gCity,
      state: gState,
      pincode: gPincode,
      latitude: gLat,
      longitude: gLon,
      opening_time: gOpen,
      closing_time: gClose,
      max_players: gPlayers,
      rules: gRules,
      cancellation_policy: gCancel,
      amenity_ids: selectedAmenities,
      is_active: true,
    };

    try {
      if (groundId) {
        await groundsAPI.update(groundId, body);
        notify('Ground updated successfully');
        await selectGround(groundId);
      } else {
        const res = await groundsAPI.create(body);
        notify('Ground created successfully');
        await loadData();
        await selectGround(res.id);
      }
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handlePricingSave = async (e) => {
    e.preventDefault();
    if (!groundId) {
      notify('Select a ground first', true);
      return;
    }

    try {
      await groundsAPI.addPricing(groundId, {
        ground: groundId,
        duration_hours: pDuration,
        price: pPrice,
        weekend_price: pWeekend || null,
        is_active: true,
      });
      setPDuration('');
      setPPrice('');
      setPWeekend('');
      notify('Pricing plan added successfully');
      await selectGround(groundId);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleGenerateSlots = async () => {
    if (!groundId) {
      notify('Select a ground first', true);
      return;
    }

    try {
      const openingHour = Number((gOpen || '00:00').slice(0, 2));
      const closingHour = Number((gClose || '00:00').slice(0, 2));
      const slots = [];

      for (let hour = openingHour; hour < closingHour; hour += 1) {
        slots.push({
          start_time: `${String(hour).padStart(2, '0')}:00`,
          end_time: `${String(hour + 1).padStart(2, '0')}:00`,
        });
      }

      if (!slots.length) {
        notify('Set valid opening and closing hours first', true);
        return;
      }

      await bookingsAPI.createSlots({
        ground_id: groundId,
        date: slotsDate,
        slots,
      });
      notify(`Slots generated for ${slotsDate}`);
      const s = await bookingsAPI.listSlots(groundId, slotsDate);
      setSlotsData(asList(s));
    } catch (err) {
      notify(err.message, true);
    }
  };

  const selectBooking = async (id) => {
    setSelectedBookingId(id);
    if (!id) {
      setBookingDetail(null);
      return;
    }

    try {
      const data = await bookingsAPI.detail(id);
      setBookingDetail(data);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const updateBookingStatus = async (status) => {
    if (!bookingDetail) return;

    try {
      if (status === 'completed') await bookingsAPI.complete(bookingDetail.id);
      else if (status === 'cancelled') await bookingsAPI.cancel(bookingDetail.id);
      else await bookingsAPI.confirm(bookingDetail.id);

      notify(`Booking marked as ${status}`);
      await selectBooking(bookingDetail.id);
      await loadData();
    } catch (err) {
      notify(err.message, true);
    }
  };

  if (!isAdmin) {
    return (
      <div className="panel fade-in">
        <div className="empty-block">
          <p className="eyebrow">GROUND MANAGEMENT</p>
          <h2>Ground management is available for venue owners</h2>
          <p>
            Current role: {user?.role || 'guest'}. Please contact support to upgrade your account
            to manage grounds, set pricing, and handle bookings.
          </p>
        </div>
        <div className="workflow-strip">
          <div className="workflow-card">
            <strong>1. Add ground</strong>
            <p>Create the venue with address, timings, capacity, and rules.</p>
          </div>
          <div className="workflow-card">
            <strong>2. Set pricing</strong>
            <p>Add duration and price so customer slot booking can calculate cost.</p>
          </div>
          <div className="workflow-card">
            <strong>3. Generate slots</strong>
            <p>Choose a date and create the daily slot inventory customers will see.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="workflow-strip" style={{ marginBottom: 20 }}>
        <div className="workflow-card">
          <strong>Step 1: Add or select ground</strong>
          <p>{activeGround ? `Selected: ${activeGround.name}` : 'Use New Ground or select one from the list.'}</p>
        </div>
        <div className="workflow-card">
          <strong>Step 2: Add pricing</strong>
          <p>{groundId ? 'Pricing form is unlocked below.' : 'Pricing activates after a ground is selected.'}</p>
        </div>
        <div className="workflow-card">
          <strong>Step 3: Generate slots</strong>
          <p>{groundId ? `Viewing slots for ${slotsDate}.` : 'Choose a ground first, then create slots.'}</p>
        </div>
      </div>

      <div className="four-col-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">MY GROUNDS</p>
              <h2>Operations</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={loadData}>
              {loading ? <span className="spinner" /> : 'Reload'}
            </button>
          </div>

          <div className="list-stack">
            {!grounds.length && (
              <div className="info-card">
                <strong>No grounds yet</strong>
                <p>Start with `New Ground`, save it, then come back here to manage pricing and slots.</p>
              </div>
            )}

            {grounds.map((g) => (
              <div
                key={g.id}
                className={`booking-card ${groundId === g.id ? 'selected' : ''}`}
                onClick={() => selectGround(g.id)}
              >
                <strong>{g.name}</strong>
                <p>{g.city} · {g.ground_type_display}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">GROUND FORM</p>
              <h2>{groundId ? 'Edit Selected Ground' : 'Create New Ground'}</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setGroundId(null); resetGroundForm(); }}>
              New Ground
            </button>
          </div>

          <div className="panel-section" style={{ marginTop: 0, marginBottom: 16 }}>
            <h3>Current Workspace</h3>
            <p className="status-text" style={{ padding: 0 }}>
              {activeGround
                ? `${activeGround.name} is selected. Update details here, then add pricing and slots below.`
                : 'No ground selected. Fill this form to create a new ground.'}
            </p>
          </div>

          <form className="form-grid" onSubmit={handleGroundSave}>
            <input className="input full-span" type="text" placeholder="Ground name" required value={gName} onChange={(e) => setGName(e.target.value)} />
            <textarea className="input full-span" rows="3" placeholder="Description" value={gDesc} onChange={(e) => setGDesc(e.target.value)} />
            
            <select className="input" value={gType} onChange={(e) => setGType(e.target.value)} required>
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
              <option value="badminton">Badminton</option>
              <option value="tennis">Tennis</option>
              <option value="basketball">Basketball</option>
              <option value="volleyball">Volleyball</option>
              <option value="hockey">Hockey</option>
              <option value="multi_sport">Multi Sport</option>
              <option value="other">Other</option>
            </select>

            <select className="input" value={gSurface} onChange={(e) => setGSurface(e.target.value)} required>
              <option value="natural_grass">Natural Grass</option>
              <option value="artificial_turf">Artificial Turf</option>
              <option value="clay">Clay</option>
              <option value="concrete">Concrete</option>
              <option value="synthetic">Synthetic</option>
              <option value="wooden">Wooden</option>
              <option value="other">Other</option>
            </select>

            <input className="input full-span" type="text" placeholder="Address" required value={gAddress} onChange={(e) => setGAddress(e.target.value)} />
            <input className="input" type="text" placeholder="City" required value={gCity} onChange={(e) => setGCity(e.target.value)} />
            <input className="input" type="text" placeholder="State" required value={gState} onChange={(e) => setGState(e.target.value)} />
            <input className="input" type="text" placeholder="Pincode" required value={gPincode} onChange={(e) => setGPincode(e.target.value)} />
            
            <div className="full-span">
              <MapPicker
                latitude={gLat}
                longitude={gLon}
                onLocationChange={(lat, lng) => {
                  setGLat(lat.toString());
                  setGLon(lng.toString());
                }}
              />
            </div>

            <input className="input" type="time" title="Opening Time" value={gOpen} onChange={(e) => setGOpen(e.target.value)} />
            <input className="input" type="time" title="Closing Time" value={gClose} onChange={(e) => setGClose(e.target.value)} />
            <input className="input" type="number" placeholder="Max players" value={gPlayers} onChange={(e) => setGPlayers(e.target.value)} />
            
            <div className="full-span" style={{ marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {amenities.map((amenity) => (
                  <label key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAmenities([...selectedAmenities, amenity.id]);
                        } else {
                          setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id));
                        }
                      }}
                    />
                    <span>{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <textarea className="input full-span" rows="2" placeholder="Rules" value={gRules} onChange={(e) => setGRules(e.target.value)} />
            <textarea className="input full-span" rows="2" placeholder="Cancellation policy" value={gCancel} onChange={(e) => setGCancel(e.target.value)} />
            <button className="btn btn-primary full-span" type="submit">
              {groundId ? 'Update Ground' : 'Create Ground'}
            </button>
          </form>

          {groundId && (
            <div className="full-span" style={{ marginTop: 16 }}>
              <div className="panel-divider" />
              
              <h3>Ground Images</h3>
              
              {groundImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
                  {groundImages.map((img) => (
                    <div key={img.id} style={{ position: 'relative' }}>
                      <img
                        src={img.image}
                        alt={img.caption || 'Ground image'}
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="btn btn-danger btn-sm"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                        }}
                      >
                        Delete
                      </button>
                      {img.is_primary && (
                        <span style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          background: 'var(--accent)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <ImageUploader
                groundId={groundId}
                notify={notify}
                onUploadComplete={() => selectGround(groundId)}
              />
            </div>
          )}

          <div className="panel-divider" />

          <div className="two-col">
            <div>
              <h3>Pricing Plans</h3>
              {!groundId && <p className="status-text">Select or create a ground to enable pricing.</p>}

              <form className="list-stack" style={{ marginTop: 10 }} onSubmit={handlePricingSave}>
                <input className="input" type="number" step="0.5" placeholder="Duration hours" value={pDuration} onChange={(e) => setPDuration(e.target.value)} required />
                <input className="input" type="number" placeholder="Weekday price" value={pPrice} onChange={(e) => setPPrice(e.target.value)} required />
                <input className="input" type="number" placeholder="Weekend price (opt)" value={pWeekend} onChange={(e) => setPWeekend(e.target.value)} />
                <button className="btn btn-ghost" type="submit" disabled={!groundId}>Add Pricing</button>
              </form>

              <div className="list-stack" style={{ marginTop: 16 }}>
                {!pricingActive.length && (
                  <div className="pricing-item">
                    <strong>No pricing added</strong>
                    <p>Add at least one plan so the customer booking flow can show a payable amount.</p>
                  </div>
                )}

                {pricingActive.map((p) => (
                  <div key={p.id} className="pricing-item">
                    <strong>{p.duration_hours} hrs</strong>
                    <p>Weekday: ₹{p.price}</p>
                    <p>{p.weekend_price ? `Weekend: ₹${p.weekend_price}` : 'Weekend uses standard rate.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="panel-header" style={{ marginBottom: 10 }}>
                <div>
                  <h3>Slot Management</h3>
                  <p className="status-text" style={{ padding: 0 }}>
                    {groundId ? 'Choose a date, generate slots, then review availability.' : 'Select a ground to manage slots.'}
                  </p>
                </div>
                <input className="input narrow" type="date" value={slotsDate} onChange={(e) => setSlotsDate(e.target.value)} />
              </div>

              <div className="action-row">
                <button className="btn btn-primary" type="button" onClick={handleGenerateSlots} disabled={!groundId}>
                  Generate Hourly Slots
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => groundId && selectGround(groundId)} disabled={!groundId}>
                  Refresh Ground
                </button>
              </div>

              <div className="slot-grid" style={{ marginTop: 16 }}>
                {!groundId && (
                  <p className="status-text" style={{ gridColumn: '1 / -1' }}>
                    Create or select a ground first.
                  </p>
                )}

                {groundId && !slotsData.length && (
                  <p className="status-text" style={{ gridColumn: '1 / -1' }}>
                    No slots found for {slotsDate}. Generate them above.
                  </p>
                )}

                {slotsData.map((s) => (
                  <div key={s.id} className="pricing-item" style={{ padding: '10px 12px', fontSize: '0.85rem' }}>
                    <strong>{formatTime(s.start_time)} - {formatTime(s.end_time)}</strong>
                    <p style={{ color: s.is_bookable ? 'var(--accent-light)' : 'var(--danger)' }}>
                      {s.is_bookable ? 'Available for booking' : 'Booked or closed'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">ADMIN BOOKINGS</p>
              <h2>Queue</h2>
            </div>
          </div>

          <div className="list-stack" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {!bookings.length && <p className="status-text">No bookings found yet.</p>}

            {bookings.map((b) => (
              <div
                key={b.id}
                className={`booking-card ${selectedBookingId === b.id ? 'selected' : ''}`}
                onClick={() => selectBooking(b.id)}
              >
                <strong>#{b.booking_number} · {b.ground_name}</strong>
                <p>{b.booking_date} · {formatTime(b.start_time)}</p>
                <p>Status: {b.status}</p>
              </div>
            ))}
          </div>

          <div className="panel-divider" />

          {!bookingDetail ? (
            <div className="info-card">
              <strong>Select a booking</strong>
              <p>Booking details and confirm/complete/cancel actions will appear here.</p>
            </div>
          ) : (
            <div className="fade-in">
              <div className="info-card">
                <strong>#{bookingDetail.booking_number}</strong>
                <p>{bookingDetail.customer_name} ({bookingDetail.customer_phone})</p>
                <p>{bookingDetail.booking_date} · {formatTime(bookingDetail.start_time)} - {formatTime(bookingDetail.end_time)}</p>
                <p>Status: {bookingDetail.status} · Payment: {bookingDetail.payment_status}</p>
              </div>
              <div className="action-row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={() => updateBookingStatus('confirmed')}>Confirm</button>
                <button className="btn btn-ghost btn-sm" onClick={() => updateBookingStatus('completed')}>Complete</button>
                <button className="btn btn-danger btn-sm" onClick={() => updateBookingStatus('cancelled')}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
