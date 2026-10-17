import React, { useState } from 'react';
import './SobremesasPage.css';

const products = [
  {
    id: 1,
    name: 'Kit Misto de Mini Pavês',
    desc: 'Seleção de sabores: Chocolate, Nozes, Doce de Leite, Morango, Limão.',
    price: 'R$ 65,00',
    image: '/kit-mini-paves.png',
    category: 'Pavês'
  },
  {
    id: 2,
    name: 'Torta Holandesa Inteira',
    desc: 'Clássica base crocante com creme bávaro e ganache.',
    price: 'R$ 110,00',
    image: '/torta-holandesa.png',
    category: 'Tortas'
  },
  {
    id: 3,
    name: 'Degustação de Mousse Box',
    desc: '16 pots com 4 intensidades variadas de cacau.',
    price: 'R$ 145,00',
    image: '/mousse-box.png',
    category: 'Mousses'
  }
];

const categories = ['Tortas', 'Pavês', 'Mousses', 'Especiais', 'Individuais'];

const SobremesasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Pavês'); // Default to match screenshot

  const filteredProducts = products.filter(p => p.category === activeTab || activeTab === 'Todos');

  return (
    <div id="sobremesas" className="sobremesas-page">
      {/* ── Hero Section ── */}
      <section className="sobremesas-hero">
        <div className="container hero-split-container">
          <div className="hero-left">
            <h1 className="hero-main-title">
              MONTE SUA CAIXA <span className="text-highlight">PERFEITA DE SOBREMESAS</span>
            </h1>
            <p className="hero-main-subtitle">
              Crie sua seleção personalizada de sobremesas artesanais e deliciosas. Perfeito para presentear ou para você se deliciar. Seja para uma festa de aniversário ou para ocasiões especiais, monte seu mix de sabores exclusivos e faça seu pedido.
            </p>
            
            <div className="hero-cta-group">
              <button className="btn-cta-primary">FAÇA SEU PEDIDO</button>
              <button className="btn-cta-secondary">CRIAR SEU MIX</button>
            </div>

            <div className="hero-socials">
              {/* Ícones removidos temporariamente para corrigir erro de exportação do lucide-react */}
              <a href="#">FB</a>
              <a href="#">IG</a>
              <a href="#">WA</a>
            </div>
          </div>

          <div className="hero-right">
            <img src="/hero-parfait.png" alt="Gourmet Parfait" className="hero-floating-img" />
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="wave-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* ── Menu/Filters Section ── */}
      <section className="sobremesas-menu">
        <div className="container">
          <h2 className="menu-section-title">NOSSAS SOBREMESAS</h2>
          
          <div className="menu-filter-bar">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-pill ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Grid ── */}
          <div className="products-grid-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card-modern">
                <div className="product-img-container">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-body">
                  <h3 className="product-card-title">{product.name}</h3>
                  <p className="product-card-desc">{product.desc}</p>
                  <div className="product-card-footer">
                    <button className="btn-buy-pink">Comprar</button>
                    <span className="product-card-price">{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobremesasPage;
