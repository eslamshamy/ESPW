/* The playground: a hidden panel behind the side arrow, with four small toys sharing one canvas. */
(() => {
const $ = (s, r = document) => r.querySelector(s), root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
const ar = () => root.lang === 'ar', T = k => I18N[ar() ? 'ar' : 'en'][k];
const pg = $('#pg'), tab = $('#pgTab'), cv = $('#pgC'), c = cv.getContext('2d'), ui = $('#pgUi'), hint = $('#pgHint'), tabs = $('#pgTabs'), glc = $('#pgGL'), hud = $('#pgHud'), msg = $('#pgMsg');
let open = false, cur = 0, w = 0, h = 0, dpr = 1, raf = 0, col = {};
const ptr = { x: -999, y: -999, down: false, sx: 0, sy: 0 };
const readCols = () => { const s = getComputedStyle(root), g = n => s.getPropertyValue(n).trim().split(/\s+/).join(',');
  col = { bg: g('--ink'), fg: g('--bg'), red: g('--red'), blue: g('--blue'), yel: g('--yel') }; col.hot = root.classList.contains('blue') ? col.blue : col.yel; };
const rgb = (k, a = 1) => `rgba(${col[k]},${a})`;
const btn = (key, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pg-btn'; b.textContent = T(key); b.addEventListener('click', fn); ui.appendChild(b); return b; };
const face = () => ar() ? '"Readex Pro"' : 'Archivo';

/* ---------- 1. Dot writer ---------- */
const writer = { P: [], text: '',
  setup() { const inp = document.createElement('input'); inp.className = 'pg-in'; inp.maxLength = 36; inp.placeholder = T('pgType'); inp.value = this.text; inp.setAttribute('aria-label', T('pgType'));
    inp.addEventListener('input', () => { this.text = inp.value; this.build(); }); ui.appendChild(inp); this.build(); },
  build() { if (!w) return; const text = (this.text.trim() || T('pgType')), o = document.createElement('canvas').getContext('2d', { willReadFrequently: true }); o.canvas.width = w; o.canvas.height = h;
    const words = text.split(' '), font = s => `${ar() ? 700 : 800} ${s}px ${face()}, sans-serif`; let best = null;
    for (let L = 1; L <= Math.min(3, words.length); L++) { const tg = text.length / L, lines = []; let cu = '';
      words.forEach(x => { if (cu && lines.length < L - 1 && (cu + ' ' + x).length > tg * 1.08) { lines.push(cu); cu = x; } else cu = cu ? cu + ' ' + x : x; }); lines.push(cu);
      o.font = font(200); const mw = Math.max(...lines.map(l => o.measureText(l).width)), fs = Math.min(200 * w * .84 / mw, h * .6 / (lines.length * 1.15), h * .34); if (!best || fs > best.fs * 1.02) best = { fs, lines }; }
    o.font = font(best.fs); o.textAlign = 'center'; o.textBaseline = 'middle'; o.direction = ar() ? 'rtl' : 'ltr';
    best.lines.forEach((l, i) => o.fillText(l, w / 2, h / 2 + (i - (best.lines.length - 1) / 2) * best.fs * 1.15));
    const g = clamp(best.fs / 24, 2.4, 4), d = o.getImageData(0, 0, w, h).data, tg = []; this.dot = g * .56;
    for (let y = 0; y < h; y += g) for (let x = 0; x < w; x += g) if (d[((y | 0) * w + (x | 0)) * 4 + 3] > 128) tg.push(x, y);
    const n = tg.length / 2, P = this.P; while (P.length < n) P.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, hot: Math.random() < .06 }); P.length = n;
    for (let i = n - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0, a = P[i]; P[i] = P[j]; P[j] = a; }
    P.forEach((p, i) => { p.tx = tg[i * 2]; p.ty = tg[i * 2 + 1]; p.vx += (Math.random() - .5) * 30; p.vy += (Math.random() - .5) * 30; }); },
  frame() { c.fillStyle = rgb('bg'); c.fillRect(0, 0, w, h); const R = 120, s = this.dot;
    for (let pass = 0; pass < 2; pass++) { c.fillStyle = rgb(pass ? 'hot' : 'fg'); for (const p of this.P) { if (p.hot !== !!pass) continue;
      const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy; if (d2 < R * R) { const dd = Math.sqrt(d2) || 1, f = 1 - dd / R; p.vx += dx / dd * f * f * 8; p.vy += dy / dd * f * f * 8; }
      p.vx = (p.vx + (p.tx - p.x) * .05) * .84; p.vy = (p.vy + (p.ty - p.y) * .05) * .84; p.x += p.vx; p.y += p.vy; c.fillRect(p.x, p.y, s, s); } } },
};

/* ---------- 2. Raise the city ---------- */
const city = { cells: null, GN: 17,
  setup() { if (!this.cells) this.reset(); btn('pgReset', () => this.reset()); },
  reset() { let s = 99 + (Math.random() * 1e4 | 0); const r = () => (s = (s * 16807) % 2147483647) / 2147483647, N = this.GN; this.cells = []; this.ripples = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const st = i % 4 === 0 || j % 4 === 0; this.cells.push({ i, j, street: st, b: st || r() < .2 ? 0 : .3 + r() * r() * 1.3, h: 0, ph: r() * 6.28, tower: 0 }); }
    this.cells.sort((a, b) => (a.i + a.j) - (b.i + b.j));
    const lines = [0, 4, 8, 12, 16], cols = ['red', 'blue', 'yel', 'fg'];
    this.cars = Array.from({ length: 16 }, (_, n) => ({ ax: n % 2, line: lines[(n * 3 + (n >> 1)) % 5], pos: r() * N, v: (r() < .5 ? -1 : 1) * (1.3 + r() * 1.7), col: cols[n % 4] })); this.lt = 0; },
  geo() { const s = Math.min(w / (this.GN * 1.9), h / (this.GN * 1.35)); return { s, a: s * .866, b: s * .5, ox: w / 2, oy: h * .5 - this.GN * s * .5 + s * 2 }; },
  down() { const g = this.geo(); let best = null, bd = 1e9; for (const q of this.cells) { if (q.street) continue; const x = (q.i - q.j) * g.a + g.ox, y = (q.i + q.j) * g.b + g.oy + g.b - q.h * .5, d = (x - ptr.x) ** 2 + (y - ptr.y) ** 2; if (d < bd) { bd = d; best = q; } }
    if (best && bd < (g.s * 2.5) ** 2) { best.tower = best.tower ? 0 : 1 + (Math.random() * 3 | 0); this.ripples.push({ x: (best.i - best.j) * g.a + g.ox, y: (best.i + best.j) * g.b + g.oy + g.b, t0: performance.now() / 1000 }); } },
  frame(t) { c.fillStyle = rgb('bg'); c.fillRect(0, 0, w, h); const g = this.geo(), R = Math.min(w, h) * .26, N = this.GN, acc = [0, 'red', 'blue', 'yel']; c.lineWidth = 1; c.lineJoin = 'round';
    const dt = Math.min(.05, t - (this.lt || t)); this.lt = t; this.ripples = this.ripples.filter(r => t - r.t0 < 1.4);
    /* cars drive the streets; each is drawn in the cell it is passing so taller blocks in front can hide it */
    const at = new Map(); for (const k of this.cars) { k.pos += k.v * dt; if (k.pos > N) k.pos = -1; else if (k.pos < -1) k.pos = N;
      const ci = k.ax ? k.pos : k.line, cj = k.ax ? k.line : k.pos, ri = Math.round(ci), rj = Math.round(cj); if (ri < 0 || rj < 0 || ri >= N || rj >= N) continue;
      const key = ri * N + rj; if (!at.has(key)) at.set(key, []); at.get(key).push([ci, cj, k]); }
    for (const q of this.cells) { const gx = (q.i - q.j) * g.a + g.ox, gy = (q.i + q.j) * g.b + g.oy, inf = Math.exp(-((gx - ptr.x) ** 2 + (gy + g.b - ptr.y) ** 2) / (R * R));
      const th = q.tower ? g.s * 4.2 : q.b * g.s * (.25 + 2.6 * inf + .12 * Math.sin(t * .9 + q.ph)); q.h = lerp(q.h, th, .12); const hh = q.h, a = g.a, b = g.b;
      c.strokeStyle = rgb('fg', q.street ? .2 : .12); c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + a, gy + b); c.lineTo(gx, gy + 2 * b); c.lineTo(gx - a, gy + b); c.closePath(); c.stroke();
      const cs = at.get(q.i * N + q.j); if (cs) for (const [ci, cj, k] of cs) {
        const x = (ci - cj) * a + g.ox, y = (ci + cj) * b + g.oy + b - g.s * .04, sg = k.v < 0 ? -1 : 1, dx = (k.ax ? a : -a) * sg, dy = b * sg;
        c.fillStyle = rgb(k.col); c.strokeStyle = rgb('fg', .85); c.beginPath(); c.moveTo(x + dx * .3, y + dy * .3); c.lineTo(x - dy * .13, y + dx * .13); c.lineTo(x - dx * .3, y - dy * .3); c.lineTo(x + dy * .13, y - dx * .13); c.closePath(); c.fill(); c.stroke(); }
      if (hh < 1) continue;
      const poly = (pts, k, al) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fillStyle = rgb('bg'); c.fill(); if (al) { c.fillStyle = rgb(k, al); c.fill(); } c.stroke(); };
      c.strokeStyle = rgb('fg', .7); const k = q.tower ? acc[q.tower] : 'fg';
      poly([gx - a, gy + b - hh, gx, gy + 2 * b - hh, gx, gy + 2 * b, gx - a, gy + b], k, q.tower ? .55 : .06); poly([gx, gy + 2 * b - hh, gx + a, gy + b - hh, gx + a, gy + b, gx, gy + 2 * b], k, q.tower ? .8 : .18);
      /* windows that switch on and off */
      if (hh > g.s * .9) { const rows = Math.min(6, Math.floor(hh / (g.s * .5)));
        for (let rw = 0; rw < rows; rw++) for (let cl = 0; cl < 2; cl++) { if (Math.sin(t * .6 + q.ph * (rw + 1) + cl * 2.1 + q.i * 1.7) < .5) continue;
          const u = .3 + cl * .4, v = (rw + .75) / (rows + .5), wx = gx + u * a, wy = gy + 2 * b - hh - u * b + v * hh, ws = g.s * .08; c.fillStyle = rgb('hot', .95); c.fillRect(wx - ws / 2, wy - ws / 2, ws, ws); } }
      poly([gx, gy - hh, gx + a, gy + b - hh, gx, gy + 2 * b - hh, gx - a, gy + b - hh], k, q.tower ? 1 : 0);
    }
    /* a ring spreads from every tower you plant or remove */
    for (const r of this.ripples) { const k = (t - r.t0) / 1.4, rx = g.s * (.6 + k * 4); c.strokeStyle = rgb('hot', (1 - k) * .9); c.lineWidth = 2; c.beginPath(); c.ellipse(r.x, r.y, rx, rx * .5, 0, 0, 6.283); c.stroke(); } c.lineWidth = 1; },
};

/* ---------- 3. Composer ---------- */
const composer = { shapes: [], live: null, kinds: ['circle', 'square', 'tri', 'half', 'bar'], inks: ['red', 'blue', 'yel', 'ink'],
  setup() { if (!this.shapes.length) this.shuffle(); btn('pgShuffle', () => this.shuffle()); btn('pgClear', () => this.shapes = []);
    btn('pgSave', () => { const a = document.createElement('a'); a.download = 'composition.png'; a.href = cv.toDataURL('image/png'); a.click(); }); },
  pick() { return { kind: this.kinds[Math.random() * 5 | 0], ink: this.inks[Math.random() * 4 | 0] }; },
  shuffle() { this.shapes = Array.from({ length: 8 }, () => Object.assign(this.pick(), { x: .12 + Math.random() * .76, y: .14 + Math.random() * .72, s: .06 + Math.random() * .2, rot: (Math.random() * 8 | 0) * Math.PI / 4 })); },
  down() { this.live = Object.assign(this.pick(), { x: ptr.x / w, y: ptr.y / h, s: .04, rot: 0 }); },
  move() { if (!this.live) return; const dx = ptr.x - this.live.x * w, dy = ptr.y - this.live.y * h; this.live.s = Math.max(.04, Math.hypot(dx, dy) / Math.min(w, h)); this.live.rot = Math.atan2(dy, dx); },
  up() { if (this.live) { this.shapes.push(this.live); this.live = null; } },
  put(q) { const u = Math.min(w, h), s = q.s * u; c.save(); c.translate(q.x * w, q.y * h); c.rotate(q.rot); c.fillStyle = q.ink === 'ink' ? '#141414' : rgb(q.ink); c.globalCompositeOperation = 'multiply'; c.beginPath();
    if (q.kind === 'circle') c.arc(0, 0, s, 0, 6.283); else if (q.kind === 'square') c.rect(-s, -s, s * 2, s * 2); else if (q.kind === 'tri') { c.moveTo(0, -s * 1.15); c.lineTo(s, s * .6); c.lineTo(-s, s * .6); c.closePath(); }
    else if (q.kind === 'half') { c.arc(0, 0, s, 0, Math.PI); c.closePath(); } else c.rect(-s * 1.6, -s * .09, s * 3.2, s * .18); c.fill(); c.restore(); },
  frame() { c.globalCompositeOperation = 'source-over'; c.fillStyle = '#efe8d8'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(20,20,20,.1)'; c.lineWidth = 1;
    for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(w * i / 12, 0); c.lineTo(w * i / 12, h); c.stroke(); }
    this.shapes.forEach(q => this.put(q)); if (this.live) this.put(this.live); c.globalCompositeOperation = 'source-over'; },
};

/* ---------- 4. Form memory ---------- */
const memory = { seq: [], idx: 0, phase: 'idle', at: 0, flash: -1, flashAt: 0, score: 0, best: 0,
  setup() { try { this.best = +localStorage.getItem('pgBest') || 0; } catch (e) {} this.phase = 'idle'; this.seq = []; this.score = 0; btn('pgStart', () => this.start()); },
  start() { this.seq = [Math.random() * 4 | 0]; this.score = 0; this.show(); },
  show() { this.phase = 'show'; this.at = performance.now() + 500; this.idx = 0; },
  pads() { const s = Math.min(w, h) * .25, g = s * .14, cx = w / 2, cy = h * .54; return [[cx - s - g / 2, cy - s - g / 2], [cx + g / 2, cy - s - g / 2], [cx - s - g / 2, cy + g / 2], [cx + g / 2, cy + g / 2]].map(p => [p[0], p[1], s]); },
  down() { if (this.phase !== 'input') return; const i = this.pads().findIndex(p => ptr.x > p[0] && ptr.x < p[0] + p[2] && ptr.y > p[1] && ptr.y < p[1] + p[2]); if (i < 0) return;
    this.flash = i; this.flashAt = performance.now();
    if (i !== this.seq[this.idx]) { this.phase = 'fail'; this.at = performance.now(); if (this.score > this.best) { this.best = this.score; try { localStorage.setItem('pgBest', this.best); } catch (e) {} } return; }
    if (++this.idx === this.seq.length) { this.score = this.seq.length; this.seq.push(Math.random() * 4 | 0); this.show(); this.at += 400; } },
  frame() { c.fillStyle = rgb('bg'); c.fillRect(0, 0, w, h); const now = performance.now(), pads = this.pads(), inks = ['red', 'blue', 'yel', 'fg']; let lit = -1;
    if (this.phase === 'show') { const k = Math.floor((now - this.at) / 620); if (k >= this.seq.length) this.phase = 'input'; else if (k >= 0 && (now - this.at) % 620 < 430) lit = this.seq[k]; }
    if (now - this.flashAt < 220) lit = this.flash; const shake = this.phase === 'fail' && now - this.at < 450 ? Math.sin(now * .06) * 8 : 0;
    pads.forEach((p, i) => { const on = i === lit, s = p[2], k = on ? 1.06 : 1; c.save(); c.translate(p[0] + s / 2 + shake, p[1] + s / 2); c.scale(k, k); c.globalAlpha = on ? 1 : .3;
      c.strokeStyle = rgb('fg', .5); c.lineWidth = 1; c.strokeRect(-s / 2, -s / 2, s, s); c.fillStyle = rgb(inks[i]); const r = s * .3; c.beginPath();
      if (i === 0) c.arc(0, 0, r, 0, 6.283); else if (i === 1) c.rect(-r, -r, r * 2, r * 2); else if (i === 2) { c.moveTo(0, -r * 1.1); c.lineTo(r * 1.1, r * .8); c.lineTo(-r * 1.1, r * .8); c.closePath(); } else { c.arc(0, r * .4, r * 1.1, Math.PI, 0); c.closePath(); }
      c.fill(); c.restore(); });
    c.globalAlpha = 1; c.fillStyle = rgb('fg'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = ar() ? 'rtl' : 'ltr';
    c.font = `700 ${Math.max(16, h * .045)}px ${face()}, sans-serif`;
    const msg = { idle: T('pgStart'), show: T('pgWatch'), input: T('pgTurn'), fail: T('pgWrong') }[this.phase]; c.fillText(msg, w / 2, pads[0][1] - h * .09);
    c.font = `500 ${Math.max(11, h * .024)}px ${ar() ? '"Readex Pro"' : '"JetBrains Mono"'}, monospace`; c.fillStyle = rgb('fg', .6);
    c.fillText(`${T('pgScore')} ${this.score}   ·   ${T('pgBest')} ${Math.max(this.best, this.score)}`, w / 2, pads[2][1] + pads[2][2] + h * .07); },
};

/* ---------- 5. Architect's Run (ported from the earlier site, redrawn as a line drawing in the sheet colours) ---------- */
const LX = [-2.4, 0, 2.4];
const run = { gl: true, state: 'idle', ready: false, failed: false, loading: false, best: 0, score: 0, last: 0, obst: [], rings: [], pillars: [],
  setup() { try { this.best = +localStorage.getItem('runBest') || 0; } catch (e) {} this.play = btn('pgPlay', () => this.begin()); this.state = 'idle'; this.label();
    if (window.THREE) return this.build(); if (this.loading) return; this.loading = true;
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = () => { if (toys[cur] === this && open) this.build(); }; s.onerror = () => { this.failed = true; this.label(); }; document.head.appendChild(s); },
  leave() { this.state = 'idle'; glc.style.touchAction = ''; },
  label() { hud.textContent = `${T('pgScore')} ${Math.floor(this.score)}   ·   ${T('pgBest')} ${this.best}`;
    msg.textContent = this.failed ? T('pgNoGL') : this.state === 'over' ? T('pgOver') : this.state === 'idle' ? T('pgRunTitle') : '';
    if (this.play) { this.play.textContent = T(this.state === 'over' ? 'pgAgain' : 'pgPlay'); this.play.hidden = this.failed || this.state === 'play' || this.state === 'dying'; } },
  build() { const T3 = window.THREE, C3 = k => new T3.Color(`rgb(${col[k]})`);
    try {
      if (!this.renderer) { this.renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true }); this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); }
      const sc = this.scene = new T3.Scene(); sc.background = C3('bg'); sc.fog = new T3.Fog(C3('bg'), 30, 105);
      this.camera = new T3.PerspectiveCamera(62, 2, .1, 260); this.camera.position.set(0, 3.4, 7);
      const line = (k, op = 1) => new T3.LineBasicMaterial({ color: C3(k), transparent: op < 1, opacity: op });
      const solid = (geo, fill, edge = 'fg') => { const m = new T3.Mesh(geo, new T3.MeshBasicMaterial({ color: C3(fill) })); m.add(new T3.LineSegments(new T3.EdgesGeometry(geo), line(edge))); return m; };
      this.solid = solid;
      /* the road is a drafting grid: fixed lane lines, cross lines that slide toward you */
      const lg = [], cg = []; [-3.6, -1.2, 1.2, 3.6].forEach(x => lg.push(x, 0, 10, x, 0, -210)); for (let i = 0; i < 44; i++) cg.push(-3.6, 0, -i * 5, 3.6, 0, -i * 5);
      const seg = (arr, m) => { const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(arr, 3)); return new T3.LineSegments(g, m); };
      sc.add(seg(lg, line('fg', .55))); this.cross = seg(cg, line('fg', .3)); sc.add(this.cross);
      /* towers along both edges */
      this.pillars = []; const pg2 = new T3.BoxGeometry(.6, 5, .6); for (let i = 0; i < 18; i++) { const p = solid(pg2, 'bg'); p.position.set(i % 2 ? 5.6 : -5.6, 2.5, -i * 6); sc.add(p); this.pillars.push(p); }
      /* three primaries on the horizon */
      const far = k => new T3.MeshBasicMaterial({ color: C3(k), fog: false }), bk = new T3.Group(); bk.position.set(0, 17, -175);
      const ci = new T3.Mesh(new T3.CircleGeometry(16, 48), far('red')); ci.position.x = -18; const sq = new T3.Mesh(new T3.PlaneGeometry(26, 26), far('blue')); sq.position.set(6, 4, .1);
      const tr = new T3.Mesh(new T3.CircleGeometry(18, 3), far('yel')); tr.position.set(30, -2, .2); bk.add(ci, sq, tr); sc.add(bk);
      /* the player: a paper pyramid riding a ring */
      const body = solid(new T3.ConeGeometry(.62, 1.8, 4), 'fg', 'bg'); body.rotation.x = -Math.PI / 2; body.position.z = -.2;
      const ring = new T3.Mesh(new T3.TorusGeometry(.78, .06, 8, 32), new T3.MeshBasicMaterial({ color: C3('yel') })); ring.rotation.x = Math.PI / 2; ring.position.y = -.55;
      this.player = new T3.Group(); this.player.add(body, ring); this.body = body; this.pring = ring; sc.add(this.player);
      this.G = { box: new T3.BoxGeometry(1.8, .9, 1.6), cone: new T3.ConeGeometry(1, 2.6, 4), cyl: new T3.CylinderGeometry(.9, .9, 2.2, 20), torus: new T3.TorusGeometry(.55, .11, 10, 28), ringM: new T3.MeshBasicMaterial({ color: C3('yel') }) };
      this.obst = []; this.rings = []; this.lane = 1; this.py = .7; this.vy = 0; this.speed = 14; this.spawnD = 18; this.shake = 0; this.dying = 0; this.sceneT = 0; this.ready = true; this.resize();
    } catch (e) { this.failed = true; } this.label(); },
  resize() { if (!this.renderer || !w || !h) return; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); },
  addObstacle(l, z) { const k = Math.random(); let m, hh;
    if (k < .45) { hh = .9; m = this.solid(this.G.box, 'red'); } else if (k < .8) { hh = 2.6; m = this.solid(this.G.cone, 'yel'); } else { hh = 2.2; m = this.solid(this.G.cyl, 'blue'); }
    m.position.set(LX[l], hh / 2, z); m.userData = { h: hh }; this.scene.add(m); this.obst.push(m); },
  addRing(l, z) { const m = new window.THREE.Mesh(this.G.torus, this.G.ringM); m.position.set(LX[l], 1.4, z); this.scene.add(m); this.rings.push(m); },
  spawnRow() { const z = -100, lanes = [0, 1, 2].sort(() => Math.random() - .5), r = Math.random();
    if (r < .5) { this.addObstacle(lanes[0], z); if (Math.random() < .6) this.addRing(lanes[1], z - 2); }
    else if (r < .8) { this.addObstacle(lanes[0], z); this.addObstacle(lanes[1], z); if (Math.random() < .7) this.addRing(lanes[2], z); }
    else for (let i = 0; i < 4; i++) this.addRing(lanes[0], z - i * 3); },
  begin() { if (!this.ready || this.failed) return; [...this.obst, ...this.rings].forEach(m => this.scene.remove(m)); this.obst = []; this.rings = [];
    this.score = 0; this.speed = 14; this.spawnD = 16; this.lane = 1; this.py = .7; this.vy = 0; this.dying = 0; this.shake = 0; this.player.position.set(0, .7, 0); this.player.rotation.set(0, 0, 0);
    this.state = 'play'; glc.style.touchAction = 'none'; this.label(); glc.focus({ preventScroll: true }); },
  die() { this.state = 'dying'; this.dying = .7; this.shake = .5; glc.style.touchAction = ''; const s = Math.floor(this.score); if (s > this.best) { this.best = s; try { localStorage.setItem('runBest', s); } catch (e) {} } },
  key(k) { if (this.state !== 'play') return false;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.lane = Math.max(0, this.lane - 1); else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.lane = Math.min(2, this.lane + 1);
    else if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') { if (this.py <= .71) this.vy = 12.5; } else return false; return true; },
  swipe(dx, dy) { if (this.state !== 'play') return; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) this.key(dx < 0 ? 'ArrowLeft' : 'ArrowRight'); else this.key('ArrowUp'); },
  frame(t) { if (!this.ready || this.failed) return; const dt = Math.min(.05, (t - this.last) || 0); this.last = t; this.sceneT += dt;
    const playing = this.state === 'play', sp = playing ? this.speed : this.state === 'dying' ? 2 : 6, P = this.player;
    this.cross.position.z = (this.cross.position.z + sp * dt) % 5; this.pillars.forEach(p => { p.position.z += sp * dt; if (p.position.z > 8) p.position.z -= 108; });
    if (playing || this.state === 'dying') { this.obst.forEach(o => o.position.z += sp * dt); this.rings.forEach(r => { r.position.z += sp * dt; r.rotation.y += dt * 3.2; });
      for (let i = this.obst.length - 1; i >= 0; i--) if (this.obst[i].position.z > 10) { this.scene.remove(this.obst[i]); this.obst.splice(i, 1); }
      for (let i = this.rings.length - 1; i >= 0; i--) if (this.rings[i].position.z > 10) { this.scene.remove(this.rings[i]); this.rings.splice(i, 1); }
      this.vy -= 38 * dt; this.py += this.vy * dt; if (this.py <= .7) { this.py = .7; this.vy = 0; } }
    const tx = LX[this.lane], px = P.position.x; P.position.x += (tx - px) * Math.min(1, dt * 14); P.rotation.z = (px - tx) * .14; P.position.y = this.py; this.pring.rotation.z += dt * 5; this.body.rotation.y += dt * .6;
    if (this.state === 'idle' || this.state === 'over') P.position.y = .7 + Math.sin(this.sceneT * 2.4) * .12;
    const cam = this.camera; cam.position.x += (P.position.x * .45 - cam.position.x) * Math.min(1, dt * 4); cam.position.y = 3.4 + (this.shake > 0 ? (Math.random() - .5) * this.shake * 1.6 : 0); this.shake = Math.max(0, this.shake - dt); cam.lookAt(P.position.x * .2, 1, -10);
    if (playing) { this.speed = Math.min(32, this.speed + dt * .35); this.score += sp * dt * .5; this.spawnD -= sp * dt;
      if (this.spawnD <= 0) { this.spawnRow(); this.spawnD = 14 + Math.random() * 10 - Math.min(6, this.speed * .1); }
      for (const o of this.obst) { const z = o.position.z; if (z > -1.3 && z < 1.3 && Math.abs(o.position.x - P.position.x) < 1.15 && (this.py - .7) < o.userData.h - .05) { this.die(); break; } }
      for (let i = this.rings.length - 1; i >= 0; i--) { const r = this.rings[i]; if (Math.abs(r.position.z) < 1.1 && Math.abs(r.position.x - P.position.x) < 1.2 && Math.abs(r.position.y - this.py) < 1.3) { this.scene.remove(r); this.rings.splice(i, 1); this.score += 10; } }
      hud.textContent = `${T('pgScore')} ${Math.floor(this.score)}   ·   ${T('pgBest')} ${this.best}`; }
    if (this.state === 'dying') { this.dying -= dt; if (this.dying <= 0) { this.state = 'over'; this.label(); } }
    this.renderer.render(this.scene, cam); },
};
addEventListener('keydown', e => { if (open && toys[cur] === run && run.key(e.key)) e.preventDefault(); });
{ let sx = 0, sy = 0; glc.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; }); glc.addEventListener('pointerup', e => run.swipe(e.clientX - sx, e.clientY - sy)); }

const toys = [writer, city, composer, memory, run];

/* ---------- shell ---------- */
function size() { const r = cv.parentElement.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); w = Math.round(r.width); h = Math.round(r.height); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); if (toys[cur].gl) toys[cur].resize(); else if (toys[cur].build) toys[cur].build(); }
function select(i) { if (toys[cur].leave) toys[cur].leave(); cur = i; ui.innerHTML = ''; hud.textContent = ''; msg.textContent = ''; cv.hidden = !!toys[i].gl; glc.hidden = !toys[i].gl; hint.textContent = T('pgHints')[i]; [...tabs.children].forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); }); toys[i].setup(); }
function drawTabs() { tabs.innerHTML = T('pgToys').map((n, i) => `<button type="button" role="tab"><small>0${i + 1}</small><span>${n}</span></button>`).join(''); [...tabs.children].forEach((b, i) => b.addEventListener('click', () => select(i))); }
function loop(now) { if (!open) return; raf = requestAnimationFrame(loop); if (!w) size(); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalAlpha = 1; toys[cur].frame(now / 1000); }
function setOpen(on) { open = on; document.body.classList.toggle('pg', on); pg.setAttribute('aria-hidden', !on); tab.setAttribute('aria-expanded', on);
  if (on) { readCols(); drawTabs(); requestAnimationFrame(() => { size(); select(cur); raf = requestAnimationFrame(loop); }); } else { cancelAnimationFrame(raf); if (toys[cur].leave) toys[cur].leave(); } }
tab.addEventListener('click', () => setOpen(true)); $('#pgClose').addEventListener('click', () => setOpen(false));
addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });
addEventListener('resize', () => { if (open) size(); });
document.addEventListener('langchange', () => { if (open) { readCols(); drawTabs(); select(cur); } });
new MutationObserver(() => { if (open) readCols(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
const at = e => { const r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
cv.addEventListener('pointerdown', e => { at(e); ptr.down = true; cv.setPointerCapture(e.pointerId); toys[cur].down && toys[cur].down(); });
cv.addEventListener('pointermove', e => { at(e); toys[cur].move && toys[cur].move(); });
cv.addEventListener('pointerup', e => { at(e); ptr.down = false; toys[cur].up && toys[cur].up(); });
cv.addEventListener('pointerleave', () => { if (!ptr.down) { ptr.x = ptr.y = -999; } });
})();
