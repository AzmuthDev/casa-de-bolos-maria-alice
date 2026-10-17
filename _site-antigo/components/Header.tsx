import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onNavigate: (view: string, anchor?: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('home');
    setIsMenuOpen(false);
  };

  const handleNavClick = (view: string, anchor?: string) => {
    onNavigate(view, anchor);
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <a href="#home" className="logo" onClick={handleLogoClick}>
          <img src="/logo.jpg" alt="Casa de Bolos Maria Alice" className="site-logo" />
        </a>

        <div className="nav-wrapper">
          <div className="top-bar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Procurar" />
            </div>
            <div className="user-actions">
              <a href="#" className="action-link login-link">
                <User size={18} />
                <span>Entrar</span>
              </a>
              <a href="#" className="action-link cart-link">
                <ShoppingCart size={18} />
              </a>
              <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              <li><a href="#bolos" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'bolos'); }}>Bolos</a></li>
              <li><a href="#sobremesas" onClick={(e) => { e.preventDefault(); handleNavClick('sobremesas'); }}>Sobremesas</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'features'); }}>Menu Completo</a></li>
              <li><a href="#cafe-manha" onClick={(e) => { e.preventDefault(); handleNavClick('cafe-manha'); }}>Café da Manhã</a></li>
            </ul>
            <button className="btn-primary nav-cta">Faça seu Pedido</button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
