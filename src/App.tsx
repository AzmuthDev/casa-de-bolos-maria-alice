import Header from './components/Header';
import Hero from './components/Hero';
import Cozinha from './components/Cozinha';
import Cardapio from './components/Cardapio';
import ComoEncomendar from './components/ComoEncomendar';
import Contato from './components/Contato';
import './App.css';

export default function App() {
  return (
    <>
      <a className="pular" href="#cardapio">
        Pular para o cardápio
      </a>
      <Header />
      <main>
        <Hero />
        <Cozinha />
        <Cardapio />
        <ComoEncomendar />
      </main>
      <Contato />
    </>
  );
}
