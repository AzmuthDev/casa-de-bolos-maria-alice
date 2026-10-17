import { useEffect, useState } from 'react';
import { GENERAL_MESSAGE, whatsappUrl } from '../data/cardapio';
import { WhatsAppIcon } from './icons';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topo ${scrolled ? 'topo--rolado' : ''}`}>
      <div className="topo-inner">
        <a href="#inicio" className="topo-logo" aria-label="Casa de Bolos Maria Alice, voltar ao início">
          <img src="/logo-maria-alice.png" alt="" width={656} height={374} />
        </a>
        <nav className="topo-nav" aria-label="Principal">
          <ul>
            <li>
              <a href="#cardapio">Cardápio</a>
            </li>
            <li>
              <a href="#como-encomendar">Como encomendar</a>
            </li>
            <li>
              <a href="#contato">Contato</a>
            </li>
          </ul>
        </nav>
        <a className="botao botao--framboesa topo-cta" href={whatsappUrl(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={18} />
          <span>
            Pedir<span className="so-desktop"> no WhatsApp</span>
          </span>
        </a>
      </div>
    </header>
  );
}
