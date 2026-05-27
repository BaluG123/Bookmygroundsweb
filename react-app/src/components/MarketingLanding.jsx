import React, { useState, useEffect } from 'react';
import footballImg from '../assets/box_football.png';
import cricketImg from '../assets/cricket_turf.png';
import badmintonImg from '../assets/badminton_court.png';
import basketballImg from '../assets/basketball_court.png';
import ownerAppImg from '../assets/owner_app.png';
import qrImg from '../assets/app_qr.png';
import bgImg from '../assets/dark_mesh_bg.png';

const MarketingLanding = () => {
  const playStoreLink = "https://play.google.com/store/apps/details?id=in.bookmygrounds.app";

  const sports = [
    {
      id: 'football',
      name: 'Football',
      icon: '⚽',
      img: footballImg,
      tag: 'Most Popular',
      rating: '4.8 (240+ reviews)',
      desc: '5-a-side to 11-a-side professional synthetic turfs.'
    },
    {
      id: 'cricket',
      name: 'Box Cricket',
      icon: '🏏',
      img: cricketImg,
      tag: 'Trending Now',
      rating: '4.9 (180+ reviews)',
      desc: 'Top-rated box cricket turfs with premium floodlights.'
    },
    {
      id: 'badminton',
      name: 'Badminton',
      icon: '🏸',
      img: badmintonImg,
      tag: 'Fast Booking',
      rating: '4.7 (110+ reviews)',
      desc: 'Wooden and synthetic courts with pro-standard lighting.'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      icon: '🏀',
      img: basketballImg,
      tag: 'Newly Added',
      rating: '4.9 (35 reviews)',
      desc: 'Premium concrete and wooden indoor/outdoor courts.'
    }
  ];

  const steps = [
    {
      stepNum: '01',
      title: 'Explore Arenas',
      desc: 'Browse premium turfs, courts, and fields near you. Filter by sport, rating, and location.'
    },
    {
      stepNum: '02',
      title: 'Choose Your Slot',
      desc: 'Check live hourly slot availability. Select your preferred timing and pricing plan instantly.'
    },
    {
      stepNum: '03',
      title: 'Play & Win',
      desc: 'Complete checkout securely with Razorpay/UPI. Show your booking QR code at the ground, and play!'
    }
  ];

  const testimonials = [
    {
      quote: "BookMyGrounds is a game-changer! I can book a turf for my team in HSR Layout in under a minute. The slots are always up to date.",
      name: "Rahul Sharma",
      role: "Weekend Football Captain",
      initials: "RS"
    },
    {
      quote: "Managing bookings for our cricket club used to be a nightmare of phone calls. Now we just check BookMyGrounds and book. Extremely smooth payments!",
      name: "Ananya Iyer",
      role: "Box Cricket Organizer",
      initials: "AI"
    },
    {
      quote: "I love the badminton slot bookings here. The visual calendar makes it very clear which slots are peak/off-peak, helping us save money.",
      name: "Karthik Gowda",
      role: "Badminton Enthusiast",
      initials: "KG"
    },
    {
      quote: "Being able to see actual ratings and turf pictures before paying is fantastic. The app interface is sleek, clean, and fast.",
      name: "Priya Nair",
      role: "Recreational Player",
      initials: "PN"
    }
  ];

  const [activeSportIndex, setActiveSportIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  // Auto-play for Hero Sports Showcase
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveSportIndex((prev) => (prev + 1) % sports.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Auto-play for Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const activeSport = sports[activeSportIndex];

  return (
    <div className="landing-page" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <nav className="landing-container">
        <div className="logo">
          BOOK<span>MYGROUNDS</span>
        </div>
        <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary glow-btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>
          Get App
        </a>
      </nav>

      <section className="hero landing-container">
        <div className="hero-content">
          <div className="hero-badge-container">
            <div className="pulse-dot"></div>
            <span>LIVE IN BENGALURU</span>
          </div>
          <h1>India's Most Loved Turf Booking App.</h1>
          <p>
            Whether it's a midnight football match, an early morning cricket game, or a competitive badminton session, book premium sports arenas across Bengaluru in under 60 seconds.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '220px' }}>
              <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary glow-btn-primary" style={{ justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Now
              </a>
              <a href="#owners" className="btn-outline" style={{ textAlign: 'center' }}>For Ground Owners</a>
            </div>
            <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="qr-container-glowing">
              <img src={qrImg} alt="Scan to Install" />
              <span>Scan to Install</span>
              <span className="qr-subtext">Click to visit store</span>
            </a>
          </div>
        </div>

        <div className="hero-visual" style={{ background: 'transparent', boxShadow: 'none' }}>
          <div 
            className="showcase-container"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="showcase-display">
              <div className="sports-pill">
                <span>{activeSport.icon}</span>
                <span>{activeSport.name}</span>
              </div>
              <div className="floating-overlay-card glass-panel right-card">
                <div className="floating-card-title">Instant Booking</div>
                <div className="floating-card-value">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                  Available Now
                </div>
              </div>
              <div className="floating-overlay-card glass-panel left-card">
                <div className="floating-card-title">Top Rated</div>
                <div className="floating-card-value" style={{ gap: '0.6rem', fontSize: '0.9rem' }}>
                  <span>Verified Venues</span>
                  <span style={{ color: '#facc15' }}>★ {activeSport.rating.split(' ')[0]}</span>
                </div>
              </div>
              <img 
                src={activeSport.img} 
                alt={activeSport.name} 
                className="showcase-img zooming" 
                key={activeSport.id}
              />
              <div className="showcase-overlay-gradient"></div>
            </div>
            
            <div className="showcase-tabs">
              {sports.map((sport, index) => (
                <button
                  key={sport.id}
                  onClick={() => {
                    setActiveSportIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`showcase-tab ${activeSportIndex === index ? 'active' : ''}`}
                >
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-container" style={{ padding: '4rem 0' }}>
        <div className="section-title">
          <div className="badge">SPORTS CATALOG</div>
          <h2>Every Sport. Every Skill.</h2>
          <p>We've partnered with Bengaluru's best facilities to keep you active.</p>
        </div>
        
        <div className="sports-grid">
          {sports.map((sport) => (
            <div key={sport.id} className="sport-card">
              <div className="sport-card-info-badge">{sport.tag}</div>
              <img src={sport.img} alt={sport.name} />
              <div className="sport-card-content">
                <h3>{sport.name}</h3>
                <p>{sport.desc}</p>
                <p className="sport-card-sub">Book premium {sport.name.toLowerCase()} venues</p>
              </div>
              <div className="sport-card-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Phone Walkthrough Section */}
      <section className="landing-container" style={{ padding: '6rem 0' }}>
        <div className="section-title">
          <div className="badge">THE EXPERIENCE</div>
          <h2>How BookMyGrounds Works</h2>
          <p>Book premium sports turf grounds and courts in three simple steps.</p>
        </div>

        <div className="walkthrough-grid">
          <div className="stepper-container">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`stepper-item ${activeStep === index ? 'active' : ''}`}
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => setActiveStep(index)}
              >
                <div className="stepper-step">Step {step.stepNum}</div>
                <h3 className="stepper-title">{step.title}</h3>
                <p className="stepper-desc">{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="phone-mockup">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="mock-app-header">
                  <div className="mock-app-logo">BOOK<span>MYGROUNDS</span></div>
                  <div className="mock-app-avatar">U</div>
                </div>

                {activeStep === 0 && (
                  <div className="screen-explore">
                    <div className="mock-search-bar">
                      <span>Search grounds, arenas...</span>
                      <span>🔍</span>
                    </div>
                    <div className="mock-sports-row">
                      <span className="mock-sport-badge active">⚽ Football</span>
                      <span className="mock-sport-badge">🏏 Cricket</span>
                      <span className="mock-sport-badge">🏸 Badminton</span>
                      <span className="mock-sport-badge">🏀 Basketball</span>
                    </div>
                    <div className="mock-section-title">Featured Grounds</div>
                    <div className="mock-ground-list">
                      <div className="mock-ground-card">
                        <div className="mock-ground-img" style={{ backgroundImage: `url(${footballImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                          <span className="mock-ground-tag">AVAILABLE</span>
                        </div>
                        <div className="mock-ground-info">
                          <div className="mock-ground-title">HSR Premium Turf</div>
                          <div className="mock-ground-desc">HSR Layout, Bengaluru</div>
                          <div className="mock-ground-meta">
                            <span className="mock-rating">★ 4.8</span>
                            <span className="mock-price">Book Now</span>
                          </div>
                        </div>
                      </div>
                      <div className="mock-ground-card">
                        <div className="mock-ground-img" style={{ backgroundImage: `url(${cricketImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                          <span className="mock-ground-tag">AVAILABLE</span>
                        </div>
                        <div className="mock-ground-info">
                          <div className="mock-ground-title">Indiranagar Box Cricket</div>
                          <div className="mock-ground-desc">Indiranagar, Bengaluru</div>
                          <div className="mock-ground-meta">
                            <span className="mock-rating">★ 4.9</span>
                            <span className="mock-price">Book Now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="screen-slots">
                    <div className="mock-detail-hero" style={{ backgroundImage: `url(${activeSport.img})` }}>
                      <div className="mock-detail-title">{activeSport.name} Arena</div>
                    </div>
                    
                    <div className="mock-section-title">Select Booking Date</div>
                    <div className="mock-date-picker">
                      📅 Today, 25th May 2026
                    </div>

                    <div className="mock-section-title">Hourly Slots</div>
                    <div className="mock-slots-grid">
                      <span className="mock-slot-btn">06:00 AM</span>
                      <span className="mock-slot-btn">07:00 AM</span>
                      <span className="mock-slot-btn available">08:00 AM</span>
                      <span className="mock-slot-btn selected">06:00 PM</span>
                      <span className="mock-slot-btn available">07:00 PM</span>
                      <span className="mock-slot-btn available">08:00 PM</span>
                    </div>

                    <div className="mock-section-title">Booking Status</div>
                    <div style={{ fontSize: '0.55rem', display: 'flex', justifyContent: 'space-between', padding: '0 0.2rem' }}>
                      <span style={{ color: '#94a3b8' }}>Instant Confirmation</span>
                      <span style={{ fontWeight: 800, color: '#10b981' }}>Available</span>
                    </div>

                    <div className="mock-btn-book" style={{ marginTop: '1rem' }}>
                      Book Turf Now
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="screen-payment">
                    <div className="mock-success-ring">✓</div>
                    <div>
                      <div className="mock-success-title">Booking Confirmed!</div>
                      <div className="mock-success-desc">Your payment has been successfully verified via UPI.</div>
                    </div>

                    <div className="mock-ticket">
                      <div className="mock-ticket-row">
                        <span className="mock-ticket-label">Arena</span>
                        <span className="mock-ticket-val">{activeSport.name} Elite Arena</span>
                      </div>
                      <div className="mock-ticket-row">
                        <span className="mock-ticket-label">Time</span>
                        <span className="mock-ticket-val">06:00 PM - 07:00 PM</span>
                      </div>
                      <div className="mock-ticket-row">
                        <span className="mock-ticket-label">Date</span>
                        <span className="mock-ticket-val">25 May 2026</span>
                      </div>
                      <div className="mock-ticket-row">
                        <span className="mock-ticket-label">Status</span>
                        <span className="mock-ticket-val">Confirmed</span>
                      </div>
                      <div className="mock-qr-mini">
                        <img src={qrImg} alt="QR" />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.45rem', color: '#10b981', fontWeight: 700 }}>SHOW QR AT ENTRY GATE</span>
                  </div>
                )}
              </div>
              <div className="phone-home-indicator"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="testimonials-section landing-container">
        <div className="section-title">
          <div className="badge">TESTIMONIALS</div>
          <h2>What Players Are Saying</h2>
          <p>Read review feedback from local sports groups in Bengaluru.</p>
        </div>

        <div className="testimonials-container">
          <div className="testimonials-track">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className={`testimonial-card ${activeTestimonialIndex === idx ? 'active' : ''}`}
              >
                <div className="stars-row">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-user">
                  <div className="user-avatar-initials">{t.initials}</div>
                  <div className="user-details">
                    <span className="user-name">{t.name}</span>
                    <span className="user-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonials-dots">
            {testimonials.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveTestimonialIndex(idx)}
                className={`dot-btn ${activeTestimonialIndex === idx ? 'active' : ''}`}
                aria-label={`Testimonial slide ${idx + 1}`}
              />
            ))}
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

      {/* Install the App Section */}
      <section className="install-app-section landing-container">
        <div className="install-app-card">
          <div className="install-left">
            <div className="install-badge">
              <span>📲</span> GET THE APP
            </div>
            <h2>Your Game. Your Ground. One Tap Away.</h2>
            <p>
              Download BookMyGrounds and never miss a slot again. Instant booking, real-time availability, and secure payments — all from your pocket.
            </p>
            <div className="install-features">
              <div className="install-feature">
                <div className="install-feature-icon">⚡</div>
                <span>Instant Booking</span>
              </div>
              <div className="install-feature">
                <div className="install-feature-icon">🔒</div>
                <span>Secure Payments</span>
              </div>
              <div className="install-feature">
                <div className="install-feature-icon">📍</div>
                <span>Nearby Grounds</span>
              </div>
            </div>
            <div className="install-actions">
              <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary glow-btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Install Free on Android
              </a>
            </div>
          </div>
          <div className="install-right">
            <div className="install-phone-glow">
              <div className="install-floating-badge top-right">⚡ 60s Booking</div>
              <div className="install-floating-badge bottom-left">★ 4.8 Rating</div>
              <div className="install-phone">
                <div className="install-phone-screen">
                  <div className="install-phone-logo">BOOK<span>MYGROUNDS</span></div>
                  <div className="install-phone-sports">
                    <span>⚽</span><span>🏏</span><span>🏸</span><span>🏀</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Book premium sports arenas in under 60 seconds
                  </div>
                  <div className="install-phone-cta">Get Started</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-footer landing-container">
        <h2>Ready to Level Up?</h2>
        <p style={{ marginBottom: '3rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Join thousands of players and hundreds of owners in Bengaluru. 
          Download the app today and make booking effortless.
        </p>
        <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="btn-primary glow-btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
          Install BookMyGrounds App
        </a>
        <div style={{ marginTop: '5rem', borderTop: '1px solid #161618', paddingTop: '3rem', color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>
          Born in Bengaluru. Built for the future of Indian Sports. 
          © 2026 BookMyGrounds. All Rights Reserved.
        </div>
      </section>
    </div>
  );
};

export default MarketingLanding;
