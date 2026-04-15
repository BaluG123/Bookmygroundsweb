import React from 'react';
import footballImg from '../assets/hero_landing.png';
import cricketImg from '../assets/cricket_turf.png';
import badmintonImg from '../assets/badminton_court.png';
import ownerAppImg from '../assets/owner_app.png';

const MarketingLanding = () => {
  const playStoreLink = "https://play.google.com/store/apps/details?id=com.bookmygrounds";

  return (
    <div className="landing-page">
      <nav className="landing-container">
        <div className="logo">
          BOOK<span>MYGROUNDS</span>
        </div>
        <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>
          Get App
        </a>
      </nav>

      <section className="hero landing-container">
        <div className="hero-content">
          <div className="badge">LIVE IN BENGALURU 📍</div>
          <h1>India's Most Loved Turf Booking App.</h1>
          <p>
            Whether it's a midnight football match or an early morning cricket game, 
            book premium arenas across Bengaluru in under 60 seconds.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Download Now
            </a>
            <a href="#owners" className="btn-outline">For Ground Owners</a>
          </div>
        </div>
        <div className="hero-visual">
          <img src={footballImg} alt="Football Turf" />
        </div>
      </section>

      <section className="landing-container" style={{ padding: '4rem 0' }}>
        <div className="section-title">
          <h2>Every Sport. Every Skill.</h2>
          <p>We've partnered with Bengaluru's best facilities to keep you active.</p>
        </div>
        
        <div className="sports-grid">
          <div className="sport-card">
            <img src={cricketImg} alt="Cricket" />
            <div className="sport-card-content">
              <h3>Box Cricket</h3>
              <p>Top-rated box cricket turfs with premium floodlights.</p>
            </div>
          </div>
          <div className="sport-card">
            <img src={footballImg} alt="Football" />
            <div className="sport-card-content">
              <h3>Football</h3>
              <p>5-a-side to 11-a-side professional synthetic turfs.</p>
            </div>
          </div>
          <div className="sport-card">
            <img src={badmintonImg} alt="Badminton" />
            <div className="sport-card-content">
              <h3>Badminton</h3>
              <p>Wooden and synthetic courts with pro-standard lighting.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="owners" className="landing-container">
        <div className="owner-section">
          <div className="owner-image">
            <img src={ownerAppImg} alt="Owner Dashboard" />
          </div>
          <div className="owner-content">
            <div className="badge">FOR OWNERS</div>
            <h2>Scale Your Business Digitally.</h2>
            <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#94a3b8' }}>
              Handle your ground bookings and revenue from anywhere in the world. 
              Our mobile app for owners gives you total control.
            </p>
            <ul>
              <li>
                <div className="check-icon">✓</div>
                <div>
                  <strong>Smart Pricing</strong>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Set dynamic prices for morning, evening, and weekend slots.</p>
                </div>
              </li>
              <li>
                <div className="check-icon">✓</div>
                <div>
                  <strong>Live Calendar</strong>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Real-time booking updates and push notifications.</p>
                </div>
              </li>
              <li>
                <div className="check-icon">✓</div>
                <div>
                  <strong>Revenue Analytics</strong>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Track your daily, weekly, and monthly earnings in one place.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-footer landing-container">
        <h2>Ready to Level Up?</h2>
        <p style={{ marginBottom: '3rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Join thousands of players and hundreds of owners in Bengaluru. 
          Download the app today and make booking effortless.
        </p>
        <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
          Install BookMyGrounds App
        </a>
        <div style={{ marginTop: '5rem', borderTop: '1px solid #161618', paddingTop: '3rem', color: '#475569', fontSize: '0.8rem' }}>
          Born in Bengaluru. Built for the future of Indian Sports. 
          © 2026 BookMyGrounds. All Rights Reserved.
        </div>
      </section>
    </div>
  );
};

export default MarketingLanding;
