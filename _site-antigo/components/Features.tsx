import React from 'react';
import { Truck, Image as ImageIcon, Users, Clock, Ticket } from 'lucide-react';
import './Features.css';

const Features: React.FC = () => {
  return (
    <section className="features section">
      <div className="container">
        <h2 className="section-title">Our Promise</h2>
        <p className="section-subtitle">There is no secret spell - only honest hard work!</p>
        
        <div className="features-content">
          <div className="features-left">
            <div className="promise-box">
              <p className="promise-title">A glimpse into our secret - only honest hard work!</p>
              
              <div className="promise-grid">
                <div className="promise-item">
                  <div className="promise-icon">
                    <Truck size={24} />
                  </div>
                  <span>ON TIME DELIVERY</span>
                </div>
                <div className="promise-item">
                  <div className="promise-icon">
                    <ImageIcon size={24} />
                  </div>
                  <span>500+ DESIGNS</span>
                </div>
                <div className="promise-item">
                  <div className="promise-icon">
                    <Users size={24} />
                  </div>
                  <span>2 CR+ ORDERS</span>
                </div>
                <div className="promise-item">
                  <div className="promise-icon">
                    <Clock size={24} />
                  </div>
                  <span>BAKED FRESH</span>
                </div>
              </div>
            </div>

            <div className="magical-ticket-box">
               <div className="ticket-icon-wrapper">
                 <Ticket size={40} className="ticket-icon" />
               </div>
               <div className="ticket-info">
                 <h3 className="ticket-title">THE MAGICAL TICKET</h3>
                 <p className="ticket-desc">Add 3 reminders in your account.<br/>Win offers worth Rs. 750</p>
                 <button className="btn-primary ticket-btn">UNLOCK NOW</button>
               </div>
            </div>

            <div className="social-follow">
               <div className="avatars">
                  <img src="https://i.pravatar.cc/150?u=1" alt="user" />
                  <img src="https://i.pravatar.cc/150?u=2" alt="user" />
                  <img src="https://i.pravatar.cc/150?u=3" alt="user" />
                  <img src="https://i.pravatar.cc/150?u=4" alt="user" />
                  <img src="https://i.pravatar.cc/150?u=5" alt="user" />
               </div>
               <span className="social-text">Follow us on social!</span>
            </div>
          </div>

          <div className="features-right">
             <div className="lifestyle-grid">
                <img src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Baking 1" className="grid-img img-1"/>
                <img src="https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Baking 2" className="grid-img img-2"/>
                <img src="https://images.unsplash.com/photo-1587241321921-91a834d6d191?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Baking 3" className="grid-img img-3"/>
                <img src="https://images.unsplash.com/photo-1614145121029-83a9f7b68bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Baking 4" className="grid-img img-4"/>
                <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Baking 5" className="grid-img img-5"/>
                <img src="https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Baking 6" className="grid-img img-6"/>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
