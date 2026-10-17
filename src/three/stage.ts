import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildCake, CakeKit, disposeObject } from './cakeFactory';
import { clamp, easeInCubic, easeOutCubic, lerp } from './math';
import type { CakeLook } from './types';

export type StageMode = 'hero' | 'menu';

export interface StageOptions {
  mode: StageMode;
  reducedMotion: boolean;
  /** Atraso (ms) antes do primeiro bolo cair no prato. */
  introDelay?: number;
  onReady?: () => void;
}

interface Entry {
  id: string;
  wrap: THREE.Group;
  t: number;
  dir: 'in' | 'out';
}

const PLATE_TOP = 0.05;
const FALL_FROM = 1.7;

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Palco 3D: prato, luzes, câmera e um bolo que gira no prato. */
export class CakeStage {
  private host: HTMLElement;
  private opts: StageOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
  private turntable = new THREE.Group();
  private kit = new CakeKit();
  private cache = new Map<string, THREE.Group>();
  private entries: Entry[] = [];
  private currentId: string | null = null;
  private extras: THREE.Object3D[] = [];
  private hearts: { mesh: THREE.Mesh; base: THREE.Vector3; phase: number }[] = [];

  private target = new THREE.Vector3(0, 0.36, 0);
  private elevation = 0.43;
  private dist = 6;
  private margin: number;
  private subjectRadius = 1.58;

  private running = false;
  private visible = false;
  private raf = 0;
  private last = 0;
  private time = 0;
  private readyFired = false;

  private dragging = false;
  private lastX = 0;
  private lastMoveT = 0;
  private velocity = 0;
  private lastInteract = -10;
  private auto = 0;
  private pointer = new THREE.Vector2();
  private parallax = new THREE.Vector2();

  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private idleHandle = 0;

  constructor(host: HTMLElement, opts: StageOptions) {
    this.host = host;
    this.opts = opts;
    this.margin = 0.94;

    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    r.setClearColor(0x000000, 0);
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.04;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.domElement.className = 'cake-canvas';
    host.appendChild(r.domElement);
    this.renderer = r;

    const pmrem = new THREE.PMREMGenerator(r);
    const room = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(room, 0.04).texture;
    this.scene.environmentIntensity = 0.5;
    room.dispose();
    pmrem.dispose();

    this.setupLights();
    this.scene.add(this.turntable);
    this.turntable.add(this.makePlate());
    if (opts.mode === 'hero') this.makeHearts();

    this.fit();
    this.ro = new ResizeObserver(() => {
      this.fit();
      if (!this.running) this.render();
    });
    this.ro.observe(host);
    this.io = new IntersectionObserver(
      ([e]) => {
        this.visible = e.isIntersecting;
        this.updateRunning();
      },
      { rootMargin: '120px' },
    );
    this.io.observe(host);

    const el = r.domElement;
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onUp);
    host.addEventListener('keydown', this.onKey);
    document.addEventListener('visibilitychange', this.updateRunning);
    if (opts.mode === 'hero') window.addEventListener('pointermove', this.onWindowPointer, { passive: true });
  }

  /* ── API ── */

  setCake(id: string, look: CakeLook) {
    if (id === this.currentId) return;
    const first = this.currentId === null;
    this.currentId = id;

    for (const e of this.entries) if (e.dir === 'in') this.flip(e);

    const cake = this.getCake(id, look);
    const wrap = new THREE.Group();
    wrap.add(cake);
    wrap.position.y = PLATE_TOP;
    this.turntable.add(wrap);
    const delay = first && this.opts.introDelay ? -this.opts.introDelay / 1000 : 0;
    const entry: Entry = { id, wrap, t: this.opts.reducedMotion ? 1 : delay, dir: 'in' };
    this.entries.push(entry);
    if (this.opts.reducedMotion) {
      this.entries = this.entries.filter((e) => {
        if (e.dir === 'out') this.turntable.remove(e.wrap);
        return e.dir === 'in' && e === entry;
      });
    }
    this.applyEntry(entry);
    if (!this.running) this.render();
  }

  /** Monta os outros bolos aos poucos, quando o navegador estiver ocioso. */
  prewarm(list: { id: string; look: CakeLook }[]) {
    const queue = list.filter((c) => !this.cache.has(c.id));
    const ric: (cb: () => void) => number =
      'requestIdleCallback' in window
        ? (cb) => window.requestIdleCallback(cb, { timeout: 1500 })
        : (cb) => window.setTimeout(cb, 120);
    const step = () => {
      const next = queue.shift();
      if (!next || !this.renderer) return;
      this.getCake(next.id, next.look);
      this.idleHandle = ric(step);
    };
    this.idleHandle = ric(step);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    if ('cancelIdleCallback' in window) window.cancelIdleCallback(this.idleHandle);
    clearTimeout(this.idleHandle);
    this.ro.disconnect();
    this.io.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onDown);
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('pointercancel', this.onUp);
    this.host.removeEventListener('keydown', this.onKey);
    document.removeEventListener('visibilitychange', this.updateRunning);
    window.removeEventListener('pointermove', this.onWindowPointer);
    this.cache.forEach((g) => disposeObject(g));
    this.cache.clear();
    this.extras.forEach((o) => disposeObject(o));
    this.kit.dispose();
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    el.remove();
  }

  /* ── Cena ── */

  private setupLights() {
    const key = new THREE.DirectionalLight('#fff3e8', 2.5);
    key.position.set(2.6, 4.4, 3.1);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const sc = key.shadow.camera;
    sc.left = sc.bottom = -2.4;
    sc.right = sc.top = 2.4;
    sc.near = 1;
    sc.far = 12;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    const fill = new THREE.DirectionalLight('#ffe0e6', 0.75);
    fill.position.set(-3.2, 2, 1.6);
    const rim = new THREE.DirectionalLight('#ffffff', 1.0);
    rim.position.set(-1.2, 3, -3.6);
    const hemi = new THREE.HemisphereLight('#fff7f2', '#d8c0bb', 0.35);
    this.scene.add(key, fill, rim, hemi);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2),
      new THREE.ShadowMaterial({ color: '#5e3a3a', opacity: 0.14 }),
    );
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.extras.push(ground);
  }

  private makePlate() {
    const pts = [
      [0, 0],
      [0.88, 0],
      [0.94, 0.012],
      [1.0, 0.03],
      [1.26, 0.045],
      [1.38, 0.082],
      [1.43, 0.1],
      [1.425, 0.113],
      [1.37, 0.104],
      [1.22, 0.068],
      [0.95, 0.05],
      [0, PLATE_TOP],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const plate = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 128),
      new THREE.MeshPhysicalMaterial({ color: '#fdfaf6', roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
    );
    plate.castShadow = true;
    plate.receiveShadow = true;
    const rimLine = new THREE.Mesh(
      new THREE.TorusGeometry(1.405, 0.01, 8, 160).rotateX(Math.PI / 2),
      new THREE.MeshPhysicalMaterial({ color: '#dc4e70', roughness: 0.3, clearcoat: 0.8 }),
    );
    rimLine.position.y = 0.106;
    const g = new THREE.Group();
    g.add(plate, rimLine);
    this.extras.push(g);
    return g;
  }

  private makeHearts() {
    const s = new THREE.Shape();
    s.moveTo(5, 5);
    s.bezierCurveTo(5, 5, 4, 0, 0, 0);
    s.bezierCurveTo(-6, 0, -6, 7, -6, 7);
    s.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
    s.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
    s.bezierCurveTo(16, 7, 16, 0, 10, 0);
    s.bezierCurveTo(7, 0, 5, 5, 5, 5);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 4,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.6,
      bevelSegments: 5,
      curveSegments: 20,
    });
    geo.center();
    geo.rotateZ(Math.PI);
    geo.scale(0.011, 0.011, 0.011);
    const mat = new THREE.MeshPhysicalMaterial({ color: '#dc4e70', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
    const spots: [number, number, number, number][] = [
      [-1.75, 1.35, -0.4, 1],
      [1.85, 0.95, -0.2, 0.75],
      [-1.45, 0.5, 0.9, 0.6],
      [1.35, 1.75, -1.1, 0.55],
    ];
    const group = new THREE.Group();
    spots.forEach(([x, y, z, sc], i) => {
      const m = new THREE.Mesh(geo, mat);
      m.scale.setScalar(sc);
      m.position.set(x, y, z);
      group.add(m);
      this.hearts.push({ mesh: m, base: new THREE.Vector3(x, y, z), phase: i * 1.7 });
    });
    this.scene.add(group);
    this.extras.push(group);
  }

  private getCake(id: string, look: CakeLook) {
    let g = this.cache.get(id);
    if (!g) {
      g = buildCake(id, look, this.kit);
      this.cache.set(id, g);
    }
    return g;
  }

  /* ── Animação ── */

  private flip(e: Entry) {
    e.dir = 'out';
    e.t = 0;
  }

  private applyEntry(e: Entry) {
    const w = e.wrap;
    if (e.dir === 'in') {
      if (e.t < 0) {
        w.visible = false;
        return;
      }
      w.visible = true;
      const fall = clamp(e.t / 0.55, 0, 1);
      w.position.y = PLATE_TOP + FALL_FROM * (1 - fall * fall);
      w.rotation.y = -1.1 * (1 - easeOutCubic(clamp(e.t / 0.9, 0, 1)));
      const q = clamp((e.t - 0.55) / 0.4, 0, 1);
      const squash = q > 0 && q < 1 ? Math.sin(q * Math.PI) * (1 - q) : 0;
      w.scale.set(1 + 0.06 * squash, 1 - 0.1 * squash, 1 + 0.06 * squash);
    } else {
      const p = clamp(e.t / 0.3, 0, 1);
      const s = Math.max(0.001, 1 - easeInCubic(p));
      w.scale.setScalar(s);
      w.position.y = PLATE_TOP + 0.25 * p;
      w.rotation.y += 0.04;
    }
  }

  private update(dt: number) {
    this.time += dt;
    const now = this.time;

    for (const e of this.entries) {
      e.t += dt;
      this.applyEntry(e);
    }
    this.entries = this.entries.filter((e) => {
      if (e.dir === 'out' && e.t > 0.3) {
        this.turntable.remove(e.wrap);
        return false;
      }
      return true;
    });

    if (!this.dragging) {
      this.turntable.rotation.y += this.velocity * dt;
      this.velocity *= Math.exp(-dt * 3.2);
      const idle = now - this.lastInteract > 1.6;
      this.auto = lerp(this.auto, idle && !this.opts.reducedMotion ? 1 : 0, 1 - Math.exp(-dt * 1.5));
      this.turntable.rotation.y += this.auto * 0.22 * dt;
    }

    if (this.opts.mode === 'hero' && !this.opts.reducedMotion) {
      this.parallax.lerp(this.pointer, 1 - Math.exp(-dt * 2.5));
      for (const h of this.hearts) {
        h.mesh.position.y = h.base.y + Math.sin(now * 0.9 + h.phase) * 0.08;
        h.mesh.rotation.y = Math.sin(now * 0.6 + h.phase) * 0.6;
        h.mesh.rotation.z = Math.sin(now * 0.7 + h.phase) * 0.15;
      }
    }
    this.placeCamera();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
    if (!this.readyFired && this.entries.some((e) => e.dir === 'in')) {
      this.readyFired = true;
      this.opts.onReady?.();
    }
  }

  private tick = (t: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min((t - this.last) / 1000, 0.05);
    this.last = t;
    this.update(dt);
    this.render();
  };

  private updateRunning = () => {
    const should = this.visible && document.visibilityState === 'visible';
    if (should && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    } else if (!should && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  };

  /* ── Câmera ── */

  private fit() {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Em telas estreitas o prato encostaria nas bordas: afasta um pouco a câmera.
    this.margin = this.opts.mode === 'hero' && this.camera.aspect > 1.15 ? 0.84 : 0.97;
    const v = THREE.MathUtils.degToRad(this.camera.fov);
    const hf = 2 * Math.atan(Math.tan(v / 2) * this.camera.aspect);
    this.dist = (this.subjectRadius / Math.sin(Math.min(v, hf) / 2)) * this.margin;
    this.camera.updateProjectionMatrix();
    this.placeCamera();
  }

  private placeCamera() {
    const el = this.elevation + this.parallax.y * 0.07;
    const az = this.parallax.x * 0.14;
    const c = this.camera;
    c.position.set(
      this.target.x + this.dist * Math.cos(el) * Math.sin(az),
      this.target.y + this.dist * Math.sin(el),
      this.target.z + this.dist * Math.cos(el) * Math.cos(az),
    );
    c.lookAt(this.target);
  }

  /* ── Interação ── */

  private onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastMoveT = performance.now();
    this.velocity = 0;
    this.lastInteract = this.time;
    this.renderer.domElement.setPointerCapture(e.pointerId);
    this.host.classList.add('is-dragging');
  };

  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const now = performance.now();
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    const ang = dx * 0.011;
    this.turntable.rotation.y += ang;
    const dt = Math.max(now - this.lastMoveT, 8) / 1000;
    this.velocity = lerp(this.velocity, ang / dt, 0.5);
    this.lastMoveT = now;
    this.lastInteract = this.time;
    this.auto = 0;
    if (!this.running) this.render();
  };

  private onUp = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.velocity = clamp(this.velocity, -9, 9);
    if (performance.now() - this.lastMoveT > 90) this.velocity = 0;
    this.host.classList.remove('is-dragging');
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    this.velocity += e.key === 'ArrowLeft' ? -2.2 : 2.2;
    this.lastInteract = this.time;
  };

  private onWindowPointer = (e: PointerEvent) => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
}
