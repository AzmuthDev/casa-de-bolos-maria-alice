import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Hand, Minus, Plus, X } from 'lucide-react';
import { cakes, categories, formatPrice, getCake, orderMessage, whatsappUrl, type Cake } from '../data/cardapio';
import { useMediaQuery } from '../hooks';
import CakeCanvas from './CakeCanvas';
import { HeartMark, WhatsAppIcon } from './icons';

export default function Cardapio() {
  const isDesktop = useMediaQuery('(min-width: 960px)');
  const [selectedId, setSelectedId] = useState('fuba-goiabada');
  const [sheetId, setSheetId] = useState<string | null>(null);
  const hoverTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const preview = (id: string) => {
    if (!isDesktop) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setSelectedId(id), 110);
  };

  const choose = (id: string) => {
    window.clearTimeout(hoverTimer.current);
    if (isDesktop) setSelectedId(id);
    else setSheetId(id);
  };

  const selected = getCake(selectedId);

  return (
    <section id="cardapio" className="cardapio" aria-labelledby="cardapio-titulo">
      <div className="cardapio-topo">
        <h2 id="cardapio-titulo" className="titulo-secao">
          Cardápio
        </h2>
        <p>
          {isDesktop ? 'Passe o mouse ou clique' : 'Toque'} em um bolo para vê-lo de pertinho. Todos pesam entre 500 g e 600 g.
        </p>
      </div>

      <div className="cardapio-corpo">
        {isDesktop && (
          <aside className="vitrine" aria-label="Bolo em destaque">
            <CakeCanvas className="vitrine-palco" cakeId={selectedId} mode="menu" label={selected.orderName} prewarm />
            <BoloDetalhe key={selected.id} cake={selected} />
          </aside>
        )}

        <div className="cardapio-lista">
          {categories.map((cat) => (
            <section key={cat.id} className="grupo" aria-labelledby={`grupo-${cat.id}`}>
              <h3 id={`grupo-${cat.id}`} className="faixa">
                <HeartMark size={12} />
                {cat.name}
                <HeartMark size={12} />
              </h3>
              <ul className="itens">
                {cakes
                  .filter((c) => c.category === cat.id)
                  .map((c) => {
                    const active = isDesktop && c.id === selectedId;
                    return (
                      <li key={c.id} className={`item ${active ? 'item--ativo' : ''}`}>
                        <button
                          type="button"
                          className="item-botao"
                          aria-pressed={isDesktop ? active : undefined}
                          onMouseEnter={() => preview(c.id)}
                          onFocus={() => preview(c.id)}
                          onClick={() => choose(c.id)}
                        >
                          <HeartMark className="item-coracao" size={13} />
                          <span className="item-nome">{c.name}</span>
                          <span className="item-pontos" aria-hidden="true" />
                          <span className="item-preco">{formatPrice(c.price)}</span>
                        </button>
                        <a
                          className="item-pedir"
                          href={whatsappUrl(orderMessage(c))}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Pedir ${c.orderName} no WhatsApp`}
                        >
                          <WhatsAppIcon size={16} className="item-pedir-icone" />
                          <span className="item-pedir-texto">Pedir</span>
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {!isDesktop && <BoloSheet cakeId={sheetId} onClose={() => setSheetId(null)} />}
    </section>
  );
}

function BoloDetalhe({ cake, titleId }: { cake: Cake; titleId?: string }) {
  const [qtd, setQtd] = useState(1);
  const category = categories.find((c) => c.id === cake.category)?.name;

  return (
    <div className="detalhe">
      <p className="detalhe-categoria">{category}</p>
      <h3 className="detalhe-nome" id={titleId}>
        {cake.name}
      </h3>
      <p className="detalhe-descricao">{cake.description}</p>
      <div className="detalhe-compra">
        <p className="detalhe-preco">
          {formatPrice(cake.price * qtd)}
          {qtd > 1 && <span className="detalhe-preco-nota"> por {qtd} bolos</span>}
        </p>
        <div className="contador" role="group" aria-label="Quantidade">
          <button type="button" aria-label="Diminuir quantidade" disabled={qtd === 1} onClick={() => setQtd((q) => Math.max(1, q - 1))}>
            <Minus size={16} />
          </button>
          <output aria-live="polite">{qtd}</output>
          <button type="button" aria-label="Aumentar quantidade" disabled={qtd === 20} onClick={() => setQtd((q) => Math.min(20, q + 1))}>
            <Plus size={16} />
          </button>
        </div>
        <a
          className="botao botao--framboesa detalhe-pedir"
          href={whatsappUrl(orderMessage(cake, qtd))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} />
          Pedir no WhatsApp
        </a>
      </div>
      <p className="detalhe-dica">
        <Hand size={15} aria-hidden="true" />
        Arraste o bolo para girar
      </p>
    </div>
  );
}

function BoloSheet({ cakeId, onClose }: { cakeId: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (cakeId && !d.open) d.showModal();
    if (!cakeId && d.open) d.close();
  }, [cakeId]);

  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  };

  const cake = cakeId ? getCake(cakeId) : null;

  return (
    <dialog ref={ref} className="folha" onClose={onClose} onClick={onBackdrop} aria-labelledby="folha-titulo">
      {cake && (
        <div className="folha-conteudo">
          <button type="button" className="folha-fechar" aria-label="Fechar" onClick={() => ref.current?.close()}>
            <X size={20} />
          </button>
          <CakeCanvas className="folha-palco" cakeId={cake.id} mode="menu" label={cake.orderName} />
          <BoloDetalhe key={cake.id} cake={cake} titleId="folha-titulo" />
        </div>
      )}
    </dialog>
  );
}
