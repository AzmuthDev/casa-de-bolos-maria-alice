import React from 'react';
import './CafeManhaPage.css';

const CafeManhaPage: React.FC = () => {
  return (
    <div className="cafe-manha-page">
      {/* ── HERO SECTION ── */}
      <section className="cafe-hero">
        <div className="hero-overlay"></div>
        <div className="container hero-container-cafe">
          <div className="hero-content-cafe">
            <p className="hero-tagline">FEITO COM AMOR TODOS OS DIAS</p>
            <h1 className="hero-title-cafe">Freshly Baked,<br/>Just for You!</h1>
            <p className="hero-desc-cafe">
              Comece seu dia com o aroma irresistível de pães artesanais e café fresquinho. 
              Uma experiência única para despertar seus sentidos.
            </p>
            <button className="btn-cafe-primary">PEÇA AGORA</button>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="why-choose">
        <div className="container">
          <div className="section-header-cafe">
            <span className="icon-leaf">🌿</span>
            <h2>Por que nos escolher?</h2>
            <p>Qualidade, tradição e ingredientes selecionados em cada detalhe do seu café.</p>
          </div>
          <div className="choose-grid">
            <div className="choose-item">
              <h3>Ingredientes Orgânicos</h3>
              <p>Usamos apenas o melhor da natureza para garantir sabor e saúde.</p>
            </div>
            <div className="choose-item">
              <h3>Receitas Tradicionais</h3>
              <p>Seguimos processos artesanais passados por gerações.</p>
            </div>
            <div className="choose-item">
              <h3>Entrega Rápida</h3>
              <p>Seu café chega quentinho e crocante na sua porta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT GRID ── */}
      <section className="cafe-products">
        <div className="container">
          <div className="products-grid-cafe">
            <div className="cafe-card">
              <div className="cafe-card-img">
                <img src="/artisan-bread.png" alt="Pães Artesanais" />
              </div>
              <div className="cafe-card-info">
                <h3>Pães Artesanais</h3>
                <p>Fermentação natural, casca crocante e miolo macio. O clássico que nunca falha.</p>
                <button className="btn-cafe-outline">Ver Menu</button>
              </div>
            </div>
            <div className="cafe-card">
              <div className="cafe-card-img">
                <img src="/sweet-pastries.png" alt="Doces e Folhados" />
              </div>
              <div className="cafe-card-info">
                <h3>Doces e Folhados</h3>
                <p>Croissants amanteigados e folhados recheados com os melhores sabores.</p>
                <button className="btn-cafe-outline">Ver Menu</button>
              </div>
            </div>
            <div className="cafe-card">
              <div className="cafe-card-img">
                <img src="/cafe-cakes.png" alt="Bolos de Café" />
              </div>
              <div className="cafe-card-info">
                <h3>Bolos de Café</h3>
                <p>Bolos leves e fofinhos, perfeitos para acompanhar sua xícara de café.</p>
                <button className="btn-cafe-outline">Ver Menu</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISIT US ── */}
      <section className="visit-us">
        <div className="container visit-container">
          <div className="visit-text">
            <h2>Visite-nos hoje</h2>
            <p>Venha sentir o aroma de perto e provar nossas delícias em um ambiente acolhedor.</p>
            <button className="btn-cafe-primary">VER LOCALIZAÇÃO</button>
          </div>
          <div className="visit-gallery">
            <div className="gallery-main">
              <img src="/hero-cafe.png" alt="Breakfast Spread" />
            </div>
            <div className="gallery-side">
               <img src="/sweet-pastries.png" alt="Pastries" />
               <img src="/artisan-bread.png" alt="Breads" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CafeManhaPage;
