/* Shared by the inner pages (projects, case study): language, sheet colour, drafting cursor, progress rail, column curtain.
   Exposes window.Shell = { T, lang(), rtl(), onLang(fn) }. */
window.Shell = (() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const root = document.documentElement, fine = matchMedia('(hover: hover) and (pointer: fine)').matches, pad = (n, l = 2) => String(n).padStart(l, '0');
let lang = 'en'; try { if (localStorage.getItem('lang') === 'ar') lang = 'ar'; if (localStorage.getItem('sheet') === 'blue') root.classList.add('blue'); } catch (e) {}
const T = k => I18N[lang][k], rtl = () => lang === 'ar', subs = [];
const apply = () => { root.lang = lang; root.dir = rtl() ? 'rtl' : 'ltr'; $$('[data-i18n]').forEach(el => el.textContent = T(el.dataset.i18n));
  const tt = $('#themeT'); if (tt) tt.textContent = T(root.classList.contains('blue') ? 'blueprint' : 'paper'); subs.forEach(f => f()); };
const wipe = (e, fn) => { root.style.setProperty('--tx', e.clientX + 'px'); root.style.setProperty('--ty', e.clientY + 'px'); document.startViewTransition && !document.hidden ? document.startViewTransition(fn) : fn(); };
$('#theme').addEventListener('click', e => wipe(e, () => { const b = root.classList.toggle('blue'); try { localStorage.setItem('sheet', b ? 'blue' : 'paper'); } catch (e) {} apply(); }));
$('#lang').addEventListener('click', e => wipe(e, () => { lang = rtl() ? 'en' : 'ar'; try { localStorage.setItem('lang', lang); } catch (e) {} apply(); }));

let W = innerWidth, H = innerHeight, px = W / 2, py = H / 2, cx = px, cy = py;
const cur = $('#cur'), curT = $('#curT'), hx = $('#xh .hx'), vx = $('#xh .vx'), xy = $('#xy'), railF = $('#railF'), pct = $('#pct');
addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; cur.classList.add('on'); const t = e.target.closest ? e.target : document.body, tag = t.closest('[data-cursor]');
  cur.classList.toggle('tag', !!tag); if (tag) curT.textContent = T(tag.dataset.cursor) || tag.dataset.cursor; cur.classList.toggle('link', !tag && !!t.closest('a, button, input'));
  xy.classList.toggle('on', !tag); xy.textContent = pad(Math.round(px), 4) + ', ' + pad(Math.round(py), 4); });
addEventListener('pointerdown', () => cur.classList.add('down')); addEventListener('pointerup', () => cur.classList.remove('down'));
document.addEventListener('pointerleave', () => { cur.classList.remove('on'); xy.classList.remove('on'); });
(function frame() { requestAnimationFrame(frame); W = innerWidth; H = innerHeight;
  cx = lerp(cx, px, fine ? .3 : 1); cy = lerp(cy, py, fine ? .3 : 1);
  cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; hx.style.transform = `translate3d(0,${py}px,0)`; vx.style.transform = `translate3d(${px}px,0,0)`;
  xy.style.transform = `translate3d(${px + (px > W - 120 ? -96 : 14)}px,${py + (py > H - 40 ? -24 : 14)}px,0)`;
  const sp = clamp(scrollY / Math.max(1, root.scrollHeight - H)); railF.style.transform = `scaleY(${sp})`; pct.textContent = pad(Math.round(sp * 100), 3); })();

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const tick = () => { const v = fmt.format(new Date()); $$('.clk').forEach(el => el.textContent = v); }; tick(); setInterval(tick, 1000);

/* leave and arrive through the column curtain */
document.addEventListener('click', e => { const a = e.target.closest('a.leave'); if (!a || e.metaKey || e.ctrlKey) return; e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => location.href = a.href, 900); });
addEventListener('pageshow', () => document.body.classList.remove('leaving'));
const arrive = () => requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('entering')));
return { T, lang: () => lang, rtl, onLang: f => subs.push(f), apply, arrive, pad, $, $$, clamp, lerp };
})();
