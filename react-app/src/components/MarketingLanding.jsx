import React from 'react';

const MarketingLanding = () => {
  const playStoreLink = "https://play.google.com/store/apps/details?id=com.bookmygrounds"; // Placeholder or actual link if provided

  return (
    <div className="landing-page">
      <nav className="landing-container">
        <div className="logo">
          BOOK<span>MYGROUNDS</span>
        </div>
        <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Install App
        </a>
      </nav>

      <section className="hero landing-container">
        <div className="hero-content">
          <h1>Your Game, Your Ground, One Tap Away.</h1>
          <p>
            BookMyGrounds is India's premier turf booking platform. 
            Find, compare, and book the best sports arenas in your city instantly.
          </p>
          <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Get it on Google Play
            <span style={{ fontSize: '1.2rem' }}>→</span>
          </a>
        </div>
        <div className="hero-image"></div>
      </section>

      <section className="features landing-container">
        <div className="feature-card">
          <div style={{ fontSize: '2.5rem', color: '#10b981' }}>📍</div>
          <h3>Find Nearby Turfs</h3>
          <p>Discover available grounds in your vicinity with our real-time map integration. Never miss a game again.</p>
        </div>
        <div className="feature-card">
          <div style={{ fontSize: '2.5rem', color: '#10b981' }}>⚡</div>
          <h3>Instant Booking</h3>
          <p>No more phone calls. Zero wait time. Select your slot and confirm your booking in seconds.</p>
        </div>
        <div className="feature-card">
          <div style={{ fontSize: '2.5rem', color: '#10b981' }}>🏆</div>
          <h3>Quality Assured</h3>
          <p>View high-quality photos, actual ratings, and verified reviews for every arena before you play.</p>
        </div>
      </section>

      <section className="cta-footer landing-container">
        <h2>Ready to Level Up Your Game?</h2>
        <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Download BookMyGrounds Now
        </a>
        <div style={{ marginTop: '3rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          © 2026 BookMyGrounds. Ready to play?
        </div>
      </section>
    </div>
  );
};

export default MarketingLanding;
