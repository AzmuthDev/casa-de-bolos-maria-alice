import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      {/* Background Video */}
      <div className="hero-video-wrapper">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        >
          <source
            src="/hero-video.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-video-overlay"></div>
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          <img src="/logo-transparent-v2.png" alt="Casa de Bolos Maria Alice Logo" className="hero-logo-main" />
          <p className="hero-subtitle">TORNANDO SEUS SONHOS MAIS DOCES EM REALIDADE</p>
          
          <div className="special-offer">
            <span className="offer-label">OFERTA ESPECIAL!</span>
            <div className="offer-discount">ECONOMIZE 20%</div>
          </div>
        </div>

        <div className="hero-images">
          <div className="main-cake-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Bolo de Chocolate Decadente" 
              className="main-cake"
            />
          </div>
        </div>

        <div className="hero-side-cakes">
            <div className="side-cake-wrapper">
               <img src="https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Bolo de Chocolate" />
            </div>
            <div className="side-cake-wrapper">
               <img src="https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Brownie" />
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
