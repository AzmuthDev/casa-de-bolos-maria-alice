export type P2 = [number, number];
export type Rng = () => number;

/** PRNG determinístico: o mesmo bolo sempre nasce com os mesmos confeitos. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export function easeOutBack(t: number, s = 1.6) {
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

/** Pontos ao longo de uma elipse, de a0 até a1 (inclusive). */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): P2[] {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

export function dedupe(pts: P2[], eps = 1e-5): P2[] {
  const out: P2[] = [];
  for (const p of pts) {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > eps) out.push(p);
  }
  const f = out[0];
  const l = out[out.length - 1];
  if (out.length > 2 && Math.hypot(f[0] - l[0], f[1] - l[1]) <= eps) out.pop();
  return out;
}

/** Reamostra a linha para espaçamento ~uniforme, preservando os cantos originais. */
export function resample(pts: P2[], step: number, closed: boolean): P2[] {
  const out: P2[] = [];
  const n = pts.length;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.ceil(len / step));
    for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

/** Normais 2D apontando para fora, para um perfil percorrido no sentido anti-horário (r para a direita, y para cima). */
export function profileNormals(pts: P2[], closed: boolean): P2[] {
  const n = pts.length;
  return pts.map((_, i) => {
    const prev = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)];
    const next = closed ? pts[(i + 1) % n] : pts[Math.min(n - 1, i + 1)];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    return [ty / l, -tx / l];
  });
}

/** Altura máxima do polígono na coordenada x (topo da superfície). */
export function polyTopY(poly: P2[], x: number): number {
  let best = -Infinity;
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const lo = Math.min(a[0], b[0]);
    const hi = Math.max(a[0], b[0]);
    if (x < lo || x > hi || hi - lo < 1e-6) continue;
    const t = (x - a[0]) / (b[0] - a[0]);
    best = Math.max(best, lerp(a[1], b[1], t));
  }
  return best === -Infinity ? 0 : best;
}

/** Maior (ou menor) x do polígono na altura y. */
export function polyXAt(poly: P2[], y: number, pick: 'max' | 'min', limit?: (x: number) => boolean): number {
  let best = pick === 'max' ? -Infinity : Infinity;
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const lo = Math.min(a[1], b[1]);
    const hi = Math.max(a[1], b[1]);
    if (y < lo || y > hi || hi - lo < 1e-6) continue;
    const t = (y - a[1]) / (b[1] - a[1]);
    const x = lerp(a[0], b[0], t);
    if (limit && !limit(x)) continue;
    best = pick === 'max' ? Math.max(best, x) : Math.min(best, x);
  }
  return Number.isFinite(best) ? best : 0;
}
