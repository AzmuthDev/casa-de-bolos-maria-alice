import React from 'react';
import { ArrowUp } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        
        <div className="footer-banner">
          <p>Casa de Bolos Maria Alice - Sua confeitaria online de confiança para todas as celebrações</p>
        </div>

        <div className="footer-content">
          <div className="footer-column logo-column">
             <div className="footer-column footer-logo">
          <img src="/logo.jpg" alt="Casa de Bolos Maria Alice" className="site-logo-footer" />
        </div>
             <ul className="footer-links">
               <li><a href="#">Our Story</a></li>
               <li><a href="#">Contact Us</a></li>
               <li><a href="#">Locate Store</a></li>
               <li><a href="#">Media</a></li>
               <li><a href="#">Careers</a></li>
             </ul>
          </div>

          <div className="footer-column">
             <h4>KNOW US</h4>
             <ul className="footer-links">
               <li><a href="#">Contact Us</a></li>
               <li><a href="#">Blog</a></li>
             </ul>
          </div>

          <div className="footer-column">
             <h4>NEED HELP</h4>
             <ul className="footer-links">
               <li><a href="#">Cancellation And Refund</a></li>
               <li><a href="#">Privacy Policy</a></li>
             </ul>
          </div>

          <div className="footer-column">
             <h4>MORE INFO</h4>
             <ul className="footer-links">
               <li><a href="#">Terms And Conditions</a></li>
               <li><a href="#">Customer Grievance</a></li>
             </ul>
          </div>

          <div className="footer-column subscribe-column">
             <h4>SUBSCRIBE</h4>
             <div className="subscribe-box">
                <input type="email" placeholder="Enter Email Address" />
                <button className="btn-primary subscribe-btn">SUBSCRIBE</button>
             </div>
             <div className="scroll-top" onClick={scrollToTop}>
                <div className="scroll-icon">
                  <ArrowUp size={20} />
                </div>
                <span>Hey, need any help?</span>
             </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
