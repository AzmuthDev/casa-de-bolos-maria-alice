import { CircleCheck } from 'lucide-react';
import { GENERAL_MESSAGE, INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY, whatsappUrl } from '../data/cardapio';
import { InstagramIcon, WhatsAppIcon } from './icons';

const motivos = [
  'Ingredientes selecionados com muito carinho.',
  'Receitas caseiras que levam amor em cada detalhe.',
  'Bolos fofinhos, saborosos e feitos para momentos especiais.',
];

export default function Contato() {
  return (
    <>
      <section id="contato" className="carinho" aria-labelledby="carinho-titulo">
        <div className="carinho-inner">
          <h2 id="carinho-titulo" className="carinho-titulo">
            Feito com carinho para adoçar o seu dia.
          </h2>
          <div className="carinho-lado">
            <ul className="motivos">
              {motivos.map((m) => (
                <li key={m}>
                  <CircleCheck size={20} aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
            <div className="carinho-acoes">
              <a className="botao botao--framboesa" href={whatsappUrl(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={18} />
                Pedir no WhatsApp
              </a>
              <a className="link-claro" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={18} />@{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="rodape">
        <div className="rodape-inner">
          <img className="rodape-logo" src="/logo-maria-alice.png" alt="Casa de Bolos Maria Alice" width={656} height={374} />
          <dl className="rodape-contato">
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={whatsappUrl(GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer">
                  {WHATSAPP_DISPLAY}
                </a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  @{INSTAGRAM_HANDLE}
                </a>
              </dd>
            </div>
            <div>
              <dt>Encomendas</dt>
              <dd>Com 24 horas de antecedência</dd>
            </div>
          </dl>
          <p className="rodape-copy">© {new Date().getFullYear()} Casa de Bolos Maria Alice</p>
        </div>
      </footer>
    </>
  );
}
