import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CakeLook } from './types';
import {
  arc,
  clamp,
  dedupe,
  hashString,
  lerp,
  mulberry32,
  polyTopY,
  polyXAt,
  profileNormals,
  resample,
  smoothstep,
  type P2,
  type Rng,
} from './math';
import { bananaTexture, citrusTexture, crumbFaceTexture, crustTexture } from './textures';

const TAU = Math.PI * 2;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const GLAZE_T = 0.032;

/** Texturas compartilhadas por todos os bolos de um palco 3D. */
export class CakeKit {
  readonly textures = new Set<THREE.Texture>();
  readonly crust: THREE.Texture;
  private citrus = new Map<string, THREE.Texture>();
  private banana?: THREE.Texture;

  constructor() {
    this.crust = this.keep(crustTexture(mulberry32(7)));
    this.crust.repeat.set(1, 1);
  }

  keep<T extends THREE.Texture>(t: T) {
    this.textures.add(t);
    return t;
  }

  citrusTex(peel: string, flesh: string) {
    const key = peel + flesh;
    let t = this.citrus.get(key);
    if (!t) {
      t = this.keep(citrusTexture(peel, flesh));
      this.citrus.set(key, t);
    }
    return t;
  }

  bananaTex() {
    this.banana ??= this.keep(bananaTexture());
    return this.banana;
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();
  }
}

/* ── Perfis (corte transversal do bolo: r para fora, y para cima) ── */

interface LatheSpec {
  profile: P2[];
  normals: P2[];
  /** Perfil fechado (bolo com furo) ou aberto do eixo até o eixo (redondo). */
  closed: boolean;
  ring: boolean;
  height: number;
  spongeTop: number;
  displace: (r: number, y: number, nr: number, ny: number, phi: number) => P2;
  topRange: [number, number];
  glazeFrom: number;
  glazeTo: number;
}

const noDisplace = (r: number, y: number): P2 => [r, y];

function bundtSpec(): LatheSpec {
  const ri = 0.3;
  const ro = 1.0;
  const raw: P2[] = [
    [ri + 0.05, 0],
    [0.65, 0],
    ...arc(ro - 0.05, 0.05, 0.05, 0.05, -Math.PI / 2, 0, 4),
    [ro - 0.015, 0.25],
    ...arc(ro - 0.27, 0.42, 0.25, 0.34, 0, Math.PI / 2, 14),
    [0.6, 0.775],
    ...arc(ri + 0.16, 0.58, 0.16, 0.19, Math.PI / 2, Math.PI, 10),
    [ri + 0.005, 0.3],
    ...arc(ri + 0.05, 0.05, 0.05, 0.05, Math.PI, Math.PI * 1.5, 4),
  ];
  const profile = resample(dedupe(raw), 0.026, true);
  const normals = profileNormals(profile, true);
  const FLUTES = 12;
  const displace = (r: number, y: number, nr: number, ny: number, phi: number): P2 => {
    const k = Math.cos(phi * FLUTES);
    const w = smoothstep(0.44, 0.66, r) * smoothstep(0.02, 0.22, y);
    const d = 0.036 * k * w;
    return [r + nr * d, y + ny * d];
  };
  const glazeFrom = profile.findIndex(([r, y]) => r > 0.8 && y >= 0.44);
  const glazeTo = profile.findIndex(([r, y], i) => i > glazeFrom && r < 0.5 && y <= 0.5);
  return {
    profile,
    normals,
    closed: true,
    ring: true,
    height: 0.775,
    spongeTop: 1,
    displace,
    topRange: [0.44, 0.86],
    glazeFrom,
    glazeTo,
  };
}

function roundSpec(height: number, spongeTop?: number): LatheSpec {
  const R = 0.95;
  const raw: P2[] = [
    [0, 0],
    [R - 0.05, 0],
    ...arc(R - 0.05, 0.05, 0.05, 0.05, -Math.PI / 2, 0, 4),
    [R, height - 0.09],
    ...arc(R - 0.09, height - 0.09, 0.09, 0.09, 0, Math.PI / 2, 9),
    [0.45, height + 0.008],
    [0, height + 0.012],
  ];
  const profile = resample(dedupe(raw), 0.026, false);
  const normals = profileNormals(profile, false);
  const glazeFrom = profile.findIndex(([r, y]) => r > 0.8 && y >= height - 0.22);
  return {
    profile,
    normals,
    closed: false,
    ring: false,
    height,
    spongeTop: spongeTop ?? 10,
    displace: noDisplace,
    topRange: [0.04, R - 0.08],
    glazeFrom,
    glazeTo: profile.length - 1,
  };
}

/* ── Geometria de revolução com deslocamento por ângulo ── */

type PointAt = (j: number, phi: number) => P2;

function latheGeometry(
  n: number,
  pointAt: PointAt,
  closed: boolean,
  phiStart: number,
  phiLength: number,
  segs: number,
  colorAt?: (r: number, y: number) => THREE.Color,
) {
  const cols = closed ? n + 1 : n;
  const count = (segs + 1) * cols;
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const col = colorAt ? new Float32Array(count * 3) : null;
  for (let i = 0; i <= segs; i++) {
    const phi = phiStart + (phiLength * i) / segs;
    const s = Math.sin(phi);
    const c = Math.cos(phi);
    let acc = 0;
    let pr = 0;
    let py = 0;
    for (let jj = 0; jj < cols; jj++) {
      const [r, y] = pointAt(jj % n, phi);
      if (jj > 0) acc += Math.hypot(r - pr, y - py);
      pr = r;
      py = y;
      const k = i * cols + jj;
      pos[k * 3] = r * s;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = r * c;
      uv[k * 2] = (phi / TAU) * 5;
      uv[k * 2 + 1] = acc * 2.2;
      if (col && colorAt) {
        const cc = colorAt(r, y);
        col[k * 3] = cc.r;
        col[k * 3 + 1] = cc.g;
        col[k * 3 + 2] = cc.b;
      }
    }
  }
  const index: number[] = [];
  for (let i = 0; i < segs; i++) {
    for (let jj = 0; jj < cols - 1; jj++) {
      const a = i * cols + jj;
      const b = (i + 1) * cols + jj;
      const cI = (i + 1) * cols + jj + 1;
      const d = i * cols + jj + 1;
      index.push(a, b, d, b, cI, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/** Face plana do corte, na posição angular phi. UV = (r, y) para casar com a textura do miolo. */
function cutFace(n: number, pointAt: PointAt, phi: number) {
  const pts: P2[] = [];
  for (let j = 0; j < n; j++) pts.push(pointAt(j, phi));
  const clean = dedupe(pts, 1e-4).map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
  const geo = new THREE.ShapeGeometry(new THREE.Shape(clean));
  geo.rotateY(phi - Math.PI / 2);
  return geo;
}

function sampleProfile(spec: LatheSpec, f: number): [number, number, number, number] {
  const n = spec.profile.length;
  const fc = clamp(f, 0, n - 1);
  const i = Math.floor(fc);
  const t = fc - i;
  const a = spec.profile[i];
  const b = spec.profile[Math.min(n - 1, i + 1)];
  const na = spec.normals[i];
  const nb = spec.normals[Math.min(n - 1, i + 1)];
  const nr = lerp(na[0], nb[0], t);
  const ny = lerp(na[1], nb[1], t);
  const l = Math.hypot(nr, ny) || 1;
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), nr / l, ny / l];
}

/* ── Materiais ── */

function bodyMaterial(kit: CakeKit) {
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    map: kit.crust,
    bumpMap: kit.crust,
    bumpScale: 0.7,
    roughness: 0.84,
  });
}

function glazeMaterial(color: string, side: THREE.Side = THREE.FrontSide) {
  const c = new THREE.Color(color);
  const dark = c.getHSL({ h: 0, s: 0, l: 0 }).l < 0.25;
  return new THREE.MeshPhysicalMaterial({
    color: c,
    roughness: dark ? 0.2 : 0.32,
    clearcoat: dark ? 1 : 0.5,
    clearcoatRoughness: 0.18,
    side,
  });
}

/* ── Instâncias (confeitos, coco ralado, raspas…) ── */

interface Placement {
  p: THREE.Vector3;
  n: THREE.Vector3;
}

const dummy = new THREE.Object3D();
const qAlign = new THREE.Quaternion();
const qSpin = new THREE.Quaternion();

function scatter(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  count: number,
  sample: () => Placement | null,
  rng: Rng,
  opts: { colors?: string[]; lift?: number; tilt?: number; scale?: [number, number] } = {},
) {
  if (count <= 0) return null;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const color = new THREE.Color();
  let k = 0;
  for (let i = 0; i < count * 2 && k < count; i++) {
    const s = sample();
    if (!s) continue;
    qAlign.setFromUnitVectors(Y_AXIS, s.n);
    qSpin.setFromAxisAngle(Y_AXIS, rng() * TAU);
    dummy.quaternion.copy(qAlign).multiply(qSpin);
    if (opts.tilt) dummy.rotateX((rng() - 0.5) * opts.tilt);
    dummy.position.copy(s.p).addScaledVector(s.n, opts.lift ?? 0);
    const [s0, s1] = opts.scale ?? [1, 1];
    dummy.scale.setScalar(lerp(s0, s1, rng()));
    dummy.updateMatrix();
    mesh.setMatrixAt(k, dummy.matrix);
    if (opts.colors) {
      color.set(opts.colors[Math.floor(rng() * opts.colors.length)]);
      mesh.setColorAt(k, color);
    }
    k++;
  }
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/* ── Bolos de revolução (com furo / redondo) ── */

interface SectorCtx {
  spec: LatheSpec;
  look: CakeLook;
  kit: CakeKit;
  rng: Rng;
  bodyMat: THREE.Material;
  faceMat: THREE.Material;
  glazeMat?: THREE.Material;
  glazeFaceMat?: THREE.Material;
}

function glazeWave(phi: number) {
  return 0.5 + 0.5 * (0.6 * Math.sin(phi * 5 + 1.3) + 0.4 * Math.sin(phi * 11 + 0.4));
}

function latheSector(ctx: SectorCtx, phiStart: number, phiLength: number, segs: number) {
  const { spec, look, rng } = ctx;
  const g = new THREE.Group();
  const n = spec.profile.length;
  const full = phiLength >= TAU - 1e-3;
  const frac = phiLength / TAU;

  /* Massa */
  const crust = new THREE.Color(look.crust);
  const crustTop = crust.clone().lerp(new THREE.Color('#2a1608'), spec.ring ? 0.2 : 0.12);
  const mousse = look.mousse ? new THREE.Color(look.mousse) : null;
  const tmp = new THREE.Color();
  const colorAt = (_r: number, y: number) => {
    if (mousse && y > spec.spongeTop) return mousse;
    return tmp.copy(crust).lerp(crustTop, smoothstep(spec.height * 0.55, spec.height, y));
  };
  const bodyAt: PointAt = (j, phi) => {
    const [r, y] = spec.profile[j];
    const [nr, ny] = spec.normals[j];
    return spec.displace(r, y, nr, ny, phi);
  };
  const body = new THREE.Mesh(latheGeometry(n, bodyAt, spec.closed, phiStart, phiLength, segs, colorAt), ctx.bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  if (!full) {
    const faces = mergeGeometries([cutFace(n, bodyAt, phiStart), cutFace(n, bodyAt, phiStart + phiLength)]);
    const face = new THREE.Mesh(faces, ctx.faceMat);
    face.receiveShadow = true;
    face.castShadow = true;
    g.add(face);
  }

  /* Cobertura */
  const glaze = look.glaze;
  if (glaze && ctx.glazeMat) {
    const m = spec.glazeTo - spec.glazeFrom + 1;
    const A = (phi: number) => Math.max(1, spec.glazeFrom - glaze.drips * 6 * glazeWave(phi));
    const B = (phi: number) =>
      spec.ring ? Math.min(n - 2, spec.glazeTo + glaze.drips * 4 * glazeWave(phi * 1.7 + 2)) : spec.glazeTo;
    const taper = (j: number) => 0.3 + 0.7 * smoothstep(0, 4, Math.min(j, spec.ring ? m - 1 - j : 99));
    const glazeAt: PointAt = (k, phi) => {
      const outer = k < m;
      const j = outer ? k : 2 * m - 1 - k;
      const f = lerp(A(phi), B(phi), j / (m - 1));
      const [br, by, nr, ny] = sampleProfile(spec, f);
      const [dr, dy] = spec.displace(br, by, nr, ny, phi);
      const t = outer ? GLAZE_T * taper(j) : -0.004;
      return [dr + nr * t, dy + ny * t];
    };
    const shell = new THREE.Mesh(latheGeometry(2 * m, glazeAt, true, phiStart, phiLength, segs), ctx.glazeMat);
    shell.castShadow = true;
    shell.receiveShadow = true;
    g.add(shell);
    if (!full && ctx.glazeFaceMat) {
      const gf = mergeGeometries([cutFace(2 * m, glazeAt, phiStart), cutFace(2 * m, glazeAt, phiStart + phiLength)]);
      g.add(new THREE.Mesh(gf, ctx.glazeFaceMat));
    }

    /* Escorridos */
    const drips: THREE.BufferGeometry[] = [];
    const addDrip = (phi: number, inner: boolean) => {
      const f = inner ? B(phi) : A(phi);
      const [br, by, nr, ny] = sampleProfile(spec, f);
      const [, topY] = spec.displace(br, by, nr, ny, phi);
      const rad = 0.026 + rng() * 0.018;
      let L = (0.05 + rng() * (inner ? 0.12 : 0.24)) * glaze.drips;
      L = Math.min(L, topY - rad - 0.06);
      if (L < 0.03) return;
      const cy = topY - L / 2 - rad * 0.2;
      const wallR = inner
        ? polyXAt(spec.profile, cy, 'min', (x) => x < 0.6)
        : polyXAt(spec.profile, cy, 'max', (x) => x > 0.6);
      const [wr] = spec.displace(wallR, cy, inner ? -1 : 1, 0, phi);
      const geo = new THREE.CapsuleGeometry(rad, L, 4, 10);
      geo.scale(1, 1, 0.55);
      const r = wr + (inner ? -rad * 0.35 : rad * 0.35);
      const mtx = new THREE.Matrix4()
        .makeRotationY(phi)
        .setPosition(r * Math.sin(phi), cy, r * Math.cos(phi));
      geo.applyMatrix4(mtx);
      drips.push(geo);
    };
    const margin = 0.06;
    const outerCount = Math.round(30 * glaze.drips * frac);
    for (let i = 0; i < outerCount; i++) {
      const phi = phiStart + margin + rng() * (phiLength - margin * 2);
      if (glazeWave(phi) > 0.35 || rng() > 0.6) addDrip(phi, false);
    }
    if (spec.ring) {
      const innerCount = Math.round(10 * glaze.drips * frac);
      for (let i = 0; i < innerCount; i++) addDrip(phiStart + margin + rng() * (phiLength - margin * 2), true);
    }
    if (drips.length) {
      const merged = mergeGeometries(drips);
      const dm = new THREE.Mesh(merged, ctx.glazeMat);
      dm.castShadow = true;
      g.add(dm);
    }
  }

  /* Superfície do topo para os confeitos */
  const off = glaze ? GLAZE_T : 0;
  const rawTop = (r: number, phi: number) => {
    const y = polyTopY(spec.profile, r);
    const dy = (polyTopY(spec.profile, r + 0.01) - polyTopY(spec.profile, r - 0.01)) / 0.02;
    const l = Math.hypot(dy, 1);
    const nr = -dy / l;
    const ny = 1 / l;
    const [dr, dyy] = spec.displace(r, y, nr, ny, phi);
    const rr = dr + nr * off;
    return new THREE.Vector3(rr * Math.sin(phi), dyy + ny * off, rr * Math.cos(phi));
  };
  const topAt = (r: number, phi: number): Placement => {
    const p = rawTop(r, phi);
    const e = 0.012;
    const tr = rawTop(r + e, phi).sub(rawTop(r - e, phi));
    const tp = rawTop(r, phi + e / Math.max(r, 0.1)).sub(rawTop(r, phi - e / Math.max(r, 0.1)));
    const nrm = new THREE.Vector3().crossVectors(tp, tr).normalize();
    if (nrm.y < 0) nrm.negate();
    return { p, n: nrm };
  };
  const [r0, r1] = spec.topRange;
  const sampleTop = (pad = 0.04, range: [number, number] = [r0, r1]): Placement | null => {
    const r = Math.sqrt(lerp(range[0] ** 2, range[1] ** 2, rng()));
    const m = pad / Math.max(r, 0.15);
    if (phiLength - m * 2 <= 0) return null;
    const phi = phiStart + m + rng() * (phiLength - m * 2);
    return topAt(r, phi);
  };

  addToppings(g, ctx, frac, sampleTop, topAt, phiStart, phiLength);

  /* Coco ralado cobrindo tudo */
  if (look.coconutCoat) {
    const shred = new THREE.BoxGeometry(0.009, 0.007, 0.075);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    const colors = ['#ffffff', '#fbf6ea', '#f4ecda', '#fffdf6'];
    const top = scatter(shred, mat, Math.round(1500 * frac), () => sampleTop(0.03, [0.02, 0.93]), rng, {
      colors,
      tilt: 1.2,
      lift: 0.012,
      scale: [0.7, 1.3],
    });
    const sideSample = (): Placement | null => {
      const y = 0.05 + rng() * (spec.height - 0.08);
      const r = polyXAt(spec.profile, y, 'max');
      const m = 0.03 / r;
      const phi = phiStart + m + rng() * (phiLength - m * 2);
      return {
        p: new THREE.Vector3((r + 0.008) * Math.sin(phi), y, (r + 0.008) * Math.cos(phi)),
        n: new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi)),
      };
    };
    const side = scatter(shred, mat, Math.round(1300 * frac), sideSample, rng, { colors, tilt: 1.4, scale: [0.7, 1.3] });
    if (top) g.add(top);
    if (side) g.add(side);
  }

  return g;
}

function addToppings(
  g: THREE.Group,
  ctx: SectorCtx,
  frac: number,
  sampleTop: (pad?: number, range?: [number, number]) => Placement | null,
  topAt: (r: number, phi: number) => Placement,
  phiStart: number,
  phiLength: number,
) {
  const { look, kit, rng } = ctx;
  const t = look.topping;
  const add = (o: THREE.Object3D | null) => o && g.add(o);
  const sampler = (pad?: number, range?: [number, number]) => () => sampleTop(pad, range);

  switch (t.kind) {
    case 'sprinkles': {
      const geo = new THREE.CapsuleGeometry(0.011, 0.04, 2, 6).rotateZ(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.45 });
      const base = new THREE.Color(t.color);
      const colors = [0, 0.08, 0.16].map((k) => '#' + base.clone().lerp(new THREE.Color('#6b4130'), k).getHexString());
      add(scatter(geo, mat, Math.round(620 * frac), sampler(0.03), rng, { colors, lift: 0.006, tilt: 0.4 }));
      break;
    }
    case 'sugar': {
      const geo = new THREE.BoxGeometry(0.012, 0.012, 0.012);
      const mat = new THREE.MeshStandardMaterial({ color: '#fffaf2', roughness: 0.4 });
      add(scatter(geo, mat, Math.round(380 * frac), sampler(0.02), rng, { lift: 0.003, scale: [0.6, 1.2] }));
      break;
    }
    case 'cinnamon-sugar': {
      const geo = new THREE.BoxGeometry(0.011, 0.011, 0.011);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
      const colors = ['#e8c99a', '#8a5a30', '#f5ead8', '#b07a45'];
      add(scatter(geo, mat, Math.round(900 * frac), sampler(0.02), rng, { colors, lift: 0.004, scale: [0.6, 1.3] }));
      break;
    }
    case 'zest': {
      const geo = new THREE.BoxGeometry(0.024, 0.006, 0.008);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.5 });
      add(
        scatter(geo, mat, Math.round(220 * frac), sampler(0.02), rng, {
          colors: ['#7aa82c', '#a6c94a', '#5f8c22'],
          lift: 0.005,
          tilt: 0.3,
        }),
      );
      break;
    }
    case 'chips': {
      const geo = new THREE.ConeGeometry(0.03, 0.045, 10).translate(0, 0.012, 0);
      const mat = new THREE.MeshStandardMaterial({ color: '#3a2117', roughness: 0.45 });
      add(scatter(geo, mat, Math.round(60 * frac), sampler(0.04), rng, { tilt: 0.3, scale: [0.8, 1.2] }));
      break;
    }
    case 'goiabada': {
      const geo = new RoundedBoxGeometry(0.075, 0.05, 0.065, 2, 0.015);
      const mat = new THREE.MeshPhysicalMaterial({ color: '#a8182f', roughness: 0.28, clearcoat: 0.6 });
      add(scatter(geo, mat, Math.round(16 * frac), sampler(0.06), rng, { lift: 0.006, tilt: 0.5, scale: [0.8, 1.25] }));
      break;
    }
    case 'toasted-coconut': {
      const geo = new THREE.BoxGeometry(0.05, 0.006, 0.026);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
      const colors = ['#c58a45', '#e2b46e', '#9a6230', '#f0d7a4', '#b5763a'];
      add(scatter(geo, mat, Math.round(560 * frac), sampler(0.03), rng, { colors, lift: 0.01, tilt: 1, scale: [0.7, 1.3] }));
      break;
    }
    case 'citrus':
    case 'lime': {
      const lime = t.kind === 'lime';
      const peel = lime ? '#5c9a2c' : t.color;
      const flesh = lime ? '#cfe38a' : '#fbb44a';
      const tex = kit.citrusTex(peel, flesh);
      const faceMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.6 });
      const sideMat = new THREE.MeshStandardMaterial({ color: peel, roughness: 0.5 });
      const geo = new THREE.CylinderGeometry(0.16, 0.16, 0.026, 36);
      const count = lime ? 6 : 7;
      const r = lime ? 0.64 : 0.6;
      for (let i = 0; i < count; i++) {
        const phi = (i / count) * TAU + 0.3;
        const rel = (((phi - phiStart) % TAU) + TAU) % TAU;
        const m = 0.2 / r;
        if (rel < m || rel > phiLength - m) continue;
        const s = topAt(r, phi);
        const mesh = new THREE.Mesh(geo, [sideMat, faceMat, faceMat]);
        const radial = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
        const n = new THREE.Vector3(0, 1, 0).addScaledVector(radial, 0.25).normalize();
        mesh.quaternion.setFromUnitVectors(Y_AXIS, n);
        mesh.rotateY(rng() * TAU);
        mesh.position.copy(s.p).addScaledVector(n, 0.03);
        mesh.castShadow = true;
        g.add(mesh);
      }
      if (lime) {
        const zg = new THREE.BoxGeometry(0.024, 0.006, 0.008);
        const zm = new THREE.MeshStandardMaterial({ roughness: 0.5 });
        add(scatter(zg, zm, Math.round(160 * frac), sampler(0.02, [0.04, 0.45]), rng, { colors: ['#7aa82c', '#a6c94a'], lift: 0.005 }));
      }
      break;
    }
    default:
      break;
  }
}

/* ── Bolo de forma (retangular) ── */

function loafShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.4, 0);
  s.lineTo(0.4, 0);
  s.quadraticCurveTo(0.46, 0, 0.465, 0.06);
  s.lineTo(0.49, 0.47);
  s.quadraticCurveTo(0.5, 0.55, 0.43, 0.58);
  s.bezierCurveTo(0.3, 0.75, -0.3, 0.75, -0.43, 0.58);
  s.quadraticCurveTo(-0.5, 0.55, -0.49, 0.47);
  s.lineTo(-0.465, 0.06);
  s.quadraticCurveTo(-0.46, 0, -0.4, 0);
  return s;
}

function loafPiece(
  look: CakeLook,
  kit: CakeKit,
  rng: Rng,
  x0: number,
  len: number,
  faceMat: THREE.Material,
  bodyMat: THREE.Material,
  endMat: THREE.Material | null,
) {
  const g = new THREE.Group();
  const shape = loafShape();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: len,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.018,
    bevelSegments: 3,
    curveSegments: 18,
  });
  geo.rotateY(Math.PI / 2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  geo.translate(x0 - bb.min.x, 0, 0);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const crust = new THREE.Color(look.crust);
  const top = crust.clone().lerp(new THREE.Color('#2a1608'), 0.22);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.copy(crust).lerp(top, smoothstep(0.42, 0.72, pos.getY(i)));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geo, [faceMat, bodyMat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);

  if (endMat) {
    const end = new THREE.ShapeGeometry(shape, 18);
    end.rotateY(Math.PI / 2);
    end.translate(x0 - 0.0015, 0, 0);
    g.add(new THREE.Mesh(end, endMat));
  }

  /* Topo */
  const pts = shape.getPoints(24).map((v) => [v.x, v.y] as P2);
  const xs = x0 + 0.06;
  const xe = x0 + len - 0.04;
  const topAt = (x: number, z: number): Placement => {
    const y = polyTopY(pts, -z);
    const dy = (polyTopY(pts, -z + 0.01) - polyTopY(pts, -z - 0.01)) / 0.02;
    const n = new THREE.Vector3(0, 1, dy).normalize();
    return { p: new THREE.Vector3(x, y, z), n };
  };
  const sampleTop = () => topAt(lerp(xs, xe, rng()), (rng() - 0.5) * 0.74);

  switch (look.topping.kind) {
    case 'banana': {
      const tex = kit.bananaTex();
      const face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.3, clearcoat: 0.7 });
      const side = new THREE.MeshStandardMaterial({ color: '#c98b42', roughness: 0.5 });
      const sg = new THREE.CylinderGeometry(0.085, 0.085, 0.024, 28);
      for (let x = xs + 0.06; x < xe - 0.02; x += 0.2) {
        const s = topAt(x, (rng() - 0.5) * 0.06);
        const m = new THREE.Mesh(sg, [side, face, face]);
        m.quaternion.setFromUnitVectors(Y_AXIS, s.n);
        m.rotateX((rng() - 0.5) * 0.4);
        m.position.copy(s.p).addScaledVector(s.n, 0.012);
        m.castShadow = true;
        g.add(m);
      }
      const dust = scatter(
        new THREE.BoxGeometry(0.01, 0.01, 0.01),
        new THREE.MeshStandardMaterial({ roughness: 0.7 }),
        Math.round(len * 300),
        sampleTop,
        rng,
        { colors: ['#7a4a22', '#9a6232', '#5a3418'], lift: 0.004 },
      );
      if (dust) g.add(dust);
      break;
    }
    case 'apple': {
      const skin = new THREE.MeshStandardMaterial({ color: '#b8322a', roughness: 0.4 });
      const flesh = new THREE.MeshPhysicalMaterial({ color: '#efdca6', roughness: 0.3, clearcoat: 0.6 });
      const ag = new THREE.CylinderGeometry(0.12, 0.12, 0.018, 24, 1, false, 0, Math.PI);
      for (let x = xs + 0.05; x < xe - 0.02; x += 0.11) {
        for (const z of [-0.13, 0.13]) {
          const s = topAt(x, z);
          const m = new THREE.Mesh(ag, [skin, flesh, flesh]);
          m.quaternion.setFromUnitVectors(Y_AXIS, s.n);
          m.rotateY(z > 0 ? Math.PI / 2 : -Math.PI / 2);
          m.rotateX(0.35);
          m.position.copy(s.p).addScaledVector(s.n, 0.02);
          m.castShadow = true;
          g.add(m);
        }
      }
      break;
    }
    case 'toasted-coconut': {
      const flakes = scatter(
        new THREE.BoxGeometry(0.05, 0.006, 0.026),
        new THREE.MeshStandardMaterial({ roughness: 0.7 }),
        Math.round(len * 380),
        sampleTop,
        rng,
        { colors: ['#c58a45', '#e2b46e', '#9a6230', '#f0d7a4'], lift: 0.01, tilt: 1, scale: [0.7, 1.3] },
      );
      if (flakes) g.add(flakes);
      break;
    }
    default:
      break;
  }
  return g;
}

/* ── Montagem ── */

/** Ângulo (rad) onde fica a fatia cortada: levemente à direita de quem olha. */
export const SLICE_CENTER = 0.5;
const SLICE_GAP = 0.78;

export function buildCake(id: string, look: CakeLook, kit: CakeKit) {
  const rng = mulberry32(hashString(id));
  const root = new THREE.Group();
  root.name = id;

  if (look.shape === 'loaf') {
    const outline = loafShape()
      .getPoints(24)
      .map((v) => [v.x, v.y] as P2);
    const faceTex = kit.keep(
      crumbFaceTexture(
        { crumb: look.crumb, crust: look.crust, inclusion: look.inclusion, outline, domain: { x0: -0.6, x1: 0.6, y0: 0, y1: 1.2 } },
        rng,
      ),
    );
    faceTex.repeat.set(1 / 1.2, 1 / 1.2);
    faceTex.offset.set(0.5, 0);
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, bumpMap: faceTex, bumpScale: 2, roughness: 0.95 });
    const crustTex = kit.keep(kit.crust.clone());
    crustTex.repeat.set(2.5, 2.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: crustTex,
      bumpMap: crustTex,
      bumpScale: 0.7,
      roughness: 0.84,
    });
    const endMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(look.crust).lerp(new THREE.Color('#2a1608'), 0.1),
      map: crustTex,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    const main = loafPiece(look, kit, rng, -0.95, 1.3, faceMat, bodyMat, endMat);
    const slice = loafPiece(look, kit, rng, 0.52, 0.2, faceMat, bodyMat, null);
    slice.position.set(0.1, 0, 0.04);
    slice.rotation.y = -0.12;
    root.add(main, slice);
    root.rotation.y = -0.55;
    root.position.x = 0.08;
    return root;
  }

  const spec = look.shape === 'bundt' ? bundtSpec() : roundSpec(look.mousse ? 0.84 : 0.62, look.mousse ? 0.6 : undefined);
  const faceTex = kit.keep(
    crumbFaceTexture(
      {
        crumb: look.crumb,
        crust: look.coconutCoat ? '#f4ead2' : look.crust,
        inclusion: look.inclusion,
        mousse: look.mousse ? { from: spec.spongeTop, color: look.mousse } : undefined,
        outline: spec.profile,
        domain: { x0: 0, x1: 1.2, y0: 0, y1: 1.2 },
      },
      rng,
    ),
  );
  faceTex.repeat.set(1 / 1.2, 1 / 1.2);

  const ctx: SectorCtx = {
    spec,
    look,
    kit,
    rng,
    bodyMat: bodyMaterial(kit),
    faceMat: new THREE.MeshStandardMaterial({
      map: faceTex,
      bumpMap: faceTex,
      bumpScale: 2,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
    glazeMat: look.glaze ? glazeMaterial(look.glaze.color) : undefined,
    glazeFaceMat: look.glaze ? glazeMaterial(look.glaze.color, THREE.DoubleSide) : undefined,
  };

  const main = latheSector(ctx, SLICE_CENTER + SLICE_GAP / 2, TAU - SLICE_GAP, 132);
  const slice = latheSector(ctx, SLICE_CENTER - SLICE_GAP / 2, SLICE_GAP, 18);
  const push = 0.34;
  slice.position.set(Math.sin(SLICE_CENTER) * push, 0, Math.cos(SLICE_CENTER) * push);
  root.add(main, slice);
  return root;
}

/** Libera geometrias e materiais de um bolo (as texturas ficam no kit). */
export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const m = mesh.material;
    if (Array.isArray(m)) m.forEach((x) => x.dispose());
    else if (m) m.dispose();
  });
}
