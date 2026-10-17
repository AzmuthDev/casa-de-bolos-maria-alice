import * as THREE from 'three';
import type { Inclusion } from './types';
import type { P2, Rng } from './math';

function makeCanvas(size: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!] as const;
}

const tmpA = new THREE.Color();
const tmpB = new THREE.Color();
/** Mistura duas cores CSS e devolve rgba(). Usado só para pintar canvas (espaço sRGB). */
function mix(a: string, b: string, t: number, alpha = 1) {
  tmpA.set(a);
  tmpB.set(b);
  // Color.set converte para linear; voltamos para sRGB para pintar no canvas.
  tmpA.lerp(tmpB, t);
  const s = tmpA.getStyle(THREE.SRGBColorSpace).replace('rgb(', '').replace(')', '');
  return `rgba(${s},${alpha})`;
}

function finish(canvas: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/** Desenha algo nas 9 posições do ladrilho para a textura repetir sem costura. */
function wrapped(size: number, x: number, y: number, r: number, draw: (x: number, y: number) => void) {
  for (const ox of [-size, 0, size]) {
    for (const oy of [-size, 0, size]) {
      const px = x + ox;
      const py = y + oy;
      if (px + r < 0 || py + r < 0 || px - r > size || py - r > size) continue;
      draw(px, py);
    }
  }
}

/** Ruído claro da casca assada: multiplica a cor do vértice e serve de relevo. */
export function crustTexture(rng: Rng) {
  const S = 256;
  const [c, g] = makeCanvas(S);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, S, S);

  for (let i = 0; i < 70; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = 12 + rng() * 34;
    wrapped(S, x, y, r, (px, py) => {
      const grad = g.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, `rgba(110,70,35,${0.05 + rng() * 0.06})`);
      grad.addColorStop(1, 'rgba(110,70,35,0)');
      g.fillStyle = grad;
      g.fillRect(px - r, py - r, r * 2, r * 2);
    });
  }
  for (let i = 0; i < 2200; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = 0.5 + rng() * 1.6;
    const a = 0.1 + rng() * 0.28;
    wrapped(S, x, y, r, (px, py) => {
      g.fillStyle = `rgba(90,55,25,${a})`;
      g.beginPath();
      g.ellipse(px, py, r * (1 + rng()), r, rng() * Math.PI, 0, Math.PI * 2);
      g.fill();
    });
  }
  for (let i = 0; i < 600; i++) {
    const x = rng() * S;
    const y = rng() * S;
    g.fillStyle = `rgba(255,248,236,${0.3 + rng() * 0.4})`;
    g.fillRect(x, y, 1.2, 1.2);
  }
  return finish(c);
}

export interface FaceDomain {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface CrumbFaceOptions {
  crumb: string;
  crust: string;
  inclusion?: Inclusion;
  /** Faixa de mousse a partir desta altura. */
  mousse?: { from: number; color: string };
  /** Contorno do corte, nas mesmas unidades do domínio. */
  outline: P2[];
  domain: FaceDomain;
}

/** Textura da face cortada: miolo com furinhos, casca na borda e o recheio do sabor. */
export function crumbFaceTexture(o: CrumbFaceOptions, rng: Rng) {
  const S = 512;
  const [c, g] = makeCanvas(S);
  const { x0, x1, y0, y1 } = o.domain;
  const px = (x: number) => ((x - x0) / (x1 - x0)) * S;
  const py = (y: number) => S - ((y - y0) / (y1 - y0)) * S;
  const unit = S / (x1 - x0); // pixels por unidade de mundo

  g.fillStyle = o.crumb;
  g.fillRect(0, 0, S, S);

  const path = new Path2D();
  o.outline.forEach(([x, y], i) => (i ? path.lineTo(px(x), py(y)) : path.moveTo(px(x), py(y))));
  path.closePath();
  g.save();
  g.clip(path);

  // Variação suave de tom no miolo
  for (let i = 0; i < 30; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = 30 + rng() * 70;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, mix(o.crumb, rng() > 0.5 ? '#ffffff' : '#000000', 0.06, 0.6));
    grad.addColorStop(1, mix(o.crumb, o.crumb, 0, 0));
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Furinhos do miolo
  const pore = mix(o.crumb, '#3a2210', 0.22, 0.55);
  const poreDeep = mix(o.crumb, '#3a2210', 0.38, 0.45);
  for (let i = 0; i < 1500; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = 0.8 + Math.pow(rng(), 2.2) * 5;
    g.fillStyle = rng() > 0.8 ? poreDeep : pore;
    g.beginPath();
    g.ellipse(x, y, r * (1 + rng() * 0.8), r, rng() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const light = mix(o.crumb, '#ffffff', 0.25, 0.6);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = light;
    g.fillRect(rng() * S, rng() * S, 1.5, 1.5);
  }

  paintInclusion(g, o, rng, S, unit, px, py);

  if (o.mousse) {
    const top = py(o.mousse.from);
    g.fillStyle = o.mousse.color;
    g.fillRect(0, 0, S, top);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = mix(o.mousse.color, '#ffffff', 0.4, 0.5);
      g.beginPath();
      g.arc(rng() * S, rng() * top, 0.8 + rng() * 2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = mix(o.mousse.color, '#6b7a2a', 0.35, 0.5);
    g.fillRect(0, top - 2, S, 3);
  }

  // Casca na borda do corte
  g.strokeStyle = mix(o.crust, o.crust, 0, 0.35);
  g.lineWidth = unit * 0.07;
  g.stroke(path);
  g.strokeStyle = o.crust;
  g.lineWidth = unit * 0.035;
  g.stroke(path);
  g.restore();

  return finish(c);
}

function paintInclusion(
  g: CanvasRenderingContext2D,
  o: CrumbFaceOptions,
  rng: Rng,
  S: number,
  unit: number,
  _px: (x: number) => number,
  py: (y: number) => number,
) {
  const blob = (color: string, x: number, y: number, w: number, h: number, rot: number) => {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = color;
    g.beginPath();
    g.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.35);
    g.fill();
    g.restore();
  };

  switch (o.inclusion) {
    case 'goiabada':
      for (let i = 0; i < 22; i++) {
        const x = rng() * S;
        const y = rng() * S;
        const w = unit * (0.05 + rng() * 0.06);
        blob('#a3172e', x, y, w, w * (0.6 + rng() * 0.5), rng() * Math.PI);
        blob('rgba(220,80,100,0.45)', x - w * 0.12, y - w * 0.12, w * 0.45, w * 0.25, rng());
      }
      break;
    case 'requeijao': {
      const yMid = py(0.3);
      g.fillStyle = '#fff7e6';
      g.beginPath();
      g.moveTo(0, yMid);
      for (let x = 0; x <= S; x += 16) g.lineTo(x, yMid + Math.sin(x * 0.03) * 8 - 10);
      for (let x = S; x >= 0; x -= 16) g.lineTo(x, yMid + Math.sin(x * 0.025 + 1) * 6 + 14);
      g.closePath();
      g.fill();
      break;
    }
    case 'coco':
      for (let i = 0; i < 420; i++) {
        g.strokeStyle = `rgba(255,253,245,${0.6 + rng() * 0.4})`;
        g.lineWidth = 1.4;
        const x = rng() * S;
        const y = rng() * S;
        const a = rng() * Math.PI;
        const l = 3 + rng() * 6;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        g.stroke();
      }
      break;
    case 'banana':
      for (let i = 0; i < 40; i++) {
        const x = rng() * S;
        const y = rng() * S;
        const w = unit * (0.03 + rng() * 0.05);
        blob('rgba(120,72,30,0.55)', x, y, w, w * 0.6, rng() * Math.PI);
      }
      for (let i = 0; i < 260; i++) {
        g.fillStyle = 'rgba(60,35,15,0.6)';
        g.fillRect(rng() * S, rng() * S, 1.6, 1.6);
      }
      break;
    case 'maca':
      for (let i = 0; i < 26; i++) {
        const x = rng() * S;
        const y = rng() * S;
        const w = unit * (0.05 + rng() * 0.05);
        blob('#ead69a', x, y, w, w * (0.7 + rng() * 0.3), rng() * Math.PI);
      }
      for (let i = 0; i < 300; i++) {
        g.fillStyle = 'rgba(95,55,20,0.5)';
        g.fillRect(rng() * S, rng() * S, 1.4, 1.4);
      }
      break;
    case 'granulado':
      for (let i = 0; i < 520; i++) {
        const x = rng() * S;
        const y = rng() * S;
        const a = rng() * Math.PI;
        g.strokeStyle = rng() > 0.3 ? '#3b2017' : '#5a3424';
        g.lineWidth = 2.2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5);
        g.stroke();
      }
      break;
    case 'gotas':
      for (let i = 0; i < 70; i++) {
        g.fillStyle = rng() > 0.5 ? '#3a2117' : '#4a2a1c';
        g.beginPath();
        g.ellipse(rng() * S, rng() * S, 4 + rng() * 4, 3 + rng() * 3, rng() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
      break;
    case 'creme':
      for (const [from, to] of [
        [0.2, 0.25],
        [0.4, 0.45],
      ]) {
        const a = py(to);
        const b = py(from);
        g.fillStyle = '#fffaf0';
        g.beginPath();
        g.moveTo(0, a);
        for (let x = 0; x <= S; x += 12) g.lineTo(x, a + Math.sin(x * 0.04 + from * 20) * 2.5);
        for (let x = S; x >= 0; x -= 12) g.lineTo(x, b + Math.sin(x * 0.05 + to * 10) * 2.5);
        g.closePath();
        g.fill();
      }
      for (let i = 0; i < 300; i++) {
        g.fillStyle = 'rgba(255,255,255,0.8)';
        g.fillRect(rng() * S, rng() * S, 2.5, 1.2);
      }
      break;
    default:
      break;
  }
}

/** Rodela de fruta cítrica vista de cima. */
export function citrusTexture(peel: string, flesh: string) {
  const S = 256;
  const [c, g] = makeCanvas(S);
  const cx = S / 2;
  g.fillStyle = peel;
  g.beginPath();
  g.arc(cx, cx, cx, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fbf3df';
  g.beginPath();
  g.arc(cx, cx, cx * 0.88, 0, Math.PI * 2);
  g.fill();
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + 0.05;
    const a1 = ((i + 1) / n) * Math.PI * 2 - 0.05;
    g.fillStyle = flesh;
    g.beginPath();
    g.moveTo(cx + Math.cos((a0 + a1) / 2) * 8, cx + Math.sin((a0 + a1) / 2) * 8);
    g.arc(cx, cx, cx * 0.8, a0, a1);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx, cx);
    g.lineTo(cx + Math.cos((a0 + a1) / 2) * cx * 0.7, cx + Math.sin((a0 + a1) / 2) * cx * 0.7);
    g.stroke();
  }
  g.fillStyle = '#fbf3df';
  g.beginPath();
  g.arc(cx, cx, 9, 0, Math.PI * 2);
  g.fill();
  return finish(c);
}

/** Rodela de banana: polpa clara com o miolo de sementinhas. */
export function bananaTexture() {
  const S = 128;
  const [c, g] = makeCanvas(S);
  const cx = S / 2;
  g.fillStyle = '#c98b42';
  g.beginPath();
  g.arc(cx, cx, cx, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f2dc9c';
  g.beginPath();
  g.arc(cx, cx, cx * 0.86, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(214,170,90,0.6)';
  g.beginPath();
  g.arc(cx, cx, cx * 0.4, 0, Math.PI * 2);
  g.fill();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.fillStyle = '#5a3a1a';
    g.beginPath();
    g.arc(cx + Math.cos(a) * 8, cx + Math.sin(a) * 8, 2.5, 0, Math.PI * 2);
    g.fill();
  }
  return finish(c);
}
