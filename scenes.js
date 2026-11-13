/* Project data + one generative scene per project (drawn live in the tilted pane and in the Projects menu). */
const PROJECTS = [
  { slug: 'explore-imet', title: ['Explore', 'Imet'], org: 'Real Ideas Market Hall', years: '2026', scene: 'dome',
    desc: 'A human-AI co-designed visual journey through a lost city of the Egyptian Delta, shown as an interactive show in Europe’s largest 360 immersive dome of its kind.',
    cta: 'Read the story', href: 'https://www.aup.ac.uk/posts/eslam-elshamy-lost-egyptian-heritage-ai-workshops-immersive-media' },
  { slug: 'bauhausifier', title: ['The', 'Bauhausifier'], org: 'Bauhaus Fest', years: '2025', scene: 'bauhaus',
    desc: 'A real-time, interactive installation that generates Bauhaus-inspired architectural forms, exhibited in Performative Machines for the Bauhaus 100th anniversary.',
    cta: 'View project', href: 'https://www.eslamshamy.com' },
  { slug: 'ai-memory-box', title: ['AI Memory', 'Box'], org: 'Desirable AI, Univ. of Bonn', years: '2026', scene: 'box',
    desc: 'An installation and talk on preserving human emotion in the age of AI, presented at Irrationality and the Age of AI.',
    cta: 'View project', href: 'https://www.eslamshamy.com' },
  { slug: 'compredict-brand', title: ['Brand', 'System'], org: 'Compredict', years: '2025', scene: 'brand',
    desc: 'Rebuilt the company’s complete visual brand system from the ground up: one design language across print, digital and interactive media.',
    cta: 'View project', href: 'https://www.eslamshamy.com' },
  { slug: 'tectonic-chair', title: ['Tectonic', 'Chair'], org: 'Materiability Research Group', years: '2024 — 2025', scene: 'print',
    desc: 'Large-scale furniture printed by Fused Granular Fabrication with bio-based and recycled composites, using algorithmic modelling to minimise material.',
    cta: 'View project', href: 'https://www.eslamshamy.com' },
  { slug: 'misaha-podcast', title: ['Misaha', 'Podcast'], org: 'Space Studio', years: '2023 — 2024', scene: 'wave',
    desc: 'Brand identity and visual content strategy for a podcast channel that grew to 30,000+ subscribers and 2 million views in its first year.',
    cta: 'View project', href: 'https://www.eslamshamy.com' },
];

const RESEARCH = [
  ['2026', 'Human-AI co-design framework for visualizing lost ancient cities: The case of the Egyptian Delta', 'Master’s thesis, Anhalt University of Applied Sciences', 'Thesis', 'https://doi.org/10.25673/124351'],
  ['2026', 'Designing with uncertainty: A participatory human–AI framework for the visual reconstruction of lost cities', 'With M. W. Fareed & M. Kretzer · Submitted to Studies in Digital Heritage', 'Submitted'],
  ['2026', 'Emotional Mirror: A Local Multimodal Generative Framework for Synthetic Memory Reconstruction', 'With M. W. Fareed & A. Jahanian Najafabadi · Submitted to IEEE SPMB Symposium 2026', 'Preprint', 'https://osf.io/preprints/psyarxiv/pvf39_v1'],
  ['2026', 'The Bauhausifier: Real-Time Human-AI Co-Creation of Bauhaus-Inspired Architectural Forms', 'With M. W. Fareed · Submitted to Digital Creativity', 'Submitted'],
  ['2026', 'Sustainable Creative-Critical AI Practices for Digital Humanities', 'UK-Ireland Digital Humanities Association, University of Southampton', 'Talk'],
  ['2026', 'AI Memory Box: Preserving Human Emotion in the Age of AI', 'Irrationality and the Age of AI, University of Bonn', 'Talk'],
  ['2026', 'NEW LANDS: Using AI to Bring Forgotten Stories of WWI Egyptian Workers to Life', 'IAMHIST Symposium 2026, University of Luxembourg', 'Talk'],
  ['2026', 'Dessau Design Award, nominee for Best Master’s Thesis', 'Anhalt University of Applied Sciences', 'Award'],
  ['2025', 'World Economic Forum’s Innovation Award, “Find Us at The Park”', 'With Budaiya Hub', 'Award'],
];

/* deterministic pseudo-random */
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

const SCENES = {
  /* 360 dome: a hemisphere of points turning over a field of city blocks */
  dome: (() => {
    const r = rnd(7), pts = [], city = [];
    for (let i = 0; i < 1100; i++) { const y = i / 1100, rad = Math.sqrt(1 - y * y), a = i * 2.39996; pts.push([Math.cos(a) * rad, y, Math.sin(a) * rad]); }
    for (let i = 0; i < 46; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * .78, h = .04 + r() * r() * .32, w = .02 + r() * .04;
      for (let k = 0; k < 26; k++) city.push([Math.cos(a) * d + (r() - .5) * w, r() * h, Math.sin(a) * d + (r() - .5) * w]); }
    return (c, w, h, t) => {
      c.fillStyle = '#0b0a08'; c.fillRect(0, 0, w, h);
      const R = Math.min(w, h) * .62, cx = w / 2, cy = h * .78, a = t * .18, ca = Math.cos(a), sa = Math.sin(a), tilt = .32;
      const put = (p, col, s) => { const x = p[0] * ca - p[2] * sa, z = p[0] * sa + p[2] * ca, y = p[1];
        const py = cy - (y * Math.cos(tilt) - z * Math.sin(tilt)) * R, px = cx + x * R, depth = (z + 1) / 2;
        c.globalAlpha = .18 + depth * .8; c.fillStyle = col; c.fillRect(px, py, s, s); };
      const s = Math.max(1, w / 520);
      for (const p of pts) put(p, '#e9cf9a', s);
      for (const p of city) put(p, '#fff4dc', s * 1.3);
      c.globalAlpha = 1;
      // sweeping scan
      const sw = (t * .12) % 1; c.strokeStyle = 'rgba(233,207,154,.35)'; c.lineWidth = 1; c.beginPath();
      c.ellipse(cx, cy - sw * R * .95, R * Math.sqrt(1 - sw * sw), R * Math.sqrt(1 - sw * sw) * Math.sin(tilt), 0, 0, 6.283); c.stroke();
      label(c, w, h, 'IMET · 360° DOME', 'HUMAN-AI CO-DESIGN');
    };
  })(),

  /* Bauhaus primitives recomposing themselves */
  bauhaus: (c, w, h, t) => {
    c.fillStyle = '#efe8d8'; c.fillRect(0, 0, w, h);
    const u = Math.min(w, h), cx = w / 2, cy = h / 2, e = x => .5 - .5 * Math.cos(x);
    const ph = e(t * .5), ph2 = e(t * .37 + 1);
    c.strokeStyle = '#141414'; c.lineWidth = Math.max(1, u * .004);
    for (let i = 0; i < 9; i++) { const x = w * (.08 + i * .105); c.globalAlpha = .12; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } c.globalAlpha = 1;
    // blue circle
    c.fillStyle = '#1d4fd8'; c.beginPath(); c.arc(cx - u * .28 + ph * u * .2, cy - u * .08, u * (.2 + ph2 * .06), 0, 6.283); c.fill();
    // red square
    c.save(); c.translate(cx + u * .22 - ph2 * u * .12, cy + u * .06); c.rotate(ph * 1.5708); c.fillStyle = '#e03a22'; const q = u * .3; c.fillRect(-q / 2, -q / 2, q, q); c.restore();
    // yellow triangle
    c.save(); c.translate(cx + ph * u * .1, cy + u * .12 - ph2 * u * .2); c.rotate(-ph2 * 2.094); c.fillStyle = '#f4c20d'; const s = u * .24;
    c.beginPath(); c.moveTo(0, -s); c.lineTo(s * .87, s * .5); c.lineTo(-s * .87, s * .5); c.closePath(); c.globalCompositeOperation = 'multiply'; c.fill(); c.restore();
    // black bars + arc
    c.fillStyle = '#141414'; c.fillRect(w * .08, cy + u * .3, w * (.2 + ph * .5), u * .02); c.fillRect(w * .86, h * .12, u * .02, h * (.2 + ph2 * .4));
    c.beginPath(); c.arc(cx, cy, u * .42, t * .3, t * .3 + 1.2 + ph * 2); c.stroke();
    label(c, w, h, 'BAUHAUSIFIER', 'REAL-TIME · FORM ' + String(Math.floor(t * 2) % 1000).padStart(3, '0'), '#141414');
  },

  /* Memory box: wireframe cube holding a drifting cloud */
  box: (() => {
    const r = rnd(11), ps = []; for (let i = 0; i < 420; i++) ps.push([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, r() * 6.28, .2 + r()]);
    const V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    return (c, w, h, t) => {
      c.fillStyle = '#0a0812'; c.fillRect(0, 0, w, h);
      const R = Math.min(w, h) * .27, cx = w / 2, cy = h / 2, ay = t * .25, ax = .45 + Math.sin(t * .2) * .12;
      const pr = p => { let x = p[0] * Math.cos(ay) - p[2] * Math.sin(ay), z = p[0] * Math.sin(ay) + p[2] * Math.cos(ay), y = p[1] * Math.cos(ax) - z * Math.sin(ax); z = p[1] * Math.sin(ax) + z * Math.cos(ax);
        const k = 3.4 / (3.4 + z); return [cx + x * R * k, cy + y * R * k, z]; };
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6); g.addColorStop(0, 'rgba(160,110,255,.35)'); g.addColorStop(1, 'rgba(160,110,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (const p of ps) { const m = .62 + .12 * Math.sin(t * p[4] + p[3]); const q = pr([p[0] * m * Math.cos(t * .1 * p[4]), p[1] * m, p[2] * m]);
        c.globalAlpha = .25 + .6 * (1 - (q[2] + 1) / 2); c.fillStyle = p[4] > .8 ? '#ffc7e8' : '#b99cff'; const s = Math.max(1, w / 420) * (p[4] > 1 ? 1.6 : 1); c.fillRect(q[0], q[1], s, s); }
      c.globalAlpha = .8; c.strokeStyle = '#efe9ff'; c.lineWidth = 1; c.beginPath();
      for (const [a, b] of E) { const p = pr(V[a]), q = pr(V[b]); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); } c.stroke();
      c.globalAlpha = 1; for (const v of V) { const p = pr(v); c.fillStyle = '#fff'; c.beginPath(); c.arc(p[0], p[1], Math.max(1.5, w / 400), 0, 6.283); c.fill(); }
      label(c, w, h, 'AI MEMORY BOX', 'PRESERVING HUMAN EMOTION');
    };
  })(),

  /* Brand system: swatches, type specimen, grid */
  brand: (c, w, h, t) => {
    c.fillStyle = '#0c1422'; c.fillRect(0, 0, w, h);
    const m = w * .05, gw = (w - m * 2), ch = h - m * 2, e = .5 - .5 * Math.cos(t * .6);
    const cell = (x, y, cw, hh, col) => { c.fillStyle = col; c.fillRect(m + x * gw, m + y * ch, cw * gw - w * .012, hh * ch - w * .012); };
    cell(0, 0, .42, .62, '#f3f1ec'); cell(.42, 0, .29, .3, '#16233a'); cell(.71, 0, .29, .3, '#ff4a2e');
    cell(.42, .3, .58, .32, '#111b2d'); cell(0, .62, .2, .38, '#16233a'); cell(.2, .62, .22, .38, '#f3f1ec'); cell(.42, .62, .58, .38, '#16233a');
    c.fillStyle = '#0c1422'; c.font = `500 ${h * .3}px Satoshi, sans-serif`; c.textBaseline = 'alphabetic'; c.fillText('Aa', m + gw * .03, m + ch * .5);
    c.font = `500 ${h * .028}px "Azeret Mono", monospace`; c.fillText('TYPE · COLOUR · MOTION', m + gw * .03, m + ch * .57);
    c.fillStyle = '#f3f1ec'; c.font = `700 ${h * .075}px Satoshi, sans-serif`; c.fillText('ONE DESIGN LANGUAGE', m + gw * .45, m + ch * .5);
    // animated signal line
    c.strokeStyle = '#ff4a2e'; c.lineWidth = Math.max(1.5, w * .003); c.beginPath();
    for (let i = 0; i <= 60; i++) { const x = m + gw * (.45 + i / 60 * .5), y = m + ch * (.82 - .1 * Math.sin(i * .25 + t * 1.4) * Math.sin(i * .07 + t * .3) - i / 60 * .06); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.fillStyle = '#ff4a2e'; c.beginPath(); c.arc(m + gw * .31, m + ch * .81, h * (.05 + e * .03), 0, 6.283); c.fill();
    c.strokeStyle = '#f3f1ec'; c.lineWidth = 1; c.beginPath(); c.arc(m + gw * .095, m + ch * .81, h * .07, t, t + 4.4); c.stroke();
    label(c, w, h, '', 'BRAND SYSTEM · 2025');
  },

  /* Fused granular fabrication: a form printed layer by layer */
  print: (c, w, h, t) => {
    c.fillStyle = '#0a0d0a'; c.fillRect(0, 0, w, h);
    const N = 54, cx = w * .5, base = h * .84, lh = h * .0125, built = (t * .13) % 1.25, a = t * .3;
    c.lineWidth = Math.max(1.2, h * .006); c.lineCap = 'round';
    for (let i = 0; i < N; i++) { const f = i / N; if (f > built) break;
      const seat = f < .45 ? 1 : 1 - Math.min(1, (f - .45) * 6) * .62, rx = w * .21 * (seat + .1 * Math.sin(f * 9 + a)) , y = base - i * lh * 1.02, off = f > .45 ? -w * .075 * Math.min(1, (f - .45) * 6) + Math.sin(f * 7) * w * .01 : Math.sin(f * 12 + a) * w * .012;
      c.strokeStyle = `hsl(${88 + f * 40} 38% ${38 + f * 34}%)`; c.globalAlpha = .9; c.beginPath(); c.ellipse(cx + off, y, rx, rx * .26, 0, 0, 6.283); c.stroke(); }
    c.globalAlpha = 1;
    if (built < 1) { const f = built, y = base - f * N * lh * 1.02, x = cx + Math.cos(t * 5) * w * .2; c.fillStyle = '#fff'; c.fillRect(x - 1, y - h * .16, 2, h * .15); c.beginPath(); c.arc(x, y - h * .01, h * .008, 0, 6.283); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(w * .15, y - h * .16); c.lineTo(w * .85, y - h * .16); c.stroke(); }
    label(c, w, h, 'TECTONIC CHAIR · FGF', 'LAYER ' + String(Math.min(N, Math.floor(built * N))).padStart(2, '0') + ' / ' + N);
  },

  /* Podcast: waveform and growth numbers */
  wave: (c, w, h, t) => {
    c.fillStyle = '#100c0a'; c.fillRect(0, 0, w, h);
    const n = 96, m = w * .07, bw = (w - m * 2) / n, cy = h * .52, head = (t * .06) % 1;
    for (let i = 0; i < n; i++) { const f = i / n, v = Math.abs(Math.sin(i * .37 + t * 1.6) * Math.sin(i * .11 - t * .5) * .8 + Math.sin(i * 1.7 + t * 3) * .2), bh = h * (.03 + v * .3);
      c.fillStyle = f < head ? '#ff9a3d' : 'rgba(255,255,255,.28)'; c.fillRect(m + i * bw, cy - bh / 2, Math.max(1, bw * .55), bh); }
    c.fillStyle = '#fff'; c.fillRect(m + head * (w - m * 2), cy - h * .22, 1.5, h * .44);
    c.textBaseline = 'alphabetic'; c.fillStyle = '#fff'; c.font = `400 ${h * .12}px "Bodoni Moda", serif`;
    const e = Math.min(1, (t % 12) / 3), k = 1 - Math.pow(1 - e, 3);
    c.fillText(Math.round(30 * k) + 'K+', m, h * .22); c.fillText((2 * k).toFixed(1).replace('.0', '') + 'M', w * .56, h * .22);
    c.font = `400 ${h * .026}px "Azeret Mono", monospace`; c.fillStyle = 'rgba(255,255,255,.55)';
    c.fillText('SUBSCRIBERS', m, h * .27); c.fillText('VIEWS · FIRST YEAR', w * .56, h * .27);
    label(c, w, h, 'MISAHA · مساحة', 'EP ' + String(1 + Math.floor(t / 12) % 40).padStart(2, '0'));
  },
};

function label(c, w, h, a, b, col = 'rgba(255,255,255,.6)') {
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = col; c.textBaseline = 'alphabetic';
  c.font = `400 ${Math.max(8, h * .024)}px "Azeret Mono", monospace`;
  c.textAlign = 'left'; c.fillText(a, w * .035, h * .945); c.textAlign = 'right'; c.fillText(b, w * .965, h * .945); c.textAlign = 'left';
}
