(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const root = document.documentElement, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const pad = (n, l = 2) => String(n).padStart(l, '0');
const CASE_OF = { 'explore-imet': 'imet', 'bauhausifier': 'bauhausifier', 'ai-memory-box': 'memory-box' };
const N = 5; // highlights on the home reel; the full list lives on the projects page

/* ---------- language ---------- */
let lang = 'en'; try { if (localStorage.getItem('lang') === 'ar') lang = 'ar'; } catch (e) {}
const T = k => I18N[lang][k], rtl = () => lang === 'ar';
const proj = i => Object.assign({}, PROJECTS[i], rtl() ? I18N.ar.projects[i] : null);

/* ---------- theme (circular wipe from the toggle) ---------- */
let ink = '17,17,17', hot = '230,59,31';
const readCols = () => { const s = getComputedStyle(root), g = n => s.getPropertyValue(n).trim().split(/\s+/).join(','), b = root.classList.contains('blue');
  ink = g('--ink'); hot = b ? g('--yel') : g('--blue'); $('#themeT').textContent = T(b ? 'blueprint' : 'paper'); };
try { if (localStorage.getItem('sheet') === 'blue') root.classList.add('blue'); } catch (e) {}
const wipe = (e, fn) => { root.style.setProperty('--tx', e.clientX + 'px'); root.style.setProperty('--ty', e.clientY + 'px'); document.startViewTransition && !document.hidden ? document.startViewTransition(fn) : fn(); };
$('#theme').addEventListener('click', e => wipe(e, () => { const b = root.classList.toggle('blue'); try { localStorage.setItem('sheet', b ? 'blue' : 'paper'); } catch (e) {} readCols(); }));
$('#lang').addEventListener('click', e => wipe(e, () => { lang = rtl() ? 'en' : 'ar'; try { localStorage.setItem('lang', lang); } catch (e) {} render(); }));

/* ---------- render everything that carries text ---------- */
const track = $('#track'), ruler = $('#ruler'), state = $('#state'), endcard = $('#endcard'), secs = $$('[data-sec]'), secName = $('#secName'); let secI = -1;
$('#allN').textContent = ALL_PROJECTS.length;
let cards = [], rBtns = [], sWords = [], mqW = 0;
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target); $$('[data-count]', e.target).forEach(countUp); }), { threshold: .2 });
function render() {
  root.lang = lang; root.dir = rtl() ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => el.textContent = T(el.dataset.i18n)); $$('[data-i18n-html]').forEach(el => el.innerHTML = T(el.dataset.i18nHtml));
  $('#menuT').textContent = T(document.body.classList.contains('menu') ? 'close' : 'menu'); readCols();
  $('#mqIn').innerHTML = T('marquee').map(w => `<span>${w}</span><i>✕</i>`).join('').repeat(4); mqW = 0;

  $$('.card', track).forEach(c => c.remove()); ruler.querySelectorAll('button').forEach(b => b.remove());
  PROJECTS.slice(0, N).forEach((_, i) => { const p = proj(i), ar = rtl() ? '↖' : '↗', cs = CASE_OF[p.slug];
    endcard.insertAdjacentHTML('beforebegin', `<article class="card" id="${p.slug}">
      <div class="num" dir="ltr">${pad(i + 1)}</div>
      <a class="frame" ${cs ? `href="case.html?id=${cs}" data-leave` : `href="${p.href}" target="_blank" rel="noopener"`} data-cursor="curOpen" draggable="false"><canvas></canvas><span class="tag mono">${cs ? T('caseStudy') : p.cta} ${ar}</span></a>
      <div class="info"><h3><span><b>${p.title[0]}</b></span><span><b>${p.title[1]}</b></span></h3>
        <dl class="mono"><div><dt>${T('cFor')}</dt><dd dir="ltr">${p.org}</dd></div><div><dt>${T('cYear')}</dt><dd dir="ltr">${p.years}</dd></div><div><dt>${T('cSheet')}</dt><dd dir="ltr">${pad(i + 1)} / ${pad(N)}</dd></div></dl>
        <p>${p.desc}</p></div></article>`);
    ruler.insertAdjacentHTML('beforeend', `<button type="button" aria-label="${p.title.join(' ')}"><span class="mono">${pad(i + 1)}</span></button>`); });
  cards = $$('.card').map(el => ({ el, num: $('.num', el), frame: $('.frame', el), cv: $('canvas', el) })); rBtns = $$('button', ruler);
  cards.forEach(c => { c.frame.addEventListener('pointermove', e => { const b = c.frame.getBoundingClientRect();
      c.frame.style.setProperty('--ry', ((e.clientX - b.left) / b.width - .5) * 7 + 'deg'); c.frame.style.setProperty('--rx', ((e.clientY - b.top) / b.height - .5) * -7 + 'deg'); });
    c.frame.addEventListener('pointerleave', () => { c.frame.style.setProperty('--rx', '0deg'); c.frame.style.setProperty('--ry', '0deg'); });
    c.frame.addEventListener('click', e => { if (wasDrag) return e.preventDefault(); if (c.frame.hasAttribute('data-leave')) { e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => location.href = c.frame.href, 900); } }); });
  rBtns.forEach((b, i) => b.addEventListener('click', () => scrollTo({ top: cardY(i), behavior: 'smooth' })));

  $('#xp').innerHTML = T('xp').map((x, i) => `<div class="xrow rv" data-chip="${x[3]}" style="transition-delay:${i * 50}ms"><span class="mono yr">${x[0]}</span><b>${x[1]}</b><span class="org" dir="ltr">${x[2]}</span><span class="ar">↗</span></div>`).join('');
  $$('.xrow').forEach(r => r.addEventListener('pointerenter', e => { const b = r.getBoundingClientRect(); r.style.setProperty('--o', e.clientY < b.top + b.height / 2 ? 'top' : 'bottom'); }));
  $('#rs').innerHTML = RESEARCH.map((r, i) => `<div class="rrow rv" style="transition-delay:${i * 50}ms"><button type="button" aria-expanded="false"><span class="t" dir="ltr">${r[1]}</span><span class="mono kind">${T('kinds')[r[3]]}</span><i class="pm"></i></button>
    <div class="more"><div><p><span dir="ltr">${r[0]} · ${r[2]}</span>${r[4] ? `<br><a class="mono" href="${r[4]}" target="_blank" rel="noopener">${T('open')}</a>` : ''}</p></div></div></div>`).join('');
  $$('.rrow > button').forEach(b => b.addEventListener('click', () => { const row = b.parentElement, open = !row.classList.contains('open');
    $$('.rrow.open').forEach(r => { r.classList.remove('open'); r.firstElementChild.setAttribute('aria-expanded', false); });
    row.classList.toggle('open', open); b.setAttribute('aria-expanded', open); setTimeout(measure, 750); }));
  state.innerHTML = T('about').split(' ').map(w => `<span>${w}</span>`).join(' '); sWords = $$('span', state);
  $$('.rv, .stats').forEach(el => io.observe(el));
  activeCard = -2; tx = 0; secI = -1; measure(); buildTargets(true); document.dispatchEvent(new Event('langchange'));
}
function countUp(el) { const n = +el.dataset.count, s = el.dataset.suf || '', a = performance.now();
  (function f(now) { const p = clamp((now - a) / 1400), v = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(n * v) + s; if (p < 1) requestAnimationFrame(f); })(a); }

/* ---------- loader ---------- */
const loader = $('#loader'), t0 = performance.now(), DUR = 1900; let introT = 0;
(function tick(now) {
  const p = clamp((now - t0) / DUR), v = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  $('#ldNum').textContent = pad(Math.round(v * 100), 3); $('#ldBar').style.transform = `scaleX(${v})`; $('#ldMsg').textContent = T('ldMsgs')[Math.min(3, Math.floor(v * 3.99))];
  if (now - t0 < DUR + 200) return requestAnimationFrame(tick);
  loader.classList.add('done'); document.body.classList.remove('loading'); document.body.classList.add('ready'); introT = performance.now();
})(t0);

/* ---------- text scramble (Latin only) ---------- */
const GL = 'ABCDEFGHIKLMNOPRSTUVXYZ/—+';
function scramble(el, txt) { if (rtl()) return el.textContent = txt; clearInterval(el._s); let f = 0; el._s = setInterval(() => {
  el.textContent = [...txt].map((c, i) => i < f / 2 || c === ' ' ? c : GL[Math.random() * GL.length | 0]).join(''); if (f++ > txt.length * 2) { clearInterval(el._s); el.textContent = txt; } }, 28); }

/* ---------- cursor, with its coordinates riding along ---------- */
let W = innerWidth, H = innerHeight, px = W * .5, py = H * .4, cx = px, cy = py, moved = false;
const cur = $('#cur'), curT = $('#curT'), chip = $('#chip'), hx = $('#xh .hx'), vx = $('#xh .vx'), xy = $('#xy');
let chipX = 0, chipY = 0, chipR = 0;
addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; moved = true; cur.classList.add('on');
  const t = e.target.closest ? e.target : document.body, tag = t.closest('[data-cursor]'), row = t.closest('[data-chip]');
  cur.classList.toggle('tag', !!tag); if (tag) curT.textContent = T(dragging ? 'curDrag' : tag.dataset.cursor);
  cur.classList.toggle('link', !tag && !!t.closest('a, button, .xrow, input, textarea'));
  chip.classList.toggle('on', !!row); if (row) chip.textContent = row.dataset.chip;
  xy.classList.toggle('on', !tag && !row); xy.textContent = pad(Math.round(px), 4) + ', ' + pad(Math.round(py), 4); });
addEventListener('pointerdown', () => cur.classList.add('down')); addEventListener('pointerup', () => cur.classList.remove('down'));
document.addEventListener('pointerleave', () => { cur.classList.remove('on'); xy.classList.remove('on'); });
const menuBtn = $('#menuBtn'); menuBtn.addEventListener('pointerenter', () => scramble($('#menuT'), $('#menuT').textContent));

/* magnetic buttons */
$$('.mag').forEach(b => { const s = $('span', b);
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    b.style.transform = `translate(${x * .3}px,${y * .4}px)`; s.style.transform = `translate(${x * .15}px,${y * .2}px)`; b.style.transition = s.style.transition = 'transform .15s'; });
  b.addEventListener('pointerleave', () => { b.style.transition = s.style.transition = 'transform .9s cubic-bezier(.19,1,.22,1), color .4s'; b.style.transform = s.style.transform = ''; }); });

/* contact form: opens the visitor's mail app, like v1 */
const form = $('#form'), send = $('#send');
form.addEventListener('input', () => send.disabled = !form.message.value.trim());
form.addEventListener('submit', e => { e.preventDefault(); if (send.disabled) return; const lab = $('span', send);
  const body = form.message.value + (form.name.value ? '\n\n' + form.name.value : '') + (form.email.value ? '\n' + form.email.value : '');
  location.href = 'mailto:info@eslamshamy.com?subject=' + encodeURIComponent(form.subject.value || 'Hello') + '&body=' + encodeURIComponent(body);
  lab.textContent = T('sending'); setTimeout(() => lab.textContent = T('send'), 2500); });
const toast = $('#toast');
$('#mail').addEventListener('click', async () => { try { await navigator.clipboard.writeText('info@eslamshamy.com'); toast.textContent = T('copied'); } catch (e) { toast.textContent = 'info@eslamshamy.com'; }
  toast.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('on'), 1800); });

/* ---------- menu + navigation ---------- */
const setMenu = on => { document.body.classList.toggle('menu', on); menuBtn.setAttribute('aria-expanded', on); $('#menu').setAttribute('aria-hidden', !on); scramble($('#menuT'), T(on ? 'close' : 'menu')); };
menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu')));
$$('.menu-in a').forEach((a, i) => a.style.setProperty('--i', i));
/* page-to-page: five columns drop, then we leave */
endcard.addEventListener('click', e => { e.preventDefault(); if (wasDrag) return; document.body.classList.add('leaving'); setTimeout(() => location.href = endcard.href, 900); });
addEventListener('pageshow', () => document.body.classList.remove('leaving'));
/* menu: Work goes straight to the full projects page */
$$('a[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => { location.href = a.href; }, 900); }));
document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; e.preventDefault(); const el = $(a.getAttribute('href'));
  const go = () => scrollTo({ top: el.id === 'hero' ? 0 : el.offsetTop - (el.id === 'work' ? 0 : 40), behavior: 'smooth' });
  if (document.body.classList.contains('menu')) { setMenu(false); setTimeout(go, 450); } else go(); });
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const tickClock = () => { const v = fmt.format(new Date()); $$('.clk').forEach(el => el.textContent = v); }; tickClock(); setInterval(tickClock, 1000);

/* ---------- layout ---------- */
const work = $('#work'), pin = $('#pin'), hero = $('#hero'), nav = $('#nav'), giant = $('#giant'), contact = $('#contact');
let trackW = 0, workTop = 0, span = 1, activeCard = -2, tx = 0;
function measure() { W = innerWidth; H = innerHeight; trackW = track.scrollWidth; span = Math.max(1, trackW - W); work.style.height = span + H + 'px'; workTop = work.offsetTop; }
let rsT; addEventListener('resize', () => { measure(); clearTimeout(rsT); rsT = setTimeout(() => buildTargets(false), 200); });
const cardY = i => { const c = cards[i].el.getBoundingClientRect(), t = track.getBoundingClientRect(), d = rtl() ? t.right - c.right : c.left - t.left; return workTop + clamp(d - (W - c.width) / 2, 0, span); };
addEventListener('keydown', e => {
  if (e.key === 'Escape') return setMenu(false);
  if (document.body.classList.contains('pg') || (e.target.closest && e.target.closest('input, textarea'))) return;
  const y = scrollY; if (y < workTop - 10 || y > workTop + span + 10) return;
  let d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); if (rtl()) d = -d;
  const i = Math.max(-1, activeCard) + d; if (i < 0) scrollTo({ top: workTop, behavior: 'smooth' }); else if (i < N) scrollTo({ top: cardY(i), behavior: 'smooth' });
});
let dragging = false, wasDrag = false, dragX = 0, dragMoved = 0;
pin.addEventListener('pointerdown', e => { if (e.button) return; dragging = true; wasDrag = false; dragX = e.clientX; dragMoved = 0; pin.classList.add('drag'); });
addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - dragX; dragX = e.clientX; dragMoved += Math.abs(dx); if (dragMoved > 6) wasDrag = true; scrollBy(0, dx * (rtl() ? 1.6 : -1.6)); });
const endDrag = () => { dragging = false; pin.classList.remove('drag'); setTimeout(() => wasDrag = false, 50); }; addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);

/* ---------- front page: dots drift in, spell three lines, then draw the journey ---------- */
const pts = $('#pts'), pc = pts.getContext('2d'), heroC = $('.hero-c'), tagEl = $('.tagline');
let P = [], pdpr = 1, dot = 2, dotTo = 2, textMid = 0, si = -1, elapsed = 0, stageT = 0, lastDraw = 0, capT;
const SCATTER_MS = 2400, LOOP_TO = 2; // after the last shape, return to the quote
const SEQ = [{ txt: 0, ms: 4500 }, { txt: 1, ms: 4800 }, { txt: 2, ms: 10000, cap: () => T('quoteBy') },
  { shape: 'towers', j: 0, ms: 6000 }, { shape: 'pyramids', j: 1, ms: 6000 }, { shape: 'bridge', j: 2, ms: 6000 }, { shape: 'bauhaus', j: 3, ms: 6500 }, { shape: 'dome', j: 4, ms: 6500 }];
/* each shape is drawn solid into a box (x, y, w, h); the dots then fill whatever is painted */
const SHAPES = {
  towers(o, x, y, w, h) { // Manama: two sail towers joined by three bridges
    o.beginPath(); o.moveTo(x + w * .2, y + h * .96); o.quadraticCurveTo(x + w * .3, y + h * .3, x + w * .455, y); o.lineTo(x + w * .455, y + h * .96); o.closePath(); o.fill();
    o.beginPath(); o.moveTo(x + w * .8, y + h * .96); o.quadraticCurveTo(x + w * .7, y + h * .3, x + w * .545, y); o.lineTo(x + w * .545, y + h * .96); o.closePath(); o.fill();
    [.3, .5, .7].forEach(k => { o.fillRect(x + w * .455, y + h * k, w * .09, h * .022); o.beginPath(); o.arc(x + w * .5, y + h * k + h * .011, h * .05, 0, 6.283); o.fill(); });
    o.fillRect(x + w * .08, y + h * .96, w * .84, h * .04); },
  pyramids(o, x, y, w, h) { // Cairo
    const tri = (a, b, c) => { o.beginPath(); o.moveTo(x + w * a, y + h * .96); o.lineTo(x + w * b, y + h * c); o.lineTo(x + w * (2 * b - a), y + h * .96); o.closePath(); o.fill(); };
    tri(.2, .5, .06); tri(.0, .17, .52); tri(.68, .84, .44); o.beginPath(); o.arc(x + w * .9, y + h * .14, h * .07, 0, 6.283); o.fill(); o.fillRect(x, y + h * .96, w, h * .04);
    o.globalCompositeOperation = 'destination-out'; o.lineWidth = Math.max(2, h * .012); for (let k = .26; k < .95; k += .14) { o.beginPath(); o.moveTo(x, y + h * k); o.lineTo(x + w, y + h * k); o.stroke(); } o.globalCompositeOperation = 'source-over'; },
  bridge(o, x, y, w, h) { // Venice
    o.beginPath(); o.moveTo(x, y + h * .62); o.lineTo(x + w * .14, y + h * .62); o.lineTo(x + w * .5, y + h * .2); o.lineTo(x + w * .86, y + h * .62); o.lineTo(x + w, y + h * .62); o.lineTo(x + w, y + h * .78); o.lineTo(x, y + h * .78); o.closePath(); o.fill();
    o.fillRect(x + w * .36, y + h * .1, w * .28, h * .2); o.beginPath(); o.moveTo(x + w * .34, y + h * .1); o.lineTo(x + w * .5, y); o.lineTo(x + w * .66, y + h * .1); o.closePath(); o.fill();
    o.globalCompositeOperation = 'destination-out'; o.beginPath(); o.ellipse(x + w * .5, y + h * .8, w * .27, h * .36, 0, 0, 6.283); o.fill();
    o.beginPath(); o.arc(x + w * .5, y + h * .2, h * .06, Math.PI, 0); o.rect(x + w * .5 - h * .06, y + h * .2, h * .12, h * .1); o.fill();
    for (let i = 0; i < 5; i++) [-1, 1].forEach(s => { const cx = x + w * (.5 + s * (.11 + i * .065)), cy = y + h * (.33 + i * .076); o.beginPath(); o.arc(cx, cy, h * .028, Math.PI, 0); o.rect(cx - h * .028, cy, h * .056, h * .07); o.fill(); });
    o.globalCompositeOperation = 'source-over'; o.lineWidth = Math.max(2, h * .022); o.lineCap = 'round';
    [.88, .97].forEach((k, r) => { o.beginPath(); for (let i = 0; i <= 60; i++) { const px2 = x + w * i / 60, py2 = y + h * k + Math.sin(i * .7 + r * 2) * h * .014; i ? o.lineTo(px2, py2) : o.moveTo(px2, py2); } o.stroke(); }); },
  bauhaus(o, x, y, w, h) { // Dessau: the sign block and the glass workshop wing
    o.fillRect(x, y, w * .17, h * .94); o.fillRect(x + w * .17, y + h * .3, w * .83, h * .64); o.fillRect(x - w * .02, y + h * .94, w * 1.04, h * .06);
    o.globalCompositeOperation = 'destination-out'; o.lineWidth = Math.max(2, h * .014);
    for (let i = 1; i < 21; i++) { const gx = x + w * (.19 + i * .0385); o.beginPath(); o.moveTo(gx, y + h * .36); o.lineTo(gx, y + h * .88); o.stroke(); }
    [.36, .49, .62, .75, .88].forEach(k => { o.beginPath(); o.moveTo(x + w * .19, y + h * k); o.lineTo(x + w * .98, y + h * k); o.stroke(); });
    o.save(); o.translate(x + w * .085, y + h * .47); o.rotate(Math.PI / 2); o.font = '800 100px Archivo, sans-serif'; const m = o.measureText('BAUHAUS').width, fs = 100 * h * .8 / m;
    o.font = `800 ${fs}px Archivo, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.direction = 'ltr'; o.fillText('BAUHAUS', 0, 0); o.restore(); o.globalCompositeOperation = 'source-over'; },
  dome(o, x, y, w, h) { // Plymouth: the 360 dome
    const cx = x + w / 2, by = y + h * .9, r = Math.min(w * .5, h * .88);
    o.beginPath(); o.arc(cx, by, r, Math.PI, 0); o.closePath(); o.fill(); o.fillRect(cx - r * 1.08, by, r * 2.16, h * .06);
    o.globalCompositeOperation = 'destination-out'; o.lineWidth = Math.max(2, h * .013);
    [.28, .55, .8].forEach(k => { o.beginPath(); o.ellipse(cx, by, r * k, r, 0, Math.PI, 0); o.stroke(); }); o.beginPath(); o.moveTo(cx, by); o.lineTo(cx, by - r); o.stroke();
    [.3, .58, .82].forEach(k => { const yy = by - r * k, rx = Math.sqrt(1 - k * k) * r; o.beginPath(); o.ellipse(cx, yy, rx, rx * .12, 0, 0, Math.PI); o.stroke(); });
    o.beginPath(); o.arc(cx, by, r * .16, Math.PI, 0); o.fill(); o.globalCompositeOperation = 'source-over'; },
};
function fitLines(o, text, isAr, maxW, maxH, font) { // pick the line count that lets the type be largest
  const words = text.split(' '); let best = null;
  for (let L = 1; L <= Math.min(5, words.length); L++) { const tg = text.length / L, lines = []; let cu = '';
    words.forEach(x => { if (cu && lines.length < L - 1 && (cu + ' ' + x).length > tg * 1.08) { lines.push(cu); cu = x; } else cu = cu ? cu + ' ' + x : x; }); lines.push(cu);
    o.font = font(200); const mw = Math.max(...lines.map(l => o.measureText(l).width)), lh = isAr ? 1.32 : 1.02, fs = Math.min(200 * maxW / mw, maxH / (lines.length * lh));
    if (!best || fs > best.fs * 1.02) best = { fs, lines, lh }; }
  return best;
}
/* targets for each step are worked out once and kept, and the next step is prepared ahead of time, so a change never stalls a frame */
const tgCache = new Map();
function getTargets(i) {
  const hh = hero.offsetHeight, mob = W < 768, isAr = rtl(), st = SEQ[i], mid = hh * .45, tg = []; if (!W || !hh) return null;
  if (!st) { const n = mob ? 1500 : 3200; for (let k = 0; k < n; k++) tg.push([Math.random() * W, hh * (.06 + Math.random() * .86)]); tg.sort((p, q) => p[0] - q[0]); return { tg, dot: 2, maxY: hh * .6 }; }
  const key = [i, lang, W, hh].join('|'); if (tgCache.has(key)) return tgCache.get(key);
  const o = document.createElement('canvas').getContext('2d', { willReadFrequently: true }); o.canvas.width = W; o.canvas.height = hh; let g = 3.2;
  if (st.shape) { const bw = Math.min(W * (mob ? .82 : .46), hh * .42 * 1.8), bh = bw / 1.8; SHAPES[st.shape](o, (W - bw) / 2, mid - bh / 2, bw, bh); if (mob) g = 2.8; }
  else { const font = s => `${isAr ? 700 : 800} ${s}px ${isAr ? '"Readex Pro"' : 'Archivo'}, sans-serif`;
    const L = fitLines(o, T('heroSeq')[st.txt], isAr, W * (mob ? .86 : .8), hh * (mob ? .46 : .42), font), fs = Math.min(L.fs, hh * .27);
    o.font = font(fs); o.textAlign = 'center'; o.textBaseline = 'middle'; o.direction = isAr ? 'rtl' : 'ltr';
    L.lines.forEach((l, k) => o.fillText(l, W / 2, mid + (k - (L.lines.length - 1) / 2) * fs * L.lh)); g = clamp(fs / 26, 2.2, 3.6); }
  const y0 = Math.floor(hh * .08), y1 = Math.ceil(hh * .86), d = o.getImageData(0, y0, W, y1 - y0).data; let maxY = 0;
  for (let y = y0; y < y1; y += g) for (let x = 0; x < W; x += g) if (d[(((y | 0) - y0) * W + (x | 0)) * 4 + 3] > 128) { tg.push([x, y]); if (y > maxY) maxY = y; }
  tg.sort((p, q) => p[0] - q[0]); const res = { tg, dot: g * .58, maxY }; tgCache.set(key, res); return res;
}
function buildTargets(soft) {
  const hh = hero.offsetHeight, isAr = rtl(); if (!W || !hh) return;
  pdpr = Math.min(devicePixelRatio || 1, 2); const nw = Math.round(W * pdpr), nh = Math.round(hh * pdpr); if (pts.width !== nw || pts.height !== nh) { pts.width = nw; pts.height = nh; }
  textMid = hh * .45; const res = getTargets(si); if (!res) return; const tg = res.tg, st = SEQ[si], maxY = res.maxY; dotTo = res.dot; if (!soft) dot = dotTo;
  const n = tg.length; if (!n) return;
  /* soft hand-over: survivors keep their left-to-right order so nobody crosses the page; surplus dots fade out, new ones fade in where they belong */
  const alive = P.filter(p => !p.dead), dying = P.filter(p => p.dead);
  for (let i = alive.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0, a = alive[i]; alive[i] = alive[j]; alive[j] = a; }
  const keep = alive.slice(0, n).sort((a, b) => a.x - b.x); alive.slice(n).forEach(p => { p.dead = true; dying.push(p); });
  const fresh = new Set(); while (fresh.size < n - keep.length) fresh.add(Math.random() * n | 0);
  const next = []; let k = 0;
  tg.forEach((q, i) => { let p;
    if (fresh.has(i)) { const a = Math.random() * 6.283, r = .3 + Math.random(), far = !st || !introT; p = { x: q[0] + (far ? 0 : (Math.random() - .5) * 60), y: q[1] + (far ? 0 : (Math.random() - .5) * 60), vx: 0, vy: 0, a: 0, rx: Math.cos(a) * r, ry: Math.sin(a) * r, hot: Math.random() < .045 }; p.tx = p.x; p.ty = p.y; }
    else p = keep[k++];
    p.ox = p.tx; p.oy = p.ty; p.tx = q[0]; p.ty = q[1]; p.dl = soft ? (isAr ? 1 - q[0] / W : q[0] / W) * 700 + Math.random() * 700 : 0; next.push(p); });
  P = next.concat(dying); stageT = performance.now();
  const capTop = Math.round(maxY + Math.max(26, hh * .045)) + 'px';
  const cap = !st ? '' : st.cap ? st.cap() : st.shape ? T('journey')[st.j] : ''; clearTimeout(capT); tagEl.classList.remove('show');
  capT = setTimeout(() => { heroC.style.top = capTop; tagEl.textContent = cap; tagEl.classList.toggle('show', !!cap); }, soft ? 650 : 0);
  if (soft) setTimeout(() => getTargets(si + 1 >= SEQ.length ? LOOP_TO : si + 1), 1500);
}
function go(i) { si = i >= SEQ.length ? LOOP_TO : i; elapsed = 0; buildTargets(true); }
pts.addEventListener('click', () => { if (introT) go(si + 1); });
function drawPts(t, y) {
  const hh = pts.height / pdpr, now = performance.now(); pc.setTransform(pdpr, 0, 0, pdpr, 0, 0); pc.clearRect(0, 0, W, hh);
  if (introT) { elapsed += Math.min(100, now - (lastDraw || now)); if (elapsed > (si < 0 ? SCATTER_MS : SEQ[si].ms)) go(si + 1); } lastDraw = now;
  dot += (dotTo - dot) * .05;
  const D = clamp(y / (H * .8)), R = Math.min(130, W * .14), drift = si < 0, live = !!introT, since = now - stageT; let gone = false;
  const mx = moved && fine ? px : -999, my = moved && fine ? py + y : -999;
  for (let pass = 0; pass < 2; pass++) { pc.fillStyle = `rgb(${pass ? hot : ink})`;
    for (const p of P) { if (p.hot !== !!pass) continue;
      if (p.dead) { p.a -= .014; p.vx *= .96; p.vy *= .96; p.x += p.vx + p.rx * .25; p.y += p.vy + p.ry * .25; if (p.a <= .02) { gone = true; continue; } }
      else { p.a += ((live ? 1 : 0) - p.a) * (drift ? .018 : .03); const late = since < p.dl, bx = late ? p.ox : p.tx, by = late ? p.oy : p.ty;
        const gx = bx + p.rx * D * W * .55 + (drift ? Math.sin(t * .4 + p.ry * 9) * 16 : 0), gy = by + p.ry * D * H * .6 - D * 60 + (drift ? Math.cos(t * .33 + p.rx * 9) * 16 : 0), dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < R * R) { const dd = Math.sqrt(d2) || 1, f = 1 - dd / R; p.vx += dx / dd * f * f * 2.6; p.vy += dy / dd * f * f * 2.6; }
        p.vx = (p.vx + (gx - p.x) * .007) * .88; p.vy = (p.vy + (gy - p.y) * .007) * .88; p.x += p.vx; p.y += p.vy; }
      if (p.a < .02) continue; pc.globalAlpha = p.a > .98 ? 1 : p.a; pc.fillRect(p.x, p.y, dot, dot); } }
  pc.globalAlpha = 1; if (gone) P = P.filter(p => !p.dead || p.a > .02);
}

/* ---------- loop ---------- */
let last = performance.now(), ly = scrollY, vel = 0, mqX = 0, lastY = scrollY;
const railF = $('#railF'), pct = $('#pct'), mqIn = $('#mqIn'), rulerM = $('#rulerM');
render();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000), k = 1 - Math.pow(.001, dt), t = now / 1000, y = scrollY, R = rtl(); last = now;
  vel = lerp(vel, y - ly, .2); ly = y;

  cx = lerp(cx, px, fine ? .3 : 1); cy = lerp(cy, py, fine ? .3 : 1);
  cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; hx.style.transform = `translate3d(0,${py}px,0)`; vx.style.transform = `translate3d(${px}px,0,0)`;
  xy.style.transform = `translate3d(${px + (px > W - 120 ? -96 : 14)}px,${py + (py > H - 40 ? -24 : 14)}px,0)`;
  const ox = chipX; chipX = lerp(chipX, px + 18, .14); chipY = lerp(chipY, py + 18, .14); chipR = lerp(chipR, clamp((chipX - ox) * 1.2, -18, 18), .2);
  chip.style.transform = `translate3d(${chipX}px,${chipY}px,0) rotate(${chipR}deg)`;

  if (Math.abs(y - lastY) > 40) { nav.classList.toggle('hide', y > lastY && y > H * .6 && !document.body.classList.contains('menu')); lastY = y; }
  const sp = clamp(y / (document.documentElement.scrollHeight - H)); railF.style.transform = `scaleY(${sp})`; pct.textContent = pad(Math.round(sp * 100), 3);

  let si = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < H * .5) si = i; });
  document.body.classList.toggle('pg-off', !(y < H * .6 || si === secs.length - 1));
  if (si !== secI) { secI = si; scramble(secName, si ? T(secs[si].dataset.sec) : ''); }

  if (y < H * 1.15) drawPts(t, y);

  if (!mqW) mqW = mqIn.scrollWidth / 4;
  if (mqW) { mqX -= (60 + Math.abs(vel) * 14) * dt * (vel < -1 ? -1 : 1); if (mqX < -mqW) mqX += mqW; if (mqX > 0) mqX -= mqW;
    mqIn.style.transform = `translate3d(${R ? -mqX : mqX}px,0,0) skewX(${clamp(vel * -.5, -14, 14)}deg)`; }

  const p = clamp((y - workTop) / span); tx = lerp(tx, p * span * (R ? 1 : -1), k * 1.3);
  if (y > workTop - H && y < workTop + span + H) {
    track.style.transform = `translate3d(${tx}px,0,0) skewX(${clamp(vel * -.12, -4, 4)}deg)`;
    rulerM.style.insetInlineStart = p * 100 + '%';
    let best = -1, bd = 1e9;
    cards.forEach((c, i) => { const r = c.el.getBoundingClientRect(), mid = r.left + r.width / 2, d = Math.abs(mid - W / 2);
      if (d < bd) { bd = d; best = i; }
      if ((R ? r.right > W * .12 : r.left < W * .88) && y > workTop - H * .4) c.el.classList.add('in');
      if (r.right > 0 && r.left < W) { c.num.style.transform = `translate3d(${(mid - W / 2) * .16}px,0,0)`;
        const cv = c.cv, b = cv.getBoundingClientRect(), dp = Math.min(devicePixelRatio || 1, 2), cw = Math.round(b.width / 1.02 * dp), ch = Math.round(b.height / 1.02 * dp);
        if (cw > 0 && (Math.abs(cv.width - cw) > 40 || Math.abs(cv.height - ch) > 40)) { cv.width = cw; cv.height = ch; }
        if (cv.width) SCENES[PROJECTS[i].scene](cv.getContext('2d'), cv.width, cv.height, t); } });
    if (cards.length && p < .02) best = -1;
    if (best !== activeCard) { activeCard = best; rBtns.forEach((b, i) => b.classList.toggle('on', i === best)); }
  }

  const sr = state.getBoundingClientRect();
  if (sr.top < H && sr.bottom > 0) { const s2 = clamp((H * .82 - sr.top) / (sr.height + H * .25)), n = Math.floor(s2 * sWords.length * 1.05); sWords.forEach((w, i) => w.classList.toggle('on', i < n)); }
  const gr = contact.getBoundingClientRect();
  if (giant && gr.top < H) giant.style.transform = `translate3d(${clamp((gr.bottom - H) * -.12, -200, 200) + vel * -.6}px,0,0)`;
}
requestAnimationFrame(frame);
addEventListener('load', () => { measure(); buildTargets(false); });
document.fonts && document.fonts.ready.then(() => Promise.all([document.fonts.load('800 100px Archivo'), document.fonts.load('700 100px "Readex Pro"', 'إسلام')]).catch(() => {})).then(() => { mqW = 0; tgCache.clear(); measure(); buildTargets(false); getTargets(0); });
})();
