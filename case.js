/* Case-study page (case.html?id=imet), drawn from case-data.js where every text is [English, Arabic].
   The page is a picture story: a full-screen cover, then one pinned image that changes as short chapters scroll past,
   then the gallery as a strip. Long text from the data is cut to its first sentence; the fine print sits collapsed at the end. */
(() => {
const { T, rtl, onLang, apply, arrive, pad, $, $$, clamp } = Shell;
const D = window.CASES_DATA, ids = Object.keys(D.cases), id = new URLSearchParams(location.search).get('id'), C = D.cases[id];
if (!C) { location.replace('projects.html'); return; }
const B = x => Array.isArray(x) ? x[rtl() ? 1 : 0] : (x == null ? '' : x);            // pick the language
const em = s => String(s).replace(/\*(.+?)\*/g, '<em>$1</em>');                         // *word* becomes the highlight
const paras = p => !p ? [] : (Array.isArray(p) && Array.isArray(p[0]) ? p : [p]);
const first = s => { s = String(s); const m = s.match(/^.*?[.!?؟](?=\s|$)/); return m ? m[0] : s; };   // first sentence only
const esc = s => String(s).replace(/"/g, '&quot;');
const main = $('#cs'); let shots = [], lbI = 0, beatIO;

function render() {
  document.title = B(C.title); $('#csName').textContent = B(C.name);
  const bl = C.blocks, hero = bl.find(b => b.type === 'hero') || {}, of = t => bl.filter(b => b.type === t);
  const stats = bl.flatMap(b => b.stats || []), gal = of('gallery'), shotsAll = gal.flatMap(g => g.items);

  /* chapters: one short beat per idea, each tied to a picture */
  const beats = [];
  bl.forEach(b => {
    if (b.type === 'text') beats.push({ k: B(b.k), h: B(b.h), p: first(B(paras(b.p)[0] || '')) });
    else if (b.type === 'steps' || b.type === 'cards') beats.push({ k: B(b.k), h: B(b.h), list: (b.steps || b.cards).map(s => [B(s[0]), B(s[1])]) });
    else if (b.type === 'story') b.steps.forEach(s => beats.push({ k: B(b.k), h: B(s[0]), p: first(B(s[1])), img: s[2] }));
  });
  const used = new Set(beats.map(b => b.img).filter(Boolean)), pool = [...new Set(shotsAll.map(s => s[1]))].filter(s => !used.has(s) && !/\.svg$/.test(s));
  let pi = 0, prev = hero.img || null; beats.forEach(b => { if (!b.img) b.img = pool[pi++] || prev; prev = b.img || prev; });
  const vis = [...new Set(beats.map(b => b.img).filter(Boolean))];

  const next = ids[(ids.indexOf(id) + 1) % ids.length], ar = rtl() ? '↖' : '↗';
  main.innerHTML = `
  <section class="cs-top${hero.img ? '' : ' plain'}">${hero.img ? `<img src="${hero.img}" alt="" onerror="this.parentNode.classList.add('plain');this.remove()">` : ''}
    <div class="cs-top-in"><p class="mono">${B(hero.k)}</p><h1>${em(B(hero.h))}</h1><p class="lead">${first(B(hero.p))}</p>
      ${hero.chips ? `<div class="cs-chips mono">${hero.chips.map(c => `<span>${B(c)}</span>`).join('')}</div>` : ''}</div>
    <dl class="mono">${(hero.meta || []).map(m => `<div><dt>${B(m[0])}</dt><dd>${B(m[1])}</dd></div>`).join('')}</dl></section>
  ${stats.length ? `<div class="cs-stats rv">${stats.map(s => `<div><b data-count="${s[0]}" data-suf="${esc(B(s[1]))}" dir="ltr">0</b><span class="mono">${B(s[2])}</span></div>`).join('')}</div>` : ''}
  ${beats.length ? `<section class="cs-st${vis.length ? '' : ' novis'}"><div class="cs-vis">${vis.map((s, i) => `<img src="${s}" alt="" class="${i ? '' : 'on'}" onerror="this.style.display='none'">`).join('')}<span class="mono ct" dir="ltr"></span><i class="bar"></i></div>
    <div class="cs-beats">${beats.map((b, i) => `<article class="cs-beat${i ? '' : ' on'}" data-v="${vis.indexOf(b.img)}" data-i="${i}">${b.img ? `<img src="${b.img}" alt="" loading="lazy" onerror="this.remove()">` : ''}
      <span class="mono dim"><b dir="ltr">${pad(i + 1)}</b> — ${b.k}</span><h2>${em(b.h)}</h2>${b.p ? `<p>${em(b.p)}</p>` : ''}
      ${b.list ? `<ul>${b.list.map((l, k) => `<li tabindex="0"><span class="mono" dir="ltr">${pad(k + 1)}</span><div><b>${l[0]}</b><small>${em(l[1])}</small></div></li>`).join('')}</ul>` : ''}</article>`).join('')}</div></section>` : ''}
  ${of('toy').map(b => `<section class="cs-sec rv"><header class="cs-sh"><span class="mono dim">${B(b.k)}</span><h2>${em(B(b.h))}</h2></header><div class="cs-toy"><canvas id="toy" data-cursor="curPlay"></canvas><button type="button" class="btn" id="toyBtn"><span>${B(D.ui.toyBtn)}</span></button></div></section>`).join('')}
  ${of('compare').map(b => `<section class="cs-sec rv"><header class="cs-sh"><span class="mono dim">${B(b.k)}</span><h2>${em(B(b.h))}</h2></header><div class="cs-cmp" style="--x:50%"><img src="${b.b[0]}" alt=""><img class="top" src="${b.a[0]}" alt=""><span class="mono la">${B(b.a[1])}</span><span class="mono lb">${B(b.b[1])}</span><i></i><input type="range" min="0" max="100" value="50" aria-label="${esc(B(D.ui.slide))}"></div></section>`).join('')}
  ${of('quote').map(b => `<section class="cs-quote rv"><blockquote>${em(B(b.q))}</blockquote><cite class="mono">${B(b.by)}</cite></section>`).join('')}
  ${shotsAll.length ? `<section class="cs-sec rv"><header class="cs-sh"><span class="mono dim">${B(gal[0].k)} · <span dir="ltr">${pad(shotsAll.length)}</span></span><h2>${em(B(gal[0].h))}</h2></header>
    <div class="cs-strip" data-cursor="curDrag">${shotsAll.map(it => `<figure data-shot="${it[1]}" data-cap="${esc(B(it[2]))}"><img src="${it[1]}" alt="" loading="lazy" draggable="false" onerror="this.parentNode.remove()"><figcaption class="mono">${B(it[2])}</figcaption></figure>`).join('')}</div></section>` : ''}
  ${of('timeline').map(b => `<section class="cs-sec rv"><header class="cs-sh"><span class="mono dim">${B(b.k)}</span><h2>${em(B(b.h))}</h2></header><ol class="cs-tl">${b.items.map(it => `<li><span class="mono">${B(it[0])}</span><p>${em(B(it[1]))}</p></li>`).join('')}</ol></section>`).join('')}
  ${of('accordion').length ? `<section class="cs-sec cs-more rv"><p class="mono dim">${T('caseMore')}</p>${of('accordion').flatMap(b => b.items).map((it, i) => `<div class="rrow"><button type="button" aria-expanded="false"><span class="mono" dir="ltr">${pad(i + 1)}</span><span class="t">${B(it[0])}</span><span></span><i class="pm"></i></button><div class="more"><div><p>${em(B(it[1]))}</p></div></div></div>`).join('')}</section>` : ''}
  ${of('links').map(b => `<section class="cs-links rv"><div class="c-row">${b.links.map(l => `<a class="btn" href="${l[1]}" target="_blank" rel="noopener"><span>${B(l[0])} ${ar}</span></a>`).join('')}</div></section>`).join('')}
  <a class="cs-next leave" href="case.html?id=${next}" data-cursor="curOpen"><span class="mono">${B(D.ui.nextProject)}</span><b>${B(D.cases[next].name)}</b><i>${rtl() ? '←' : '→'}</i></a>`;

  $$('.rv', main).forEach(el => io.observe(el));
  $$('.rrow > button', main).forEach(b => b.addEventListener('click', () => { const row = b.parentElement, open = !row.classList.contains('open'); row.classList.toggle('open', open); b.setAttribute('aria-expanded', open); }));
  $$('.cs-cmp input', main).forEach(r => r.addEventListener('input', () => r.parentElement.style.setProperty('--x', r.value + '%')));
  const toy = $('#toy'); if (toy) { const paint = () => compose(toy); toy.addEventListener('click', paint); $('#toyBtn').addEventListener('click', paint); requestAnimationFrame(paint); }

  /* the pinned picture follows whichever chapter is in the middle of the screen */
  const vEl = $('.cs-vis', main), bEls = $$('.cs-beat', main), vImgs = vEl ? $$('img', vEl) : [];
  if (beatIO) beatIO.disconnect();
  beatIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const i = +e.target.dataset.i, v = +e.target.dataset.v;
    bEls.forEach((b, k) => b.classList.toggle('on', k === i)); vImgs.forEach((im, k) => im.classList.toggle('on', k === v));
    $('.ct', vEl).textContent = pad(i + 1) + ' / ' + pad(bEls.length); $('.bar', vEl).style.width = (i + 1) / bEls.length * 100 + '%'; }), { rootMargin: '-45% 0px -45% 0px' });
  bEls.forEach(b => beatIO.observe(b));

  /* gallery strip: drag sideways, click to open */
  shots = $$('[data-shot]', main); const strip = $('.cs-strip', main);
  if (strip) { let down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; moved = 0; strip.classList.add('drag'); });
    addEventListener('pointermove', e => { if (!down) return; moved = Math.abs(e.clientX - sx); strip.scrollLeft = sl - (e.clientX - sx); });
    addEventListener('pointerup', () => { down = false; strip.classList.remove('drag'); });
    shots.forEach((f, i) => f.addEventListener('click', () => { if (moved < 6) show(i); })); }
}
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
  $$('[data-count]', e.target).forEach(el => { const n = +el.dataset.count, s = el.dataset.suf || '', a = performance.now();
    (function f(now) { const p = clamp((now - a) / 1400), v = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(n * v) + s; if (p < 1) requestAnimationFrame(f); })(a); }); }), { threshold: .12 });

/* the cover drifts and darkens as you leave it */
addEventListener('scroll', () => { const im = $('.cs-top > img'); if (!im) return; const k = clamp(scrollY / innerHeight); im.style.transform = `translate3d(0,${k * 12}%,0) scale(${1.06 + k * .08})`; im.style.opacity = 1 - k * .5; }, { passive: true });

/* a small form generator for the Bauhausifier page */
function compose(cv) { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), w = cv.width = Math.round(r.width * d), h = cv.height = Math.round(r.height * d), c = cv.getContext('2d'), u = Math.min(w, h);
  c.fillStyle = '#efe8d8'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'multiply'; const inks = ['#e63b1f', '#1f3fd8', '#f2b90f', '#141414'];
  for (let i = 0; i < 9; i++) { const k = Math.random() * 5 | 0, s = u * (.06 + Math.random() * .2); c.save(); c.translate(w * (.1 + Math.random() * .8), h * (.12 + Math.random() * .76)); c.rotate((Math.random() * 8 | 0) * Math.PI / 4); c.fillStyle = inks[Math.random() * 4 | 0]; c.beginPath();
    if (k === 0) c.arc(0, 0, s, 0, 6.283); else if (k === 1) c.rect(-s, -s, s * 2, s * 2); else if (k === 2) { c.moveTo(0, -s * 1.15); c.lineTo(s, s * .6); c.lineTo(-s, s * .6); c.closePath(); } else if (k === 3) { c.arc(0, 0, s, 0, Math.PI); c.closePath(); } else c.rect(-s * 1.6, -s * .09, s * 3.2, s * .18);
    c.fill(); c.restore(); } c.globalCompositeOperation = 'source-over'; }

/* image viewer */
const lb = $('#lb');
function show(i) { if (!shots.length) return; lbI = i; paintLb(); lb.hidden = false; document.body.classList.add('lbopen'); }
function paintLb() { const f = shots[lbI]; $('#lbI').src = f.dataset.shot; $('#lbC').textContent = f.dataset.cap + '  ·  ' + pad(lbI + 1) + ' / ' + pad(shots.length); }
const move = d => { lbI = (lbI + d + shots.length) % shots.length; paintLb(); };
const closeLb = () => { lb.hidden = true; document.body.classList.remove('lbopen'); };
$('#lbX').addEventListener('click', closeLb); $('#lbP').addEventListener('click', () => move(rtl() ? 1 : -1)); $('#lbN').addEventListener('click', () => move(rtl() ? -1 : 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') move(rtl() ? -1 : 1); if (e.key === 'ArrowLeft') move(rtl() ? 1 : -1); });

onLang(render); apply(); arrive();
})();
