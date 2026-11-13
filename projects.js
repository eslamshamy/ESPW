/* Projects page: every project, filterable by topic. Cursor, language and sheet colour come from shell.js. */
(() => {
const { T, lang, rtl, onLang, apply, arrive, pad, $, $$, clamp, lerp } = Shell, root = document.documentElement;
let filter = new URLSearchParams(location.search).get('cat'); if (!CATS[filter]) filter = 'all';
const grid = $('#grid'), filters = $('#filters'), cnt = $('#cnt'); let cards = [], hover = -1;
const matches = p => filter === 'all' || p.cats.includes(filter);

function render() {
  const L = lang(); document.title = (rtl() ? 'المشاريع — ' : 'Projects — ') + T('name');
  filters.innerHTML = ['all', ...Object.keys(CATS)].map(k => { const n = k === 'all' ? ALL_PROJECTS.length : ALL_PROJECTS.filter(p => p.cats.includes(k)).length;
    return `<button type="button" class="chipf${k === filter ? ' on' : ''}" data-k="${k}" aria-pressed="${k === filter}"><span>${k === 'all' ? T('pAll') : CATS[k][L]}</span><sup dir="ltr">${pad(n)}</sup></button>`; }).join('');
  $$('.chipf', filters).forEach(b => b.addEventListener('click', () => setFilter(b.dataset.k)));
  const ar = rtl() ? '↖' : '↗';
  grid.innerHTML = ALL_PROJECTS.map((p, i) => { const x = p[L], link = p.caseId ? `href="case.html?id=${p.caseId}" class="pc-frame leave" data-cursor="curOpen"` : p.href ? `href="${p.href}" target="_blank" rel="noopener" class="pc-frame" data-cursor="curOpen"` : 'class="pc-frame"';
    return `<article class="pc${matches(p) ? '' : ' gone'}" data-i="${i}" style="--d:${(i % 6) * 60}ms">
      <${p.caseId || p.href ? 'a' : 'div'} ${link}>${p.scene ? '<canvas></canvas>' : `<img src="${p.img}" alt="" loading="lazy">`}<span class="pc-n" dir="ltr">${pad(i + 1)}</span>${p.caseId ? `<span class="pc-go pc-case mono">${T('caseStudy')}</span>` : p.href ? `<span class="pc-go">${ar}</span>` : ''}</${p.caseId || p.href ? 'a' : 'div'}>
      <div class="pc-meta mono"><span>${x.kind}</span></div>
      <h3>${x.title}</h3><p>${x.desc}</p>
      <div class="pc-tags mono">${p.cats.map(c => `<button type="button" data-k="${c}">${CATS[c][L]}</button>`).join('')}</div></article>`; }).join('');
  cards = $$('.pc', grid).map(el => ({ el, cv: $('canvas', el), p: ALL_PROJECTS[+el.dataset.i], drawn: false }));
  cards.forEach((c, i) => { c.el.addEventListener('pointerenter', () => hover = i); c.el.addEventListener('pointerleave', () => { if (hover === i) hover = -1; }); io.observe(c.el); });
  $$('.pc-tags button', grid).forEach(b => b.addEventListener('click', () => { setFilter(b.dataset.k); scrollTo({ top: 0, behavior: 'smooth' }); }));
  count(false);
}
function count(anim) { const n = ALL_PROJECTS.filter(matches).length, from = +cnt.textContent || 0, a = performance.now();
  if (!anim) return cnt.textContent = pad(n);
  (function f(now) { const p = clamp((now - a) / 500); cnt.textContent = pad(Math.round(lerp(from, n, 1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); })(a); }

/* filtering: everything dips out, the grid re-packs, matches rise back in one after another */
let ft;
function setFilter(k) { if (k === filter) k = 'all'; filter = k;
  $$('.chipf', filters).forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  try { history.replaceState(null, '', k === 'all' ? location.pathname : '?cat=' + k); } catch (e) {}
  count(true); grid.classList.add('swap'); clearTimeout(ft);
  ft = setTimeout(() => { let n = 0; cards.forEach(c => { const m = matches(c.p); c.el.classList.toggle('gone', !m); c.el.classList.remove('in'); if (m) c.el.style.setProperty('--d', (n++ % 9) * 55 + 'ms'); });
    void grid.offsetWidth; grid.classList.remove('swap'); cards.forEach(c => { if (!c.el.classList.contains('gone')) { c.el.classList.add('in'); draw(c, 5); } }); }, 380); }

/* generated covers: one still frame each, animated only under the pointer */
function draw(c, t) { if (!c.cv) return; const b = c.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), w = Math.round(b.width * d), h = Math.round(b.height * d); if (!w) return;
  if (Math.abs(c.cv.width - w) > 20 || Math.abs(c.cv.height - h) > 20) { c.cv.width = w; c.cv.height = h; }
  SCENES[c.p.scene](c.cv.getContext('2d'), c.cv.width, c.cv.height, t, c.p.seed); c.drawn = true; }
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); const c = cards.find(c => c.el === e.target); if (c) draw(c, 5); }), { threshold: .12 });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => cards.forEach(c => c.drawn && draw(c, 5)), 200); });
(function frame(now) { requestAnimationFrame(frame); if (hover >= 0 && cards[hover]) draw(cards[hover], now / 1000); })(performance.now());

onLang(render); apply(); arrive();
document.fonts && document.fonts.ready.then(() => cards.forEach(c => c.drawn && draw(c, 5)));
})();
