import React, { useState } from 'react';
import './SobremesasSection.css';

const products = [
  {
    id: 1,
    name: 'Box "Sabor do Dia"',
    desc: 'Uma seleção especial com 6 mini-bolos e donuts artesanais.',
    price: 'R$ 60,00',
    image: '/dessert-box.png',
    category: 'Boxes'
  },
  {
    id: 2,
    name: 'Éclair de Chocolate Gourmet',
    desc: 'Massa choux leve recheada com creme belga e cobertura crocante.',
    price: 'R$ 18,00',
    image: '/dessert-eclair.png',
    category: 'Doces'
  },
  {
    id: 3,
    name: 'Cheesecake de Morango',
    desc: 'Base crocante de biscoito com creme de queijo suave e calda fresca.',
    price: 'R$ 22,00',
    image: '/dessert-cheesecake.png',
    category: 'Especiais'
  },
  {
    id: 4,
    name: 'Box "Festa em Casa"',
    desc: '12 itens variados perfeitos para compartilhar momentos doces.',
    price: 'R$ 110,00',
    image: '/dessert-box.png',
    category: 'Boxes'
  }
];

const categories = ['Todos', 'Boxes', 'Doces', 'Especiais'];

const SobremesasSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');

  const filteredProducts = activeTab === 'Todos' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <section id="sobremesas" className="sobremesas-section">
      <div className="container">
        <div className="sobremesas-header">
          <h2 className="sobremesas-title">Sobremesas</h2>
          <div className="sobremesas-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="sobremesas-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="sobremesa-card">
              <div className="sobremesa-img-wrapper">
                <img src={product.image} alt={product.name} className="sobremesa-img" />
              </div>
              <div className="sobremesa-info">
                <h3 className="sobremesa-name">{product.name}</h3>
                <p className="sobremesa-desc">{product.desc}</p>
                <div className="sobremesa-footer">
                  <button className="btn-buy">Comprar</button>
                  <span className="sobremesa-price">{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SobremesasSection;
