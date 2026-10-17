import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import SobremesasPage from './components/SobremesasPage';
import CafeManhaPage from './components/CafeManhaPage';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  // Handle back button and initial load based on hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'sobremesas') {
        setCurrentView('sobremesas');
      } else if (hash === 'cafe-manha') {
        setCurrentView('cafe-manha');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run once on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: string, anchor?: string) => {
    setCurrentView(view);
    if (view === 'home') {
      window.location.hash = anchor || 'home';
      if (currentView === 'home' && anchor) {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'sobremesas':
        return <SobremesasPage />;
      case 'cafe-manha':
        return <CafeManhaPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="app-container">
      <Header onNavigate={navigate} />
      <main>
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
