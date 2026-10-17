import React from 'react';
import { Heart, Star, ChevronDown } from 'lucide-react';
import './Bestsellers.css';

const bestsellers = [
  {
    id: 1,
    name: 'Rich Chocolate Truffle Cake',
    price: 500,
    rating: 5.0,
    reviews: 500,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: 'Choco Chip Truffle Cake',
    price: 509,
    rating: 4.8,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    name: 'Tropical Fruit & Almond Cake',
    price: 599,
    rating: 4.9,
    reviews: 180,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    name: 'Butterscotch Crunch Cake',
    price: 399,
    rating: 4.7,
    reviews: 410,
    image: 'https://images.unsplash.com/photo-1557308536-ee471ef2c3d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
];

const Bestsellers: React.FC = () => {
  return (
    <section className="bestsellers section">
      <div className="container">
        <h2 className="section-title">Bestsellers from Across the Country</h2>
        
        <div className="bestsellers-grid">
          {bestsellers.map(cake => (
            <div key={cake.id} className="cake-card">
              <button className="heart-btn">
                <Heart size={18} />
              </button>
              
              <div className="cake-img-wrapper">
                <img src={cake.image} alt={cake.name} />
              </div>
              
              <div className="cake-details">
                <h3 className="cake-name">{cake.name}</h3>
                
                <div className="cake-price-row">
                  <span className="cake-price">₹{cake.price}</span>
                  <span className="cake-unit">/0.5 Kg</span>
                </div>
                
                <div className="cake-meta">
                  <div className="cake-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#F5C518" color="#F5C518" />
                    ))}
                    <span className="review-count">({cake.reviews})</span>
                  </div>
                  <button className="more-btn">
                     <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-wrapper">
           <button className="btn-primary">VIEW ALL</button>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
