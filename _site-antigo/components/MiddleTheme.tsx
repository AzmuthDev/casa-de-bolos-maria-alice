import React from 'react';
import './MiddleTheme.css';

const FlowerOutline = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20C50 20 60 5 70 15C80 25 65 35 65 35C65 35 85 30 90 45C95 60 75 60 75 60C75 60 85 80 70 85C55 90 50 70 50 70C50 70 45 90 30 85C15 80 25 60 25 60C25 60 5 60 10 45C15 30 35 35 35 35C35 35 20 25 30 15C40 5 50 20 50 20Z" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="6"/>
  </svg>
);

const MiddleTheme: React.FC = () => {
  return (
    <section className="brand-showcase">
      
      {/* 1. PRIMARY LOGO SECTION (FULL WIDTH) */}
      <div className="showcase-strip strip-with-bg">
         <div className="container strip-content">
            <p className="strip-label text-white">PRIMARY LOGO</p>
            <img src="/logo.jpg" alt="Casa de Bolos Maria Alice Logo" className="middle-primary-logo" />
         </div>
      </div>

      {/* 2. THREE LOGO MARKS (3 COLUMNS) */}
      <div className="showcase-grid-3">
         <div className="grid-cell bg-pinktone">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="background-video"
            >
               <source src="/cupcake-video.mp4" type="video/mp4" />
            </video>
            <div className="cell-content">
               <p className="strip-label text-white">SECONDARY LOGO</p>
               <h2 className="secondary-logo text-primrose">BLOOM<br/>BITES</h2>
            </div>
         </div>
         <div className="grid-cell bg-yucca">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="background-video"
            >
               <source src="/submark-video.mp4" type="video/mp4" />
            </video>
            <div className="cell-content">
               <p className="strip-label text-lime">SUBMARK</p>
               <div className="submark-circular">
                  <span className="submark-arc-top">BLOOMBITES CAFE</span>
                  <div className="submark-center text-lime"><FlowerOutline /></div>
                  <span className="submark-arc-bottom">BLOOMBITES CAFE</span>
               </div>
            </div>
         </div>
         <div className="grid-cell bg-lime">
            <p className="strip-label text-yucca">LOGO MARK</p>
            <div className="logo-mark text-yucca"><FlowerOutline /></div>
         </div>
      </div>



      {/* 4. TYPOGRAPHY (FULL WIDTH) */}
      <div className="showcase-strip bg-lime">
         <div className="container strip-content">
            <p className="strip-label text-yucca">TYPOGRAPHY</p>
            <h2 className="typo-name text-pinktone">PANTON RUST HEAVY BASE</h2>
            <div className="typo-alphabet text-pinktone">
               ABCDEFGHIJKLMN<br/>
               OPQRSTUVWXYZ<br/>
               0123456789
            </div>
         </div>
      </div>

      {/* 5. MOCKUPS GALLERY (3 COLUMNS) */}
      <div className="mockup-gallery">
         {/* Mockup 1: Pink Bag */}
         <div className="mockup-item pink-bag-bg">
            <div className="paper-bag">
               <div className="bag-icon"><FlowerOutline /></div>
               <div className="bag-text">BLOOM<br/>BITES</div>
            </div>
            <div className="small-paper-bag">
               <div className="bag-text-small">BLOOM<br/>AGAIN</div>
            </div>
         </div>

         {/* Mockup 2: Loyalty Card over Cookies */}
         <div className="mockup-item green-cookies-bg">
            <div className="loyalty-card">
               <p className="card-title">LOYALTY CARD</p>
               <div className="card-stamps">
                  <div className="c-stamp filled"><FlowerOutline /></div>
                  <div className="c-stamp filled"><FlowerOutline /></div>
                  <div className="c-stamp filled"><FlowerOutline /></div>
                  <div className="c-stamp"><FlowerOutline /></div>
                  <div className="c-stamp"><FlowerOutline /></div>
               </div>
            </div>
         </div>

         {/* Mockup 3: Cups */}
         <div className="mockup-item cups-bg">
            <div className="paper-cup pink-cup">
               <div className="cup-text">BLOOM<br/>BITES</div>
            </div>
            <div className="paper-cup green-cup">
               <div className="cup-text">BLOOM<br/>BITES</div>
            </div>
         </div>
      </div>

    </section>
  );
};

export default MiddleTheme;
