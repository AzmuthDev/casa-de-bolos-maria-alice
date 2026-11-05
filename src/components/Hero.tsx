import { cakes, GENERAL_MESSAGE, whatsappUrl } from '../data/cardapio';
import { usePrefersReducedMotion } from '../hooks';
import { WhatsAppIcon } from './icons';

const BASE = import.meta.env.BASE_URL;

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="inicio" className="hero" aria-labelledby="hero-titulo">
      <div className="hero-fundo" aria-hidden="true">
        {reducedMotion ? (
          <img src={`${BASE}video/calda-chocolate.jpg`} alt="" />
        ) : (
          <video
            src={`${BASE}video/calda-chocolate.mp4`}
            poster={`${BASE}video/calda-chocolate.jpg`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
      </div>

      <div className="hero-conteudo">
        <h1 id="hero-titulo" className="hero-titulo">
          Bolos caseiros feitos com amor
        </h1>
        <p className="hero-texto">
          Fubá, coco, chocolate, limão e mais {cakes.length - 4} sabores, feitos sob encomenda. Peça pelo WhatsApp com 24 horas de
          antecedência.
        </p>
        <div className="hero-acoes">
          <a className="botao botao--framboesa" href={whatsappUrl(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} />
            Pedir pelo WhatsApp
          </a>
          <a className="botao botao--claro" href="#cozinha">
            Ver as fotos dos bolos
          </a>
        </div>
      </div>
    </section>
  );
}
