import React from 'react';
import Hero from './Hero';
import MenuCategories from './MenuCategories';
import MiddleTheme from './MiddleTheme';
import Bestsellers from './Bestsellers';
import Features from './Features';

const LandingPage: React.FC = () => {
  return (
    <>
      <div id="home"><Hero /></div>
      <div id="bolos"><MenuCategories /></div>
      <MiddleTheme />
      <div id="aniversario"><Bestsellers /></div>
      <div id="features"><Features /></div>
    </>
  );
};

export default LandingPage;
