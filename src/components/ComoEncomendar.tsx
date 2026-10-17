import { Clock, Weight } from 'lucide-react';

const passos = [
  { titulo: 'Escolha seu bolo', texto: 'Veja os sabores no cardápio e toque no que você quer.' },
  { titulo: 'Toque em “Pedir”', texto: 'O WhatsApp abre com a mensagem pronta, com o nome e o preço do bolo.' },
  { titulo: 'Combine o dia', texto: 'A gente confirma a encomenda e combina com você o dia e o horário.' },
];

export default function ComoEncomendar() {
  return (
    <section id="como-encomendar" className="encomendar" aria-labelledby="encomendar-titulo">
      <div className="encomendar-passos">
        <h2 id="encomendar-titulo" className="titulo-secao">
          Como encomendar
        </h2>
        <ol className="passos">
          {passos.map((p, i) => (
            <li key={p.titulo} className="passo">
              <span className="passo-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="avisos">
        <div className="aviso">
          <span className="aviso-icone">
            <Weight size={22} aria-hidden="true" />
          </span>
          <p>
            Todos os bolos pesam entre <strong>500 g e 600 g</strong>.
          </p>
        </div>
        <div className="aviso">
          <span className="aviso-icone">
            <Clock size={22} aria-hidden="true" />
          </span>
          <p>
            Aceitamos encomendas com no mínimo <strong>24 horas</strong> de antecedência.
          </p>
        </div>
      </div>
    </section>
  );
}
