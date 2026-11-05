import { formatPrice, getCake, orderMessage, whatsappUrl } from '../data/cardapio';
import { WhatsAppIcon } from './icons';

/** Bolos com foto real, na ordem do mosaico. O primeiro sai grande. */
const vitrine = [
  'chocolate-cobertura',
  'coco',
  'limao-mousse',
  'fuba-goiabada',
  'churros',
  'banana-integral',
  'cenoura-gotas',
  'milho',
  'broa-italiana',
  'fuba',
  'laranja',
];

export default function Cozinha() {
  return (
    <section id="cozinha" className="cozinha" aria-labelledby="cozinha-titulo">
      <div className="cozinha-topo">
        <h2 id="cozinha-titulo" className="titulo-secao">
          Saídos do nosso forno
        </h2>
        <p>Fotos de verdade dos nossos bolos. Toque no que te deu vontade e o pedido abre no WhatsApp.</p>
      </div>

      <ul className="mosaico">
        {vitrine.map((id) => {
          const c = getCake(id);
          return (
            <li key={id} className="mosaico-item">
              <a href={whatsappUrl(orderMessage(c))} target="_blank" rel="noopener noreferrer" aria-label={`Pedir ${c.orderName}, ${formatPrice(c.price)}, no WhatsApp`}>
                <img src={c.photo} alt="" width={720} height={720} loading="lazy" />
                <span className="mosaico-legenda">
                  <span className="mosaico-nome">{c.name}</span>
                  <span className="mosaico-preco">{formatPrice(c.price)}</span>
                </span>
                <span className="mosaico-pedir" aria-hidden="true">
                  <WhatsAppIcon size={16} />
                  Pedir
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
