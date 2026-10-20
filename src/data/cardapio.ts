import type { CakeLook } from '../three/types';

/* ── Contato ─────────────────────────────────────────────── */

// Número no formato internacional, só dígitos (55 + DDD + número).
export const WHATSAPP_NUMBER = '5531993271326';
export const WHATSAPP_DISPLAY = '(31) 99327-1326';
export const INSTAGRAM_HANDLE = 'casadebolomariaalice';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

/* ── Cardápio ────────────────────────────────────────────── */

export type CategoryId = 'tradicionais' | 'especiais' | 'coco';

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Cake {
  id: string;
  name: string;
  /** Como o bolo aparece na mensagem do WhatsApp. */
  orderName: string;
  price: number;
  category: CategoryId;
  description: string;
  look: CakeLook;
}

export const categories: Category[] = [
  { id: 'tradicionais', name: 'Bolos tradicionais' },
  { id: 'especiais', name: 'Bolos especiais' },
  { id: 'coco', name: 'Bolo de coco' },
];

/* Paletas de massa reaproveitadas pelos bolos */
const FUBA = { crumb: '#F0C462', crust: '#C98B3B' };
const MILHO = { crumb: '#F3CE5E', crust: '#D39A3C' };
const CITRICO = { crumb: '#F4C85E', crust: '#CF923A' };
const CENOURA = { crumb: '#F2973A', crust: '#B9621F' };
const CHOCOLATE = { crumb: '#5A3424', crust: '#3B2118' };
const LIMAO = { crumb: '#F2D98A', crust: '#CFA24E' };
const INTEGRAL = { crumb: '#C99A62', crust: '#8C5A2E' };

const GANACHE = '#3A1F15';

export const cakes: Cake[] = [
  /* Tradicionais */
  {
    id: 'fuba',
    name: 'Fubá',
    orderName: 'Bolo de Fubá',
    price: 17,
    category: 'tradicionais',
    description: 'O bolo da tarde de toda casa mineira: massa de fubá fofinha e douradinha.',
    look: { shape: 'bundt', ...FUBA, topping: { kind: 'sugar' } },
  },
  {
    id: 'fuba-goiabada',
    name: 'Fubá com Goiabada',
    orderName: 'Bolo de Fubá com Goiabada',
    price: 18,
    category: 'tradicionais',
    description: 'Massa de fubá com pedacinhos de goiabada que derretem no forno.',
    look: { shape: 'bundt', ...FUBA, inclusion: 'goiabada', topping: { kind: 'goiabada' } },
  },
  {
    id: 'milho',
    name: 'Milho',
    orderName: 'Bolo de Milho',
    price: 18,
    category: 'tradicionais',
    description: 'Bolo de milho cremoso, com gostinho de fazenda.',
    look: { shape: 'round', ...MILHO, topping: { kind: 'none' } },
  },
  {
    id: 'milho-requeijao',
    name: 'Milho com Requeijão',
    orderName: 'Bolo de Milho com Requeijão',
    price: 21,
    category: 'tradicionais',
    description: 'Bolo de milho com um veio cremoso de requeijão no meio.',
    look: { shape: 'round', ...MILHO, inclusion: 'requeijao', topping: { kind: 'none' } },
  },
  {
    id: 'broa-italiana',
    name: 'Broa Italiana',
    orderName: 'Broa Italiana',
    price: 22,
    category: 'tradicionais',
    description: 'Fubá, requeijão e coco numa broa de casquinha crocante.',
    look: { shape: 'loaf', crumb: '#EDC46E', crust: '#B97434', inclusion: 'coco', topping: { kind: 'toasted-coconut' } },
  },
  {
    id: 'laranja',
    name: 'Laranja',
    orderName: 'Bolo de Laranja',
    price: 18,
    category: 'tradicionais',
    description: 'Massa leve feita com laranja e uma caldinha brilhante por cima.',
    look: { shape: 'bundt', ...CITRICO, glaze: { color: '#F5B860', drips: 0.6 }, topping: { kind: 'citrus', color: '#F7932A' } },
  },
  {
    id: 'mexerica',
    name: 'Mexerica',
    orderName: 'Bolo de Mexerica',
    price: 18,
    category: 'tradicionais',
    description: 'Perfumado de mexerica, com calda cítrica por cima.',
    look: { shape: 'bundt', crumb: '#F5BE52', crust: '#C9852F', glaze: { color: '#F2A04A', drips: 0.55 }, topping: { kind: 'citrus', color: '#EF7A1A' } },
  },
  {
    id: 'coco-queimado',
    name: 'Coco Queimado',
    orderName: 'Bolo de Coco Queimado',
    price: 18,
    category: 'tradicionais',
    description: 'Coco tostado e caramelizado por cima de uma massa branquinha.',
    look: { shape: 'round', crumb: '#F6E3BC', crust: '#C99353', inclusion: 'coco', topping: { kind: 'toasted-coconut' } },
  },
  {
    id: 'banana-integral',
    name: 'Bolo de Banana com Farinha Integral e Canela',
    orderName: 'Bolo de Banana com Farinha Integral e Canela',
    price: 22,
    category: 'tradicionais',
    description: 'Banana madura, farinha integral e canela. Docinho na medida.',
    look: { shape: 'loaf', ...INTEGRAL, inclusion: 'banana', topping: { kind: 'banana' } },
  },
  {
    id: 'maca-integral',
    name: 'Bolo de Maçã com Farinha Integral',
    orderName: 'Bolo de Maçã com Farinha Integral',
    price: 22,
    category: 'tradicionais',
    description: 'Maçã em pedaços numa massa integral úmida e perfumada.',
    look: { shape: 'loaf', crumb: '#D2A46C', crust: '#93602F', inclusion: 'maca', topping: { kind: 'apple' } },
  },
  {
    id: 'formigueiro',
    name: 'Formigueiro',
    orderName: 'Bolo Formigueiro',
    price: 18,
    category: 'tradicionais',
    description: 'Massa amarelinha pontilhada de granulado de chocolate.',
    look: { shape: 'bundt', crumb: '#F1D08A', crust: '#C99448', inclusion: 'granulado', topping: { kind: 'sprinkles', color: '#3B2017' } },
  },
  {
    id: 'iogurte',
    name: 'Iogurte',
    orderName: 'Bolo de Iogurte',
    price: 18,
    category: 'tradicionais',
    description: 'Massa clarinha e macia, com cobertura branca de iogurte.',
    look: { shape: 'bundt', crumb: '#F6E2B2', crust: '#D3A65C', glaze: { color: '#FBF5EA', drips: 0.7 }, topping: { kind: 'none' } },
  },
  {
    id: 'churros',
    name: 'Churros',
    orderName: 'Bolo de Churros',
    price: 25,
    category: 'tradicionais',
    description: 'Doce de leite por cima e casquinha de açúcar com canela.',
    look: { shape: 'bundt', crumb: '#E9B76A', crust: '#B2702E', glaze: { color: '#8E521E', drips: 0.8 }, topping: { kind: 'cinnamon-sugar' } },
  },

  /* Especiais */
  {
    id: 'cenoura',
    name: 'Cenoura',
    orderName: 'Bolo de Cenoura',
    price: 18,
    category: 'especiais',
    description: 'Laranjinha, fofa e úmida. O bolo de cenoura de sempre.',
    look: { shape: 'bundt', ...CENOURA, topping: { kind: 'none' } },
  },
  {
    id: 'cenoura-cobertura',
    name: 'Cenoura com Cobertura de Chocolate',
    orderName: 'Bolo de Cenoura com Cobertura de Chocolate',
    price: 25,
    category: 'especiais',
    description: 'Bolo de cenoura com aquela cobertura de chocolate que escorre pelas bordas.',
    look: { shape: 'bundt', ...CENOURA, glaze: { color: GANACHE, drips: 1 }, topping: { kind: 'none' } },
  },
  {
    id: 'cenoura-gotas',
    name: 'Cenoura com Gotas de Chocolate',
    orderName: 'Bolo de Cenoura com Gotas de Chocolate',
    price: 22,
    category: 'especiais',
    description: 'Bolo de cenoura com gotas de chocolate na massa e por cima.',
    look: { shape: 'bundt', ...CENOURA, inclusion: 'gotas', topping: { kind: 'chips' } },
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    orderName: 'Bolo de Chocolate',
    price: 18,
    category: 'especiais',
    description: 'Massa de chocolate escura, macia e bem chocolatuda.',
    look: { shape: 'bundt', ...CHOCOLATE, topping: { kind: 'none' } },
  },
  {
    id: 'chocolate-cobertura',
    name: 'Chocolate com Cobertura',
    orderName: 'Bolo de Chocolate com Cobertura',
    price: 25,
    category: 'especiais',
    description: 'Bolo de chocolate com cobertura brilhante e granulado.',
    look: { shape: 'bundt', ...CHOCOLATE, glaze: { color: GANACHE, drips: 1 }, topping: { kind: 'sprinkles', color: '#2A160F' } },
  },
  {
    id: 'limao',
    name: 'Limão',
    orderName: 'Bolo de Limão',
    price: 18,
    category: 'especiais',
    description: 'Massa de limão azedinha com glacê e raspas por cima.',
    look: { shape: 'bundt', ...LIMAO, glaze: { color: '#FBF7EC', drips: 0.6 }, topping: { kind: 'zest' } },
  },
  {
    id: 'limao-mousse',
    name: 'Limão com Mousse de Limão',
    orderName: 'Bolo de Limão com Mousse de Limão',
    price: 25,
    category: 'especiais',
    description: 'Bolo de limão com uma camada generosa de mousse de limão.',
    look: { shape: 'round', ...LIMAO, mousse: '#E6EDA8', topping: { kind: 'lime' } },
  },

  /* Coco */
  {
    id: 'coco',
    name: 'Coco',
    orderName: 'Bolo de Coco',
    price: 25,
    category: 'coco',
    description: 'Massa branquinha recheada e coberta de coco ralado. O queridinho da casa.',
    look: { shape: 'round', crumb: '#FBF1DD', crust: '#F3E6CB', inclusion: 'creme', coconutCoat: true, topping: { kind: 'none' } },
  },
];

/** Bolos que aparecem para girar no topo da página. */
export const heroCakeIds = ['chocolate-cobertura', 'fuba-goiabada', 'coco', 'laranja', 'cenoura-cobertura'];

export const getCake = (id: string) => cakes.find((c) => c.id === id) ?? cakes[0];

/* ── Pedido pelo WhatsApp ────────────────────────────────── */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatPrice = (value: number) => brl.format(value);

export function orderMessage(cake: Cake, quantity = 1) {
  const lines = [
    'Olá, Casa de Bolos Maria Alice! 🍰',
    'Quero encomendar:',
    '',
    `• ${quantity}x ${cake.orderName} (${formatPrice(cake.price)}${quantity > 1 ? ' cada' : ''})`,
  ];
  if (quantity > 1) lines.push(`Total: ${formatPrice(cake.price * quantity)}`);
  lines.push('', 'Para qual dia vocês têm disponibilidade?');
  return lines.join('\n');
}

export const GENERAL_MESSAGE =
  'Olá, Casa de Bolos Maria Alice! 🍰 Vi o cardápio no site e quero fazer uma encomenda.';

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
