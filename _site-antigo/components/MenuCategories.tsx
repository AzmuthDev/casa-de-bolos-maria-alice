import React from 'react';
import { CakeSlice, Coffee, IceCream, Cookie } from 'lucide-react';
import './MenuCategories.css';

const categories = [
  { name: 'CLASSIC', icon: <CakeSlice size={32} /> },
  { name: 'GOURMET', icon: <Coffee size={32} /> },
  { name: 'DESSERTS', icon: <IceCream size={32} /> },
  { name: 'COOKIES', icon: <Cookie size={32} /> },
];

const MenuCategories: React.FC = () => {
  return (
    <section className="menu-categories section">
      <div className="container">
        <div className="menu-header">
           <h2 className="section-title">Menu</h2>
           <p className="section-subtitle">What will you wish for?</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-card">
              <div className="category-icon-wrapper">
                {cat.icon}
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuCategories;
