export default function HeroSection({ groundsCount, favoritesCount, bookingsCount }) {
  return (
    <section className="hero-section fade-in">
      <div className="hero-content">
        <p className="eyebrow">PREMIUM SPORTS BOOKING</p>
        <h1>
          Discover & Book <span>Sports Grounds</span> Instantly
        </h1>
        <p className="hero-description">
          Browse premium sports grounds, book your favorite slots, and manage your bookings
          seamlessly — all in one place.
        </p>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{groundsCount}</div>
            <div className="stat-label">Grounds</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{favoritesCount}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{bookingsCount}</div>
            <div className="stat-label">Bookings</div>
          </div>
        </div>
      </div>
    </section>
  );
}
