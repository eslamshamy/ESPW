/* One drawn, animated thumbnail per project (the rest live in scenes.js and projects-data.js).
   Every scene is (ctx, width, height, time). S2 clears the frame and hands over u = the shorter side. */
const S2 = (bg, f) => (c, w, h, t) => { c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.setLineDash([]); c.fillStyle = bg; c.fillRect(0, 0, w, h); c.lineCap = 'round'; c.lineJoin = 'round'; f(c, w, h, t, Math.min(w, h)); c.globalAlpha = 1; c.setLineDash([]); };
const lw = (c, u, k = 1) => c.lineWidth = Math.max(1, u * .006 * k);
const poly = (c, pts) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };

Object.assign(SCENES, {
  /* Bahrain Pavilion: a wind tower pulling cool air down */
  windtower: S2('#1b120c', (c, w, h, t, u) => { const x = w * .5, s = '#e8c98a';
    c.fillStyle = s; c.fillRect(x - u * .09, h * .16, u * .18, h * .5); c.fillRect(w * .22, h * .62, w * .56, h * .2); c.fillRect(w * .16, h * .82, w * .68, h * .03);
    c.fillStyle = '#1b120c'; for (let i = 0; i < 4; i++) c.fillRect(x - u * .07 + i * u * .04, h * .19, u * .022, h * .15); c.beginPath(); c.arc(x, h * .82, u * .07, Math.PI, 0); c.fill();
    c.strokeStyle = '#7fd0ff'; lw(c, u, 1.4); c.setLineDash([u * .03, u * .03]); c.lineDashOffset = -t * u * .12;
    for (let i = 0; i < 4; i++) { const y = h * (.12 + i * .045); c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * .25, y, x - u * .14, y - h * .02, x - u * .07 + i * u * .045, h * .26); c.lineTo(x - u * .07 + i * u * .045, h * .7); c.bezierCurveTo(x, h * .78, w * .7, h * (.7 + i * .03), w, h * (.66 + i * .05)); c.stroke(); }
    label(c, w, h, 'COOL MIGRATIONS', 'VENICE 2025'); }),

  /* New Lands: forgotten workers coming back into view */
  figures: S2('#14110d', (c, w, h, t, u) => { const cols = 13, rows = 4, gx = w * .84 / cols, gy = h * .62 / rows; lw(c, u, 1.3);
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const x = w * .08 + (k + .5) * gx, y = h * .16 + (r + .5) * gy, a = .12 + .88 * Math.pow(.5 + .5 * Math.sin(t * .8 - k * .45 - r * .9), 2), hot = (k * 7 + r * 3) % 17 === 0;
      c.globalAlpha = a; c.strokeStyle = c.fillStyle = hot ? '#ff5a36' : '#e9dcc0'; c.beginPath(); c.arc(x, y - gy * .22, gy * .1, 0, 6.283); c.fill();
      c.beginPath(); c.moveTo(x, y - gy * .1); c.lineTo(x, y + gy * .14); c.lineTo(x - gy * .09, y + gy * .36); c.moveTo(x, y + gy * .14); c.lineTo(x + gy * .09, y + gy * .36); c.moveTo(x - gy * .12, y); c.lineTo(x + gy * .12, y); c.stroke(); }
    c.globalAlpha = 1; label(c, w, h, 'NEW LANDS', '1914 — 1918'); }),

  /* DESSCOVER: a projector lighting five lost places */
  projector: S2('#0c0f1a', (c, w, h, t, u) => { const px = w * .14, py = h * .14, q = [[w * .3, h * .5], [w * .92, h * .44], [w * .98, h * .86], [w * .18, h * .9]];
    const g = c.createLinearGradient(px, py, w * .6, h * .7); g.addColorStop(0, 'rgba(255,225,120,.5)'); g.addColorStop(1, 'rgba(255,225,120,.04)'); c.fillStyle = g; poly(c, [[px, py], q[1], q[2], q[3]]); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; lw(c, u); for (let i = 0; i <= 6; i++) { const k = i / 6; c.beginPath(); c.moveTo(q[0][0] + (q[1][0] - q[0][0]) * k, q[0][1] + (q[1][1] - q[0][1]) * k); c.lineTo(q[3][0] + (q[2][0] - q[3][0]) * k, q[3][1] + (q[2][1] - q[3][1]) * k); c.stroke();
      c.beginPath(); c.moveTo(q[0][0] + (q[3][0] - q[0][0]) * k, q[0][1] + (q[3][1] - q[0][1]) * k); c.lineTo(q[1][0] + (q[2][0] - q[1][0]) * k, q[1][1] + (q[2][1] - q[1][1]) * k); c.stroke(); }
    const on = Math.floor(t * .9) % 5; [[.42, .6], [.62, .56], [.8, .7], [.5, .78], [.7, .82]].forEach((p, i) => { const a = i === on; c.fillStyle = a ? '#ffd24a' : 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(w * p[0], h * p[1], u * (a ? .035 + .008 * Math.sin(t * 6) : .016), 0, 6.283); c.fill(); });
    c.fillStyle = '#f1edff'; c.fillRect(px - u * .06, py - u * .04, u * .12, u * .08); c.beginPath(); c.arc(px + u * .07, py, u * .03, 0, 6.283); c.fill(); label(c, w, h, 'DESSCOVER', 'PLACE 0' + (on + 1) + ' / 05'); }),

  /* Biomorphic Shell: a lattice growing around a trunk */
  lattice: (() => { const r = rnd(41), N = []; for (let k = 0; k < 3; k++) for (let i = 0; i < 9 + k * 3; i++) { const a = i / (9 + k * 3) * 6.283 + r() * .3; N.push([Math.cos(a) * (.16 + k * .11 + r() * .03), Math.sin(a) * (.16 + k * .11 + r() * .03) * .8]); }
    const E = []; N.forEach((p, i) => N.forEach((q, j) => { if (j > i && Math.hypot(p[0] - q[0], p[1] - q[1]) < .15) E.push([i, j]); }));
    return S2('#0c120c', (c, w, h, t, u) => { const cx = w / 2, cy = h * .5, n = Math.min(E.length, Math.floor((t * 9) % (E.length + 30)));
      c.fillStyle = '#5a4634'; c.fillRect(cx - u * .035, 0, u * .07, h); c.strokeStyle = '#b9e08a'; lw(c, u, 1.6);
      for (let i = 0; i < n; i++) { const a = N[E[i][0]], b = N[E[i][1]]; c.beginPath(); c.moveTo(cx + a[0] * u, cy + a[1] * u); c.lineTo(cx + b[0] * u, cy + b[1] * u); c.stroke(); }
      c.fillStyle = '#eaffd0'; N.forEach(p => { c.beginPath(); c.arc(cx + p[0] * u, cy + p[1] * u, u * .009, 0, 6.283); c.fill(); }); label(c, w, h, 'BIOMORPHIC SHELL', 'BIO-PRINT'); }); })(),

  /* Parametric Pottery and the trophy share one lathe: a profile spun around an axis */
  lathe: S2('#14110f', (c, w, h, t, u) => spin(c, w, h, t, u, y => .12 + .1 * Math.sin(y * 5 + t * .8) * Math.sin(y * 2.2) + .07 * y, '#f1ece2', 'PARAMETRIC POTTERY', 'PORCELAIN')),
  trophy: S2('#0c0c12', (c, w, h, t, u) => spin(c, w, h, t, u, y => y < .12 ? .17 : y < .2 ? .05 : y < .42 ? .035 : .04 + .2 * Math.pow((y - .42) / .58, .55), '#f2c94c', '3D PROJECTS', 'TROPHY')),

  /* Holodeck: a room seen through a headset */
  vr: S2('#0a0d18', (c, w, h, t, u) => { const cx = w / 2, cy = h * .42; c.strokeStyle = 'rgba(120,170,255,.6)'; lw(c, u);
    for (let i = 0; i < 6; i++) { const k = ((i + (t * .35) % 1) / 6) ** 2, rw = w * (.06 + k * .6), rh = h * (.05 + k * .55); c.globalAlpha = .25 + k * .75; c.strokeRect(cx - rw, cy - rh, rw * 2, rh * 2); }
    c.globalAlpha = .5; [[0, 0], [w, 0], [0, h], [w, h]].forEach(p => { c.beginPath(); c.moveTo(cx, cy); c.lineTo(p[0], p[1]); c.stroke(); }); c.globalAlpha = 1;
    const gw = u * .5, gh = u * .2, gx = cx - gw / 2, gy = h * .68; c.fillStyle = '#f1f4ff'; c.beginPath(); c.roundRect ? c.roundRect(gx, gy, gw, gh, gh * .35) : c.rect(gx, gy, gw, gh); c.fill();
    c.fillStyle = '#0a0d18'; [-1, 1].forEach(s => { c.beginPath(); c.arc(cx + s * gw * .22, gy + gh / 2, gh * .3, 0, 6.283); c.fill(); }); c.fillStyle = '#6ea0ff'; [-1, 1].forEach(s => { c.beginPath(); c.arc(cx + s * gw * .22 + Math.sin(t) * gh * .06, gy + gh / 2, gh * .12, 0, 6.283); c.fill(); });
    label(c, w, h, 'HOLODECK DESSAU', 'VR'); }),

  /* EONS: eight-point stars joined at nodes */
  star: S2('#0f0d14', (c, w, h, t, u) => { const s = u * .3; c.strokeStyle = '#e9b84a'; lw(c, u, 1.3);
    for (let y = -1; y < h / s + 1; y++) for (let x = -1; x < w / s + 1; x++) { const cx = x * s + s / 2, cy = y * s + s / 2, a = t * .25 * ((x + y) % 2 ? 1 : -1);
      for (let k = 0; k < 2; k++) { c.save(); c.translate(cx, cy); c.rotate(a + k * Math.PI / 4); c.strokeRect(-s * .3, -s * .3, s * .6, s * .6); c.restore(); }
      c.fillStyle = '#fff3d0'; c.beginPath(); c.arc(cx + s / 2, cy + s / 2, u * .012, 0, 6.283); c.fill(); }
    label(c, w, h, 'EONS', 'NODE SYSTEM'); }),

  /* The Fine Line: one border, two sides mirroring each other */
  border: S2('#101010', (c, w, h, t, u) => { const cx = w / 2, gy = h * .76, k = Math.sin(t * 2.4); c.fillStyle = '#1c1c1c'; c.fillRect(0, gy, w, h); c.fillStyle = '#e63b1f'; c.fillRect(cx - u * .006, 0, u * .012, h);
    [-1, 1].forEach(s => { c.strokeStyle = c.fillStyle = s < 0 ? '#f2efe8' : '#f2b90f'; lw(c, u, 2.2); const x = cx + s * w * .2, hy = gy - u * .42;
      c.beginPath(); c.arc(x, hy, u * .035, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(x, hy + u * .04); c.lineTo(x, gy - u * .17); c.lineTo(x - s * u * .02, gy); c.moveTo(x, gy - u * .17); c.lineTo(x - s * u * (.06 + .1 * Math.max(0, k)), gy - u * (.17 + .14 * Math.max(0, k)));
      c.moveTo(x, hy + u * .1); c.lineTo(x - s * u * .09, hy + u * (.02 - .06 * k)); c.stroke();
      const fx = cx + s * w * .38, fy = h * (.2 + .18 * (.5 + .5 * Math.sin(t * .6))); c.beginPath(); c.moveTo(fx, h * .1); c.lineTo(fx, gy); c.stroke(); c.fillRect(s < 0 ? fx : fx - u * .12, fy, u * .12, u * .07); });
    label(c, w, h, 'THE FINE LINE', 'PHOTO SERIES'); }),

  /* Digital Dessau: 26 landmarks on a tilted map */
  map: (() => { const r = rnd(26), P = Array.from({ length: 26 }, () => [r(), r(), r() * 6.28, r()]);
    return S2('#0d1320', (c, w, h, t, u) => { const cx = w / 2, cy = h * .3, a = u * .62, b = u * .3, iso = (x, y) => [cx + (x - y) * a, cy + (x + y) * b];
      c.strokeStyle = 'rgba(140,170,255,.28)'; lw(c, u); for (let i = 0; i <= 8; i++) { let p = iso(i / 8, 0), q = iso(i / 8, 1); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); p = iso(0, i / 8); q = iso(1, i / 8); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
      c.strokeStyle = '#6ea0ff'; lw(c, u, 2.5); c.beginPath(); for (let i = 0; i <= 20; i++) { const p = iso(i / 20, .5 + .18 * Math.sin(i * .5)); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
      P.slice().sort((p, q) => (p[0] + p[1]) - (q[0] + q[1])).forEach(p => { const g = iso(p[0], p[1]), hh = u * (.05 + .07 * Math.max(0, Math.sin(t * 1.2 + p[2]))); c.strokeStyle = '#f1edff'; lw(c, u, 1.2); c.beginPath(); c.moveTo(g[0], g[1]); c.lineTo(g[0], g[1] - hh); c.stroke();
        c.fillStyle = p[3] > .75 ? '#ff5a36' : p[3] > .5 ? '#ffd24a' : '#f1edff'; c.beginPath(); c.arc(g[0], g[1] - hh, u * .014, 0, 6.283); c.fill(); });
      label(c, w, h, 'DIGITAL DESSAU', '26 LANDMARKS'); }); })(),

  /* A2O: a page translated in place */
  translate: S2('#eef0f3', (c, w, h, t, u) => { const dw = w * .28, dh = h * .66, y = h * .14, scan = (t * .35) % 1.2;
    [[w * .12, 'A', '#15181b'], [w * .6, 'ع', '#1f3fd8']].forEach((d, k) => { c.fillStyle = '#fff'; c.strokeStyle = '#15181b'; lw(c, u, 1.5); c.fillRect(d[0], y, dw, dh); c.strokeRect(d[0], y, dw, dh);
      c.fillStyle = d[2]; c.font = `800 ${dh * .2}px ${k ? '"Readex Pro"' : 'Archivo'}, sans-serif`; c.textAlign = k ? 'right' : 'left'; c.textBaseline = 'top'; c.fillText(d[1], k ? d[0] + dw * .9 : d[0] + dw * .1, y + dh * .06);
      for (let i = 0; i < 6; i++) { const ly = y + dh * (.36 + i * .095), ll = dw * (.8 - (i * 37 % 5) * .08), done = !k || (i + 1) / 7 < scan; c.fillStyle = done ? (k ? '#1f3fd8' : '#9aa1a8') : '#dfe3e8'; c.fillRect(k ? d[0] + dw * .9 - ll : d[0] + dw * .1, ly, ll, dh * .035); } });
    c.textAlign = 'left'; c.fillStyle = '#e63b1f'; c.fillRect(w * .6, y + dh * Math.min(1, scan), dw, u * .008); c.strokeStyle = '#15181b'; lw(c, u, 2); c.beginPath(); c.moveTo(w * .44, h * .47); c.lineTo(w * .56, h * .47); c.moveTo(w * .53, h * .43); c.lineTo(w * .56, h * .47); c.lineTo(w * .53, h * .51); c.stroke();
    label(c, w, h, 'A2O', 'LAYOUT INTACT', '#15181b'); }),

  /* Graphic design: a wall of posters swapping places */
  poster: S2('#111', (c, w, h, t, u) => { const ink = ['#e63b1f', '#1f3fd8', '#f2b90f', '#f2efe8', '#111'], cols = 5, rows = 2, gw = w * .86 / cols, gh = h * .7 / rows, sw = Math.floor(t * 1.2);
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const i = r * cols + k, x = w * .07 + k * gw, y = h * .1 + r * gh, a = (i * 3 + sw * (i % 3 === sw % 3 ? 1 : 0)) % 4, s = Math.min(gw, gh) * .9;
      c.fillStyle = ink[a]; c.fillRect(x + gw * .06, y + gh * .06, gw * .88, gh * .88); c.fillStyle = ink[(a + 1 + i % 2) % 4]; c.beginPath(); const m = (i + sw) % 4, cx = x + gw / 2, cy = y + gh / 2;
      if (m === 0) c.arc(cx, cy, s * .28, 0, 6.283); else if (m === 1) c.rect(cx - s * .25, cy - s * .25, s * .5, s * .5); else if (m === 2) { c.moveTo(cx, cy - s * .3); c.lineTo(cx + s * .3, cy + s * .25); c.lineTo(cx - s * .3, cy + s * .25); } else c.rect(x + gw * .06, cy - s * .06, gw * .88, s * .12); c.fill(); }
    label(c, w, h, 'GRAPHIC DESIGN', 'IDENTITY · PRINT'); }),

  /* Video: a running film strip */
  film: S2('#0d1114', (c, w, h, t, u) => { const fw = w * .3, off = (t * w * .08) % fw, y = h * .2, fh = h * .56; c.fillStyle = '#1c2429'; c.fillRect(0, y - h * .07, w, fh + h * .14);
    for (let x = -off - fw; x < w + fw; x += fw) { const k = Math.round((x + off) / fw), g = c.createLinearGradient(x, y, x + fw, y + fh); g.addColorStop(0, ['#17a7d6', '#e63b1f', '#f2b90f', '#7a5cff'][((k % 4) + 4) % 4]); g.addColorStop(1, '#0d1114'); c.fillStyle = g; c.fillRect(x + fw * .04, y, fw * .92, fh);
      c.fillStyle = '#0d1114'; for (let i = 0; i < 4; i++) { c.fillRect(x + fw * (.08 + i * .25), y - h * .05, fw * .1, h * .03); c.fillRect(x + fw * (.08 + i * .25), y + fh + h * .02, fw * .1, h * .03); } }
    c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, y + fh / 2, u * .13, 0, 6.283); c.fill(); c.fillStyle = '#0d1114'; poly(c, [[w / 2 - u * .04, y + fh / 2 - u * .06], [w / 2 + u * .07, y + fh / 2], [w / 2 - u * .04, y + fh / 2 + u * .06]]); c.fill(); label(c, w, h, 'VIDEO', 'FILMS · MOTION'); }),

  /* Murrine: a glass cane cut across, ring inside ring */
  murrine: S2('#0e1418', (c, w, h, t, u) => { const cx = w / 2, cy = h * .48, ink = ['#f2efe8', '#2bb3a3', '#e63b1f', '#f2b90f', '#1f3fd8'];
    for (let r = 5; r >= 1; r--) { const n = 6 + r * 4, R = u * .085 * r, a0 = t * .2 * (r % 2 ? 1 : -1); for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283; c.fillStyle = ink[(r + i % 2) % 5]; c.beginPath(); c.ellipse(cx + Math.cos(a) * R, cy + Math.sin(a) * R, u * .04, u * .022, a, 0, 6.283); c.fill(); } }
    c.fillStyle = '#f2b90f'; c.beginPath(); c.arc(cx, cy, u * .04, 0, 6.283); c.fill(); label(c, w, h, 'MURRINE', 'SALT-MARSH GARDEN'); }),

  /* New Hope: a shelter raised from earth blocks */
  blocks: S2('#1a130d', (c, w, h, t, u) => { const bw = u * .1, bh = u * .05, cx = w / 2, base = h * .84, B = [];
    for (let r = 0; r < 12; r++) { const half = r < 7 ? 4 : 4 - (r - 6) * .8; if (half <= 0) break; for (let x = -half; x < half; x += 1) { const ox = (r % 2) * .5; if (x + ox + 1 > half + .01) continue; if (r < 4 && Math.abs(x + ox + .5) < .9) continue; B.push([cx + (x + ox) * bw, base - (r + 1) * bh, r]); } }
    const n = Math.min(B.length, Math.floor((t * 12) % (B.length + 36))); c.fillStyle = '#3a2a1c'; c.fillRect(0, base, w, h);
    for (let i = 0; i < n; i++) { const b = B[i]; c.fillStyle = `hsl(${22 + (i * 13) % 14} ${45 + (i * 7) % 20}% ${42 + (i * 5) % 16}%)`; c.fillRect(b[0] + 1, b[1] + 1, bw - 2, bh - 2); }
    label(c, w, h, 'NEW HOPE', 'EARTH BLOCKS'); }),

  /* Sakhir Oasis: a skin of living cells */
  cells: (() => { const r = rnd(77), P = Array.from({ length: 38 }, () => [r(), r(), r() * 6.28]);
    return S2('#0b140f', (c, w, h, t, u) => { const Q = P.map(p => [w * (.04 + .92 * p[0]) + Math.cos(t * .5 + p[2]) * u * .012, h * (.06 + .8 * p[1]) + Math.sin(t * .4 + p[2]) * u * .012]); lw(c, u, 1.4);
      Q.forEach((p, i) => { let d = 1e9; Q.forEach((q, j) => { if (j !== i) d = Math.min(d, Math.hypot(p[0] - q[0], p[1] - q[1])); }); const R = d * .56;
        c.fillStyle = `hsla(${95 + (i * 9) % 50},45%,${28 + (i * 7) % 18}%,.9)`; c.strokeStyle = '#d6f2b0'; c.beginPath(); c.arc(p[0], p[1], R, 0, 6.283); c.fill(); c.stroke(); c.fillStyle = '#eaffd0'; c.beginPath(); c.arc(p[0] + R * .2, p[1] - R * .1, R * .18, 0, 6.283); c.fill(); });
      label(c, w, h, 'SAKHIR OASIS', 'VORONOI SKIN'); }); })(),

  /* Mosque of Unity: everything from one rectangle */
  mosque: S2('#0f1416', (c, w, h, t, u) => { const g = h * .8, n = Math.floor((t * 1.6) % 9), s = '#e8e2d0'; c.strokeStyle = s; c.fillStyle = s; lw(c, u, 1.6);
    const R = [[.14, .56, .72, .24], [.3, .42, .26, .14], [.62, .46, .2, .1], [.78, .18, .05, .62], [.765, .3, .08, .03]]; R.forEach((q, i) => { if (i <= n) { c.globalAlpha = i === n ? .5 + .5 * Math.sin(t * 6) ** 2 : 1; c.strokeRect(w * q[0], h * q[1], w * q[2], h * q[3]); } }); c.globalAlpha = 1;
    if (n >= 5) { c.beginPath(); c.arc(w * .43, h * .42, w * .1, Math.PI, 0); c.stroke(); } if (n >= 6) for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(w * (.19 + i * .085), h * .72, w * .022, Math.PI, 0); c.lineTo(w * (.212 + i * .085), g); c.moveTo(w * (.168 + i * .085), h * .72); c.lineTo(w * (.168 + i * .085), g); c.stroke(); }
    if (n >= 7) { c.fillStyle = '#f2b90f'; c.beginPath(); c.arc(w * .805, h * .13, u * .03, 0, 6.283); c.fill(); c.fillStyle = '#0f1416'; c.beginPath(); c.arc(w * .815, h * .125, u * .025, 0, 6.283); c.fill(); }
    c.fillStyle = s; c.fillRect(w * .08, g, w * .84, u * .008); label(c, w, h, 'MOSQUE OF UNITY', 'ONE GEOMETRY'); }),

  /* Ramada Palace: twelve units, twelve interiors */
  rooms: S2('#15110f', (c, w, h, t, u) => { const pal = ['#c96f4a', '#2f6f73', '#d9b25f', '#6b4f7a', '#a8b59a', '#b8423a', '#3f5d8a', '#e3cfb4', '#5d7a4f', '#c98aa0', '#8a6a4a', '#4a8fa0'], gw = w * .86 / 4, gh = h * .72 / 3, on = Math.floor(t * 1.4) % 12;
    for (let i = 0; i < 12; i++) { const x = w * .07 + (i % 4) * gw, y = h * .08 + Math.floor(i / 4) * gh, p = gw * .06; c.fillStyle = pal[i]; c.globalAlpha = i === on ? 1 : .55; c.fillRect(x + p, y + p, gw - p * 2, gh - p * 2);
      c.fillStyle = '#15110f'; c.globalAlpha = .55; c.fillRect(x + gw * .2, y + gh * .5, gw * .42, gh * .28); c.fillRect(x + gw * .68, y + gh * .2, gw * .16, gh * .16); c.globalAlpha = 1; if (i === on) { c.strokeStyle = '#fff'; lw(c, u, 2); c.strokeRect(x + p, y + p, gw - p * 2, gh - p * 2); } }
    label(c, w, h, 'RAMADA PALACE', 'UNIT ' + String(on + 1).padStart(2, '0') + ' / 12'); }),

  /* Hidd Eskan: a two-floor villa drawing itself */
  house: S2('#0f1320', (c, w, h, t, u) => { const L = [[.16, .82, .84, .82], [.2, .82, .2, .3], [.2, .3, .62, .3], [.62, .3, .62, .46], [.62, .46, .8, .46], [.8, .46, .8, .82], [.2, .56, .8, .56], [.28, .36, .4, .36], [.4, .36, .4, .5], [.4, .5, .28, .5], [.28, .5, .28, .36], [.46, .36, .56, .36], [.56, .36, .56, .5], [.56, .5, .46, .5], [.46, .5, .46, .36], [.28, .64, .28, .82], [.28, .64, .38, .64], [.38, .64, .38, .82], [.48, .62, .74, .62], [.74, .62, .74, .76], [.74, .76, .48, .76], [.48, .76, .48, .62], [.61, .62, .61, .76]];
    const n = (t * 5) % (L.length + 10); c.strokeStyle = 'rgba(140,170,255,.18)'; lw(c, u); for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(w * i / 12, 0); c.lineTo(w * i / 12, h); c.stroke(); }
    c.strokeStyle = '#f1f4ff'; lw(c, u, 1.8); L.forEach((q, i) => { const k = Math.max(0, Math.min(1, n - i)); if (!k) return; c.beginPath(); c.moveTo(w * q[0], h * q[1]); c.lineTo(w * (q[0] + (q[2] - q[0]) * k), h * (q[1] + (q[3] - q[1]) * k)); c.stroke(); });
    label(c, w, h, 'HIDD ESKAN', 'ELEVATION 1:100'); }),

  /* AlRajhi Sunna: a campaign across the country */
  billboard: S2('#0d1a14', (c, w, h, t, u) => { const g = h * .84; c.fillStyle = '#12261c'; c.fillRect(0, g, w, h);
    [[.14, .5, .16], [.78, .46, .18], [.36, .22, .34]].forEach((b, i) => { const x = w * b[0], y = h * b[1], bw = w * b[2], bh = bw * .6; c.fillStyle = '#e8e2d0'; c.fillRect(x + bw * .2, y + bh, bw * .05, g - y - bh); c.fillRect(x + bw * .75, y + bh, bw * .05, g - y - bh);
      c.fillStyle = i === 2 ? '#0f5a3c' : '#1c3a2c'; c.fillRect(x, y, bw, bh); c.strokeStyle = '#e9b84a'; lw(c, u, i === 2 ? 1.8 : 1); c.strokeRect(x, y, bw, bh);
      for (let k = 0; k < 2; k++) { c.save(); c.translate(x + bw / 2, y + bh / 2); c.rotate(t * .3 * (i === 2 ? 1 : -1) + k * Math.PI / 4); c.strokeRect(-bh * .26, -bh * .26, bh * .52, bh * .52); c.restore(); } });
    label(c, w, h, 'ALRAJHI SUNNA', 'CAMPAIGN'); }),

  /* CAN Company: the pack turning on its shelf */
  can: S2('#efe6d6', (c, w, h, t, u) => { const cx = w * .42, top = h * .2, bot = h * .78, rx = u * .2, ry = u * .05; c.fillStyle = '#c9b9a0'; c.fillRect(0, bot + ry, w, h);
    c.fillStyle = '#d8d2c8'; c.fillRect(cx - rx, top, rx * 2, bot - top); c.save(); c.beginPath(); c.rect(cx - rx, h * .34, rx * 2, h * .3); c.clip(); c.fillStyle = '#1f3fd8'; c.fillRect(cx - rx, h * .34, rx * 2, h * .3);
    for (let i = -2; i < 8; i++) { const x = cx - rx + ((i * rx * .5 + t * rx * .4) % (rx * 4)) - rx; c.fillStyle = i % 2 ? '#f2b90f' : '#e63b1f'; c.beginPath(); c.arc(x, h * .49, rx * .16, 0, 6.283); c.fill(); } c.restore();
    c.fillStyle = '#bfb8ac'; c.beginPath(); c.ellipse(cx, bot, rx, ry, 0, 0, 6.283); c.fill(); c.fillStyle = '#eee9e0'; c.beginPath(); c.ellipse(cx, top, rx, ry, 0, 0, 6.283); c.fill(); c.strokeStyle = '#141414'; lw(c, u, 1.4); c.stroke();
    c.fillStyle = '#b08d5a'; c.fillRect(w * .68, h * .46, u * .26, h * .32 + ry); c.strokeRect(w * .68, h * .46, u * .26, h * .32 + ry); c.fillStyle = '#141414'; c.fillRect(w * .68, h * .56, u * .26, h * .05); label(c, w, h, 'CAN COMPANY', 'IDENTITY · PACK', '#141414'); }),

  /* Logo collection: nine marks, one in focus */
  marks: S2('#111', (c, w, h, t, u) => { const s = Math.min(w * .8 / 3, h * .74 / 3), x0 = (w - s * 3) / 2, y0 = h * .08, on = Math.floor(t * 1.3) % 9;
    for (let i = 0; i < 9; i++) { const x = x0 + (i % 3) * s, y = y0 + Math.floor(i / 3) * s, cx = x + s / 2, cy = y + s / 2, a = i === on, r = s * .26; c.fillStyle = a ? '#f2efe8' : '#1b1b1b'; c.fillRect(x + 3, y + 3, s - 6, s - 6); c.fillStyle = c.strokeStyle = a ? '#e63b1f' : '#f2efe8'; lw(c, u, 2.4); c.save(); c.translate(cx, cy); c.rotate(a ? t * 1.5 : 0); c.beginPath();
      [() => c.arc(0, 0, r, 0, 6.283), () => c.rect(-r, -r, r * 2, r * 2), () => { c.moveTo(0, -r); c.lineTo(r, r); c.lineTo(-r, r); c.closePath(); }, () => { c.arc(0, 0, r, 0, Math.PI); c.closePath(); }, () => { c.rect(-r, -r * .2, r * 2, r * .4); c.rect(-r * .2, -r, r * .4, r * 2); }, () => { c.arc(-r * .4, 0, r * .6, 0, 6.283); c.arc(r * .4, 0, r * .6, 0, 6.283); }, () => { c.moveTo(-r, r); c.lineTo(0, -r); c.lineTo(r, r); c.lineTo(0, r * .3); c.closePath(); }, () => { c.arc(0, 0, r, .6, 5.6); c.lineTo(0, 0); c.closePath(); }, () => { c.rect(-r, -r, r * .9, r * .9); c.rect(r * .1, r * .1, r * .9, r * .9); }][i]();
      i === 5 ? c.stroke() : c.fill(); c.restore(); }
    label(c, w, h, 'LOGO COLLECTION', 'MARK 0' + (on + 1)); }),

  /* Art works: a line finding its drawing */
  brush: S2('#f2efe8', (c, w, h, t, u) => { const n = 260, k = ((t * .16) % 1.25) * n; c.fillStyle = '#e63b1f'; c.beginPath(); c.arc(w * .68, h * .4, u * .17, 0, 6.283); c.fill(); c.strokeStyle = '#141414';
    for (let i = 1; i < Math.min(n, k); i++) { const f = a => [w * (.5 + .36 * Math.sin(a * 3.1 + .4) * Math.cos(a * .7)), h * (.46 + .3 * Math.sin(a * 2.3) * Math.cos(a * 1.3 + 1))], p = f((i - 1) / n * 6.283), q = f(i / n * 6.283);
      c.lineWidth = u * (.006 + .016 * (.5 + .5 * Math.sin(i * .13))); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
    label(c, w, h, 'ART WORKS', 'HAND · SCREEN', '#141414'); }),

  /* Photography: the aperture breathing */
  aperture: S2('#0b0b0b', (c, w, h, t, u) => { const cx = w / 2, cy = h * .47, R = u * .36, r = R * (.22 + .5 * (.5 + .5 * Math.sin(t * .9))), n = 7, rot = t * .15; c.fillStyle = '#1b1b1b'; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.fill();
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, '#ffe6a8'); g.addColorStop(1, '#e68a2e'); c.fillStyle = g; c.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i / n * 6.283; i ? c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fill();
    c.strokeStyle = '#f2efe8'; lw(c, u, 1.5); for (let i = 0; i < n; i++) { const a = rot + i / n * 6.283, b = a + 6.283 / n * 2.2; c.beginPath(); c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.lineTo(cx + Math.cos(b) * R, cy + Math.sin(b) * R); c.stroke(); }
    c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke(); label(c, w, h, 'PHOTOGRAPHY', 'f / ' + (1.4 + 14 * (1 - (r / R - .22) / .5)).toFixed(1)); }),

  /* Virtual sensors: eleven points listening along a vehicle */
  car: S2('#0a1020', (c, w, h, t, u) => { const g = h * .7, x = w * .12, L = w * .76; c.strokeStyle = '#dfe8ff'; lw(c, u, 1.8); c.beginPath(); c.moveTo(x, g); c.lineTo(x, g - h * .1); c.quadraticCurveTo(x + L * .04, g - h * .17, x + L * .2, g - h * .19); c.lineTo(x + L * .34, g - h * .34); c.lineTo(x + L * .66, g - h * .34); c.lineTo(x + L * .82, g - h * .19); c.quadraticCurveTo(x + L * .98, g - h * .16, x + L, g - h * .06); c.lineTo(x + L, g); c.closePath(); c.stroke();
    [.22, .78].forEach(k => { c.fillStyle = '#0a1020'; c.beginPath(); c.arc(x + L * k, g, h * .09, 0, 6.283); c.fill(); c.stroke(); c.beginPath(); c.arc(x + L * k, g, h * .035, 0, 6.283); c.stroke(); });
    const S = [[.22, 0], [.78, 0], [.22, -.13], [.78, -.13], [.5, -.3], [.36, -.2], [.64, -.2], [.06, -.08], [.95, -.08], [.5, -.05], [.5, -.16]], on = Math.floor(t * 2.2) % 11; S.forEach((s, i) => { const px = x + L * s[0], py = g + h * s[1], a = i === on; c.fillStyle = a ? '#ff5a36' : '#4de3ff'; c.beginPath(); c.arc(px, py, u * .013, 0, 6.283); c.fill();
      c.strokeStyle = `rgba(77,227,255,${.6 * (1 - ((t * .8 + i * .09) % 1))})`; lw(c, u); c.beginPath(); c.arc(px, py, u * .013 + u * .06 * ((t * .8 + i * .09) % 1), 0, 6.283); c.stroke(); });
    c.strokeStyle = '#dfe8ff'; c.beginPath(); c.moveTo(0, g + h * .09); c.lineTo(w, g + h * .09); c.stroke(); label(c, w, h, 'VIRTUAL SENSORS', 'SENSOR ' + String(on + 1).padStart(2, '0') + ' / 11'); }),

  /* Sets for Bahrain National TV: a studio under moving lights */
  stage: S2('#120c14', (c, w, h, t, u) => { c.fillStyle = '#241a2a'; poly(c, [[w * .1, h * .62], [w * .9, h * .62], [w, h * .9], [0, h * .9]]); c.fill();
    [['#e63b1f', .16], ['#f2efe8', .38], ['#1f3fd8', .62]].forEach(p => { c.fillStyle = p[0]; c.fillRect(w * p[1], h * .22, w * .2, h * .4); }); c.fillStyle = '#f2b90f'; c.beginPath(); c.arc(w * .48, h * .42, u * .09, 0, 6.283); c.fill(); c.fillStyle = '#111'; c.fillRect(w * .42, h * .56, w * .16, h * .1);
    c.globalCompositeOperation = 'lighter'; [.2, .5, .8].forEach((k, i) => { const a = Math.sin(t * .7 + i * 2) * .22, x = w * k, tx = x + Math.tan(a) * h * .8, g = c.createLinearGradient(x, 0, tx, h * .85); g.addColorStop(0, 'rgba(255,240,200,.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; poly(c, [[x - u * .015, 0], [x + u * .015, 0], [tx + u * .2, h * .88], [tx - u * .2, h * .88]]); c.fill(); });
    c.globalCompositeOperation = 'source-over'; c.fillStyle = '#3a2d42'; c.fillRect(0, 0, w, h * .035); label(c, w, h, 'BAHRAIN TV', 'SET DESIGN · ON AIR'); }),

  /* Find Us at The Park: a small piece of shared ground */
  park: S2('#0c1410', (c, w, h, t, u) => { const g = h * .76; c.fillStyle = '#14301f'; c.fillRect(0, g, w, h); c.fillStyle = '#f2b90f'; c.beginPath(); c.arc(w * .84, h * .2, u * .07, 0, 6.283); c.fill();
    [[.18, .3, '#3f8f52'], [.44, .38, '#2f7a48'], [.7, .26, '#56a85f']].forEach((p, i) => { const sw = Math.sin(t * .9 + i) * u * .012, x = w * p[0]; c.fillStyle = '#6b4a2e'; c.fillRect(x - u * .012, g - h * p[1], u * .024, h * p[1]); c.fillStyle = p[2]; c.beginPath(); c.arc(x + sw, g - h * p[1], u * (.1 + i * .012), 0, 6.283); c.fill(); c.beginPath(); c.arc(x + sw * 1.6 - u * .06, g - h * p[1] + u * .05, u * .07, 0, 6.283); c.fill(); });
    c.fillStyle = '#e8e2d0'; c.fillRect(w * .54, g - h * .07, w * .12, h * .015); c.fillRect(w * .55, g - h * .07, u * .01, h * .07); c.fillRect(w * .65, g - h * .07, u * .01, h * .07);
    for (let i = 0; i < 5; i++) { const x = ((t * (.03 + i * .008) + i * .23) % 1.1 - .05) * w, y = g + h * (.04 + i * .025); c.fillStyle = ['#e63b1f', '#f2efe8', '#4de3ff', '#f2b90f', '#c98aa0'][i]; c.beginPath(); c.arc(x, y - u * .05, u * .016, 0, 6.283); c.fill(); c.fillRect(x - u * .008, y - u * .035, u * .016, u * .04); }
    label(c, w, h, 'FIND US AT THE PARK', 'WEF AWARD 2025'); }),

  /* Thesis: a river delta and the cities it lost */
  delta: S2('#0d0f14', (c, w, h, t, u) => { const x0 = w * .5, y0 = h * .88, B = [-.42, -.26, -.1, .06, .22, .4]; c.strokeStyle = '#6ea0ff'; lw(c, u, 2.2); c.beginPath(); c.moveTo(x0, h); c.lineTo(x0, y0 - h * .12); c.stroke();
    B.forEach((b, i) => { lw(c, u, 1.6); c.setLineDash([u * .03, u * .02]); c.lineDashOffset = t * u * .06; c.beginPath(); c.moveTo(x0, y0 - h * .12); c.bezierCurveTo(x0, h * .5, x0 + w * b * .6, h * .42, x0 + w * b, h * .12); c.stroke(); });
    c.setLineDash([]); B.forEach((b, i) => [.45, .8].forEach((k, j) => { const q = 1 - k, px = q * q * q * x0 + 3 * q * q * k * x0 + 3 * q * k * k * (x0 + w * b * .6) + k * k * k * (x0 + w * b), py = q * q * q * (y0 - h * .12) + 3 * q * q * k * h * .5 + 3 * q * k * k * h * .42 + k * k * k * h * .12, a = .5 + .5 * Math.sin(t * 1.4 + i * 1.3 + j * 2);
      c.fillStyle = (i + j) % 4 === 0 ? '#ff5a36' : '#e9cf9a'; c.globalAlpha = .3 + .7 * a; c.fillRect(px - u * .014, py - u * .014, u * .028, u * .028); c.globalAlpha = 1; }));
    label(c, w, h, 'LOST CITIES', 'EGYPTIAN DELTA'); }),

  /* Papers under review: four sheets in the pile */
  papers: S2('#13110f', (c, w, h, t, u) => { const cx = w / 2, cy = h * .47, pw = u * .5, ph = u * .64, top = Math.floor(t * .5) % 4;
    for (let k = 3; k >= 0; k--) { const i = (top + k) % 4, lift = k === 0 ? Math.sin((t * .5 % 1) * Math.PI) * u * .04 : 0; c.save(); c.translate(cx + (k - 1.5) * u * .05, cy + k * u * .012 - lift); c.rotate((k - 1.5) * .09); c.fillStyle = '#f2efe8'; c.fillRect(-pw / 2, -ph / 2, pw, ph); c.strokeStyle = '#13110f'; lw(c, u); c.strokeRect(-pw / 2, -ph / 2, pw, ph);
      c.fillStyle = ['#e63b1f', '#1f3fd8', '#f2b90f', '#141414'][i]; c.fillRect(-pw * .4, -ph * .4, pw * .5, ph * .06); c.fillStyle = '#9a958c'; for (let l = 0; l < 7; l++) c.fillRect(-pw * .4, -ph * .26 + l * ph * .085, pw * (.8 - (l * 3 + i) % 4 * .1), ph * .028); c.restore(); }
    label(c, w, h, 'PAPERS', '0' + (top + 1) + ' / 04 · UNDER REVIEW'); }),
});

/* a profile r(y), y from 0 (foot) to 1 (rim), spun around a vertical axis and drawn as rings and ribs */
function spin(c, w, h, t, u, prof, ink, a, b) { const cx = w / 2, base = h * .82, H = h * .66, R = u * 1.15; c.strokeStyle = ink; lw(c, u, 1.2);
  for (let i = 0; i <= 26; i++) { const y = i / 26, r = prof(y) * R; c.globalAlpha = .35 + .65 * y; c.beginPath(); c.ellipse(cx, base - y * H, r, r * .22, 0, 0, 6.283); c.stroke(); }
  c.globalAlpha = .8; for (let m = 0; m < 10; m++) { const ang = t * .5 + m / 10 * 6.283; c.beginPath(); for (let i = 0; i <= 26; i++) { const y = i / 26, r = prof(y) * R, x = cx + Math.cos(ang) * r, yy = base - y * H + Math.sin(ang) * r * .22; i ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
  c.globalAlpha = 1; label(c, w, h, a, b); }
