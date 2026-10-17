/** Formato do bolo: com furo (forma de pudim), redondo alto ou de forma (bolo de caixa). */
export type CakeShape = 'bundt' | 'round' | 'loaf';

/** O que aparece no miolo quando o bolo é cortado. */
export type Inclusion =
  | 'goiabada'
  | 'requeijao'
  | 'coco'
  | 'banana'
  | 'maca'
  | 'granulado'
  | 'gotas'
  | 'creme';

export type Topping =
  | { kind: 'none' }
  | { kind: 'sugar' }
  | { kind: 'goiabada' }
  | { kind: 'toasted-coconut' }
  | { kind: 'citrus'; color: string }
  | { kind: 'banana' }
  | { kind: 'apple' }
  | { kind: 'sprinkles'; color: string }
  | { kind: 'cinnamon-sugar' }
  | { kind: 'chips' }
  | { kind: 'zest' }
  | { kind: 'lime' };

export interface Glaze {
  color: string;
  /** 0–1: quanto a cobertura escorre pelas laterais. */
  drips: number;
}

export interface CakeLook {
  shape: CakeShape;
  /** Cor do miolo. */
  crumb: string;
  /** Cor da casca assada. */
  crust: string;
  glaze?: Glaze;
  topping: Topping;
  inclusion?: Inclusion;
  /** Camada de mousse por cima (bolo redondo). */
  mousse?: string;
  /** Coberto de coco ralado. */
  coconutCoat?: boolean;
}
