import { useState, type CSSProperties } from 'react';
import { formatPrice, getCake, heroCakeIds, orderMessage, whatsappUrl } from '../data/cardapio';
import CakeCanvas from './CakeCanvas';
import { WhatsAppIcon } from './icons';

export default function Hero() {
  const [cakeId, setCakeId] = useState(heroCakeIds[0]);
  const cake = getCake(cakeId);

  return (
    <section id="inicio" className="hero" aria-labelledby="hero-titulo">
      <div className="hero-cena">
        <h1 id="hero-titulo" className="hero-titulo">
          <span className="hero-linha">
            <span>Bolos caseiros</span>
          </span>
          <span className="hero-linha">
            <span>feitos com amor</span>
          </span>
        </h1>
        <CakeCanvas className="hero-palco" cakeId={cakeId} mode="hero" introDelay={700} label={cake.orderName} />
      </div>

      <div className="hero-painel">
        <div className="hero-sabores">
          <p className="hero-dica" id="hero-dica">
            Escolha um sabor e arraste o bolo para girar.
          </p>
          <div className="sabores" role="group" aria-labelledby="hero-dica">
            {heroCakeIds.map((id) => {
              const c = getCake(id);
              const swatch = {
                '--miolo': c.look.crumb,
                '--cobertura': c.look.glaze?.color ?? (c.look.coconutCoat ? '#ffffff' : c.look.crust),
              } as CSSProperties;
              return (
                <button
                  key={id}
                  type="button"
                  className="sabor"
                  aria-pressed={id === cakeId}
                  onClick={() => setCakeId(id)}
                >
                  <span className="sabor-cor" style={swatch} aria-hidden="true" />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hero-pedido" aria-live="polite">
          <p className="hero-bolo">
            <span className="hero-bolo-nome">{cake.name}</span>
            <span className="hero-bolo-preco">{formatPrice(cake.price)}</span>
          </p>
          <div className="hero-acoes">
            <a className="botao botao--framboesa" href={whatsappUrl(orderMessage(cake))} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />
              Pedir este bolo
            </a>
            <a className="botao botao--contorno" href="#cardapio">
              Ver o cardápio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
