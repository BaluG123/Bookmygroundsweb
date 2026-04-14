import { useState, useCallback } from 'react';
import { bookingsAPI, groundsAPI, asList, formatTime } from '../api';

export default function CustomerView({
  token, user, favorites, bookings,
  setFavorites, setBookings, notify, hydratePrivateData
}) {
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentTransaction, setPaymentTransaction] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const selectBooking = useCallback(async (bookingId) => {
    setSelectedBookingId(bookingId);
    if (!bookingId) { setBookingDetail(null); return; }
    try {
      const detail = await bookingsAPI.detail(bookingId);
      setBookingDetail(detail);
      try {
        const payments = await bookingsAPI.listPayments(bookingId);
        setPaymentHistory(asList(payments));
      } catch { setPaymentHistory([]); }
    } catch (err) {
      notify(err.message, true);
    }
  }, [notify]);

  const handleCancelBooking = async () => {
    if (!bookingDetail) return;
    try {
      await bookingsAPI.cancel(bookingDetail.id);
      notify('Booking cancelled successfully.');
      await hydratePrivateData();
      selectBooking(bookingDetail.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleRazorpay = async () => {
    if (!bookingDetail) return;
    try {
      const order = await bookingsAPI.createPaymentOrder(bookingDetail.id, {
        amount: Number(paymentAmount || bookingDetail.total_amount),
      });
      const options = {
        key: order.key_id || order.razorpay_key || order.key,
        amount: order.order?.amount || order.amount,
        currency: order.order?.currency || order.currency || 'INR',
        name: 'BookMyGrounds',
        description: `Booking #${bookingDetail.booking_number}`,
        order_id: order.order?.id || order.order_id || order.id,
        handler: async (response) => {
          try {
            await bookingsAPI.verifyPayment(bookingDetail.id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_method: 'online',
              gateway_response: {
                source: 'react_web_razorpay_checkout',
              },
            });
            notify('Payment verified successfully!');
            selectBooking(bookingDetail.id);
            hydratePrivateData();
          } catch (err) {
            notify(err.message, true);
          }
        },
        prefill: { email: user?.email, contact: user?.phone },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleRecordPayment = async () => {
    if (!bookingDetail) return;
    try {
      await bookingsAPI.recordPayment(bookingDetail.id, {
        amount: Number(paymentAmount),
        transaction_id: paymentTransaction,
        payment_method: paymentMethod,
        status: 'success',
        gateway_response: {
          source: 'react_web_manual_payment',
        },
      });
      notify('Payment recorded successfully.');
      selectBooking(bookingDetail.id);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const handleUpiIntent = () => {
    if (!bookingDetail) return;
    const amount = paymentAmount || bookingDetail.total_amount;
    bookingsAPI.createUpiIntent(bookingDetail.id, { amount: Number(amount) })
      .then((payload) => {
        setPaymentInfo(payload);
        window.open(payload.upi_uri, '_blank');
      })
      .catch((err) => {
        notify(err.message, true);
      });
  };

  const removeFavorite = async (favId) => {
    try {
      await groundsAPI.removeFavorite(favId);
      setFavorites(favorites.filter((f) => f.id !== favId));
      notify('Favorite removed.');
    } catch (err) {
      notify(err.message, true);
    }
  };

  return (
    <div className="three-col-grid fade-in">
      {/* Favorites */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">FAVORITES</p>
            <h2>Saved Grounds</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={hydratePrivateData}>Reload</button>
        </div>
        <div className="list-stack">
          {!token && <p className="status-text">Login to load your favorites.</p>}
          {token && !favorites.length && <p className="status-text">No favorites saved yet.</p>}
          {favorites.map((fav) => (
            <div key={fav.id} className="booking-card">
              <strong>{fav.ground?.name || 'Ground'}</strong>
              <p>{fav.ground?.city || ''} · {fav.ground?.ground_type_display || ''}</p>
              <button
                className="btn btn-danger btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => removeFavorite(fav.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">BOOKINGS</p>
            <h2>My Bookings</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={hydratePrivateData}>Reload</button>
        </div>
        <div className="panel-section" style={{ marginTop: 0, marginBottom: 14 }}>
          <h3>Customer Flow</h3>
          <p className="status-text" style={{ padding: 0 }}>
            1. Pick a ground in Discover. 2. Select a live slot. 3. Create booking. 4. Come here for payment and cancellation.
          </p>
        </div>
        <div className="list-stack">
          {!token && <p className="status-text">Login to load your bookings.</p>}
          {token && !bookings.length && (
            <p className="status-text">No bookings yet. Reserve your first slot from the Discover tab.</p>
          )}
          {bookings.map((b) => (
            <div
              key={b.id}
              className={`booking-card ${selectedBookingId === b.id ? 'selected' : ''}`}
              onClick={() => selectBooking(b.id)}
            >
              <strong>{b.ground_name || 'Booking'} · #{b.booking_number || ''}</strong>
              <p>
                {b.booking_date || ''} · {formatTime(b.start_time)} - {formatTime(b.end_time)}
              </p>
              <p>
                Status: {b.status_display || b.status || 'pending'} · Payment:{' '}
                {b.payment_status_display || b.payment_status || 'pending'}
              </p>
              <p>Total: ₹{b.total_amount || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Detail */}
      <div className="panel">
        {!bookingDetail ? (
          <div className="empty-block">
            <p className="eyebrow">BOOKING DETAIL</p>
            <h2>Select a booking</h2>
            <p>Booking detail, payment actions, and cancellation controls show here. Slot selection happens in the Discover tab.</p>
          </div>
        ) : (
          <div className="fade-in">
            <div className="info-card">
              <strong>{bookingDetail.ground_name || 'Booking'} · #{bookingDetail.booking_number}</strong>
              <p>
                {bookingDetail.booking_date} · {formatTime(bookingDetail.start_time)} -{' '}
                {formatTime(bookingDetail.end_time)}
              </p>
              <p>
                Status: {bookingDetail.status_display || bookingDetail.status} · Payment:{' '}
                {bookingDetail.payment_status_display || bookingDetail.payment_status}
              </p>
              <p>Total: ₹{bookingDetail.total_amount}</p>
            </div>

            <div className="action-row" style={{ marginTop: 16 }}>
              <button className="btn btn-danger btn-sm" onClick={handleCancelBooking}>
                Cancel Booking
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => selectBooking(bookingDetail.id)}>
                Refresh Detail
              </button>
            </div>

            <div className="panel-section">
              <h3>Payments</h3>
              {paymentInfo?.payee_name && (
                <div className="info-card" style={{ marginBottom: 12 }}>
                  <strong>UPI intent ready</strong>
                  <p>Payee: {paymentInfo.payee_name}</p>
                  <p>Amount: ₹{paymentInfo.amount}</p>
                </div>
              )}
              <div className="form-grid" style={{ marginTop: 10 }}>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Transaction ID"
                  value={paymentTransaction}
                  onChange={(e) => setPaymentTransaction(e.target.value)}
                />
                <select
                  className="input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="online">Online</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={handleRazorpay}>
                  💳 Pay With Razorpay
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleUpiIntent}>
                  📱 Open UPI Intent
                </button>
                <button className="btn btn-ghost btn-sm full-span" onClick={handleRecordPayment}>
                  Record Confirmed Payment
                </button>
              </div>

              {paymentHistory.length > 0 && (
                <div className="list-stack" style={{ marginTop: 14 }}>
                  {paymentHistory.map((p, idx) => (
                    <div key={p.id || idx} className="pricing-item">
                      <strong>₹{p.amount} · {p.payment_method}</strong>
                      <p>Status: {p.status || 'recorded'} · {p.transaction_id || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
