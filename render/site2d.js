/* IronBench 2D build preview — runs on the live site (GitHub Pages).
   Loads pre-made part layers from parts/manifest.json and assembles them with the
   placement rules in docs/composite-spec.md. No image processing happens here except
   reading each layer's outline, which is allowed because the layers are same-origin.
   If the manifest can't load (claude.ai artifact, file://), IB2D.init() resolves false
   and the site keeps its 3D viewer. */
(function () {
  const IB2D = (window.IB2D = { on: false });
  const S = 38, CW = 1600, CH = 600, IN = (v) => v * S;
  let MAN = null, THREADS = {};
  const cache = {};

  // ---------------- data ----------------
  IB2D.init = async () => {
    try {
      const r = await fetch('parts/manifest.json', { cache: 'no-cache' });
      if (!r.ok) return false;
      MAN = await r.json();
      if (!MAN.parts || !Object.keys(MAN.parts).length) return false;
    } catch (e) { return false; }
    try {
      const t = await (await fetch('data/psa_barrel_threads.txt')).text();
      t.split('\n').forEach((l) => { if (!l || l[0] === '#') return; const [slug, pitch, src] = l.split('|'); THREADS[slug] = { pitch, src }; });
    } catch (e) {}
    // make sure a layer can actually be read (pixels must not be tainted)
    try { const first = Object.values(MAN.parts)[0]; await loadLayer(first); } catch (e) { return false; }
    IB2D.on = true;
    return true;
  };
  const slugOf = (p) => (p && p.url ? p.url.replace(/^https?:\/\/[^/]+\//, '').replace(/\.html$/, '') : null);
  const entriesFor = (slot) => Object.values(MAN.parts).filter((e) => e.slot === slot);

  // pick the manifest layer for a selected part, or the closest stand-in
  function pick(slot, part) {
    const slug = slugOf(part);
    if (slug && MAN.parts[slug] && MAN.parts[slug].slot === slot) return { e: MAN.parts[slug], stand: false };
    const all = entriesFor(slot);
    if (!all.length) return null;
    if (slot === 'handguard' && part && part.len) {
      all.sort((a, b) => Math.abs(a.size_in[0] - part.len) - Math.abs(b.size_in[0] - part.len));
    }
    return { e: all[0], stand: !!part };
  }

  function loadLayer(e) {
    if (cache[e.id]) return cache[e.id];
    return (cache[e.id] = new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
        try { res({ c, w: c.width, h: c.height, m: mask(c), a: e.anchors || {}, e }); }
        catch (err) { delete cache[e.id]; rej(err); }
      };
      img.onerror = () => { delete cache[e.id]; rej(new Error('layer failed: ' + e.img)); };
      img.src = e.img + '?v=' + (e.bytes || '') + (e.px ? '-' + e.px.join('x') : '');   // cache-bust when a layer is re-exported
    }));
  }
  IB2D.clearCache = () => { for (const k in cache) delete cache[k]; };

  // ---------------- helpers ----------------
  function mask(c) {
    const W = c.width, H = c.height, d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
    const top = new Array(W).fill(-1), bot = new Array(W).fill(-1);
    for (let a = 0; a < W; a++) {
      for (let y = 0; y < H; y++) if (d[(y * W + a) * 4 + 3] > 100) { top[a] = y; break; }
      for (let y = H - 1; y >= 0; y--) if (d[(y * W + a) * 4 + 3] > 100) { bot[a] = y; break; }
    }
    return { top, bot };
  }
  function mode(arr, s, e) {
    const h = new Map();
    for (let a = Math.max(0, s | 0); a < Math.min(arr.length, e | 0); a++) { const v = arr[a]; if (v < 0) continue; h.set(v, (h.get(v) || 0) + 1); }
    let best = -1, bn = -1; for (const [v, n] of h) if (n > bn) { bn = n; best = v; } return best;
  }
  const valid = (v) => v >= 0 && v < 1e5;

  const PROFILE = { pencil: .625, lightweight: .625, government: .75, "gov't": .75, hbar: .75, heavy: .75, socom: .75, gunner: .70, 'medium taper': .70, taper: .70, tapered: .70, bull: .936, fluted: .75, dmr: .80 };
  const THREAD = { '1/2x28': { dia: .5, len: .6 }, '5/8x24': { dia: .625, len: .6 }, '1/2x36': { dia: .5, len: .6 }, '5/8x32': { dia: .625, len: .6 }, '3/4x24': { dia: .75, len: .65 } };
  function barrelSpec(p) {
    const name = (p && p.name || '').toLowerCase();
    const prof = Object.keys(PROFILE).find((k) => name.includes(k)) || (p && p.heavy ? 'heavy' : 'default');
    const t = THREADS[slugOf(p)];
    let pitch = t ? t.pitch : null;
    if (!pitch) pitch = p && p.cal && p.cal[0] === '300' ? '5/8x24' : '1/2x28';
    return { len: (p && p.len) || 16, gas: (p && p.gas) || 9, profile: prof, dia: PROFILE[prof] || .75, threaded: true, pitch, threadSrc: t ? t.src : 'assumed' };
  }

  function drawBarrel(L, g) {
    const { faceX, boreY, spec, hgEndX } = g; const muzzleX = faceX + IN(spec.len - .55); const T = THREAD[spec.pitch] || THREAD['1/2x28'];
    const r = IN(spec.dia / 2), tl = spec.threaded ? IN(T.len) : 0, shoulderX = muzzleX - tl, rt = IN(T.dia / 2);
    const cyl = (x1, x2, rad) => { const gr = L.createLinearGradient(0, boreY - rad, 0, boreY + rad); gr.addColorStop(0, '#2a2b2e'); gr.addColorStop(.28, '#5d6066'); gr.addColorStop(.42, '#2b2c30'); gr.addColorStop(.8, '#121315'); gr.addColorStop(1, '#060607'); L.fillStyle = gr; L.fillRect(x1, boreY - rad, x2 - x1, rad * 2); };
    // barrel nut (under the rail's rear, visible through the M-LOK slots)
    { const nr = IN(.62), gr = L.createLinearGradient(0, boreY - nr, 0, boreY + nr); gr.addColorStop(0, '#303236'); gr.addColorStop(.3, '#4a4d52'); gr.addColorStop(.55, '#1f2023'); gr.addColorStop(1, '#0a0a0b'); L.fillStyle = gr; L.fillRect(faceX - IN(.05), boreY - nr, IN(.9), nr * 2);
      L.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 4; i++) L.fillRect(faceX - IN(.05) + i * IN(.22), boreY - nr, 1.5, nr * 2); }
    cyl(faceX - IN(.1), shoulderX, r);
    // gas tube from the receiver to the gas block, then the low-profile gas block (seen through the slots)
    const gbX = faceX + IN(spec.gas - .25);
    { const ty = boreY - IN(.58), tr = IN(.09); const gr = L.createLinearGradient(0, ty - tr, 0, ty + tr); gr.addColorStop(0, '#6b6e73'); gr.addColorStop(.5, '#3a3c40'); gr.addColorStop(1, '#151618'); L.fillStyle = gr; L.fillRect(faceX - IN(.1), ty - tr, gbX - faceX, tr * 2); }
    { const h = IN(.5); const gr = L.createLinearGradient(0, boreY - h, 0, boreY + h); gr.addColorStop(0, '#3d3f43'); gr.addColorStop(.35, '#1f2023'); gr.addColorStop(1, '#0a0a0b'); L.fillStyle = gr; L.beginPath(); L.roundRect(gbX - IN(.4), boreY - IN(.72), IN(.8), IN(1.17), IN(.06)); L.fill();
      L.fillStyle = '#0b0b0c'; L.beginPath(); L.arc(gbX + IN(.15), boreY - IN(.3), IN(.05), 0, 7); L.fill(); }
    if (spec.threaded) {
      L.fillStyle = '#0d0e0f'; L.fillRect(shoulderX - 1, boreY - r, 2, r * 2); cyl(shoulderX, muzzleX, rt);
      if (!g.hasMuzzle) {
        const step = Math.max(2, IN(1 / 28) * 1.6); L.lineWidth = 1;
        L.strokeStyle = 'rgba(255,255,255,.22)'; for (let x = shoulderX + step * .6; x < muzzleX - 1; x += step) { L.beginPath(); L.moveTo(x, boreY - rt + 1); L.lineTo(x + step * .35, boreY + rt - 1); L.stroke(); }
        L.strokeStyle = 'rgba(0,0,0,.55)'; for (let x = shoulderX + step * 1.1; x < muzzleX - 1; x += step) { L.beginPath(); L.moveTo(x, boreY - rt + 1); L.lineTo(x + step * .35, boreY + rt - 1); L.stroke(); }
        L.fillStyle = '#0b0b0c'; L.fillRect(muzzleX - 2, boreY - rt * .55, 2, rt * 1.1);
      }
    } else { L.fillStyle = '#0b0b0c'; L.fillRect(muzzleX - 2, boreY - r * .4, 2, r * .8); }
    return { muzzleX, shoulderX, r };
  }

  // charging handle — side profile matched to the user's reference rifle
  function drawCH(L, uX, railTopY) {
    const top = railTopY + IN(.02), bot = railTopY + IN(.52), rx = uX - IN(.62), fx = uX + IN(1.4);
    const gr = L.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, '#5a5d62'); gr.addColorStop(.1, '#2c2d30'); gr.addColorStop(.6, '#151618'); gr.addColorStop(1, '#08090a'); L.fillStyle = gr;
    L.beginPath(); L.moveTo(fx, top); L.lineTo(rx + IN(.12), top); L.quadraticCurveTo(rx, top, rx, top + IN(.12)); L.lineTo(rx, bot - IN(.1)); L.quadraticCurveTo(rx, bot, rx + IN(.1), bot); L.lineTo(fx, bot); L.closePath(); L.fill();
    L.strokeStyle = 'rgba(0,0,0,.85)'; L.lineWidth = 1; L.stroke();
    L.strokeStyle = 'rgba(255,255,255,.18)'; L.beginPath(); L.moveTo(rx + IN(.12), top + IN(.015)); L.lineTo(uX - IN(.02), top + IN(.015)); L.stroke();
    L.strokeStyle = 'rgba(255,255,255,.1)'; L.beginPath(); L.moveTo(rx + IN(.03), top + IN(.12)); L.lineTo(rx + IN(.03), bot - IN(.1)); L.stroke();
    L.fillStyle = 'rgba(0,0,0,.45)'; L.beginPath(); L.roundRect(rx + IN(.14), top + IN(.17), IN(.32), IN(.16), IN(.05)); L.fill();
    L.strokeStyle = 'rgba(255,255,255,.08)'; L.beginPath(); L.moveTo(rx + IN(.15), top + IN(.33)); L.lineTo(rx + IN(.45), top + IN(.33)); L.stroke();
    return [rx, top, IN(.62), bot - top];
  }

  // ---------------- assembly (from compose7, the version that produced preview v8) ----------------
  function compose(P, o) {
    const Lc = document.createElement('canvas'); Lc.width = CW; Lc.height = CH; const L = Lc.getContext('2d');
    const boxes = {};
    const fit = (p, len, hgt) => { const sc = (len ? len / p.w : hgt / p.h) * S; return { sc, w: p.w * sc, h: p.h * sc }; };
    const draw = (slot, p, d, X, Y) => { L.drawImage(p.c, X, Y, d.w, d.h); if (slot) boxes[slot] = [X, Y, d.w, d.h]; };
    const blk = (y, r) => { const g = L.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#4a4c50'); g.addColorStop(.3, '#232427'); g.addColorStop(.7, '#141517'); g.addColorStop(1, '#08090a'); return g; };
    const U = P.upper, Lw = P.lower, H = P.handguard, M = P.muzzle, St = P.stock, Gp = P.grip, Mg = P.mag, O = P.optic;

    // LOWER (datum)
    const dL = fit(Lw, o.lowerLen), sL = dL.sc, LW = Lw.c.width;
    const lTop = Lw.m.top, lBot = Lw.m.bot, bodyTop = mode(lTop, LW * .45, LW * .8);
    const lX = o.lX, lowerTopY = o.lowerTopY ?? 258, lY = lowerTopY - bodyTop * sL;
    const lpx = (a) => lX + a * sL, lpy = (v) => lY + v * sL;
    let tf = Math.round(LW * .04); while (tf < LW * .5 && !(valid(lTop[tf]) && lTop[tf] >= bodyTop - .3 * S / sL)) tf++;
    const towerFrontX = lpx(tf);
    let maxBot = -1; for (let a = LW * .55 | 0; a < LW; a++) if (valid(lBot[a])) maxBot = Math.max(maxBot, lBot[a]);
    const thr = bodyTop + (maxBot - bodyTop) * .72; let mwF = LW - 1; while (mwF > 0 && !(lBot[mwF] >= thr)) mwF--; let mwR = mwF; while (mwR > LW * .4 && lBot[mwR] >= thr) mwR--;
    const magFront = lpx(mwF), magRear = lpx(mwR);
    const c0 = Math.max(0, mwR - Math.round(2.4 * S / sL)); let uC = c0; for (let a = c0; a < mwR; a++) if (valid(lBot[a]) && lBot[a] < lBot[uC]) uC = a;
    let eF = uC; for (let a = uC; a <= Math.min(LW - 1, mwR + 4); a++) if (lBot[a] > lBot[eF]) eF = a;
    let eR = uC; for (let a = Math.max(0, uC - Math.round(1.7 * S / sL)); a < uC; a++) if (valid(lBot[a]) && lBot[a] > lBot[eR]) eR = a;
    const earFX = lpx(eF), earRX = lpx(eR), earFY = lpy(lBot[eF]), earRY = lpy(lBot[eR]), slotY = lpy(lBot[uC]);
    const gripLevel = lpy(mode(lBot, LW * .12, LW * .28));
    const HL = (Lw.a.holes || []).map((h) => ({ x: lpx(h[0]), y: lpy(h[1]), r: h[2] * sL }));

    // UPPER — lugs pinned onto the lower's takedown / pivot pin holes
    const UW = U.c.width, ua = U.a, uMateRow = ua.mateRow, uRailRow = ua.railRow;
    const lRear = { x: lpx(Lw.a.pinRear[0]), y: lpy(Lw.a.pinRear[1]) }, lFront = { x: lpx(Lw.a.pinFront[0]), y: lpy(Lw.a.pinFront[1]) };
    const sU = (lFront.x - lRear.x) / (ua.lugFront.x - ua.lugRear.x);
    const uX = lRear.x - ua.lugRear.x * sU, uY = lRear.y - ua.lugRear.y * sU;
    const dU = { sc: sU, w: UW * sU, h: U.c.height * sU };
    const upx = (a) => uX + a * sU, upy = (v) => uY + v * sU;
    const railTopY = upy(uRailRow), bodyH = uMateRow - uRailRow;
    const fc = ua.faceCol, faceX = upx(fc);
    const tc = []; for (let a = fc + 2; a < UW; a++) if (valid(U.m.top[a])) tc.push((U.m.top[a] + U.m.bot[a]) / 2);
    const boreY = tc.length ? upy(tc.sort((a, b) => a - b)[tc.length >> 1]) : upy(uRailRow + bodyH * .42);

    // buffer tube, stock, castle nut
    const tubeR = IN(.575), tubeFront = towerFrontX - IN(.3), tubeBack = tubeFront - IN(7.6);
    L.fillStyle = blk(boreY, tubeR); L.beginPath(); L.roundRect(tubeBack, boreY - tubeR, tubeFront - tubeBack, tubeR * 2, 4); L.fill();
    boxes.buffertube = [tubeBack, boreY - tubeR, tubeFront - tubeBack, tubeR * 2];
    const rowL = Math.round((boreY - lY) / sL); let towerRear = lX;
    { const cx = Lw.c.getContext('2d', { willReadFrequently: true }).getImageData(0, Math.max(0, Math.min(Lw.c.height - 1, rowL)), LW, 1).data; for (let a = 0; a < LW; a++) if (cx[a * 4 + 3] > 100) { towerRear = lpx(a); break; } }
    let rearMost = tubeBack;
    if (St) { const dSt = fit(St, 7.0); const sx = towerRear - IN(1.25) - dSt.w; draw('stock', St, dSt, sx, boreY - tubeR - IN(.08)); rearMost = Math.min(rearMost, sx); }
    L.fillStyle = blk(boreY, IN(.7)); L.fillRect(towerRear - IN(.12), boreY - IN(.68), IN(.16), IN(1.36)); L.fillRect(towerRear - IN(.55), boreY - IN(.62), IN(.42), IN(1.24));
    L.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 4; i++) L.fillRect(towerRear - IN(.53) + i * IN(.1), boreY - IN(.62), IN(.03), IN(1.24));

    // magazine — top-front corner seated at the magwell front
    if (Mg) {
      const dMg = fit(Mg, 0, 7.4), MW = Mg.c.width, MH = Mg.c.height; let mtf = 0;
      const d = Mg.c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, MW, Math.round(MH * .1)).data;
      for (let y = 0; y < (MH * .1 | 0); y++) for (let a = MW - 1; a > mtf; a--) if (d[(y * MW + a) * 4 + 3] > 120) { mtf = a; break; }
      draw('mag', Mg, dMg, magFront - IN(.07) - mtf * dMg.sc, lowerTopY + IN(.42));
    }
    if (Gp) { const dG = fit(Gp, 0, 4.4); const gRight = earRX + IN(.15); draw('grip', Gp, dG, gRight - dG.w, gripLevel - IN(.32)); }

    // barrel + muzzle device (device face seats on the thread shoulder)
    const BS = o.barrel, hgEnd = faceX - IN(.04) + IN(o.hgLen);
    const BR = drawBarrel(L, { faceX, boreY, spec: BS, hgEndX: hgEnd, hasMuzzle: !!M });
    boxes.barrel = [faceX, boreY - BR.r - 2, BR.muzzleX - faceX, BR.r * 2 + 4];
    let frontMost = BR.muzzleX;
    if (M) { const dM = { w: IN((M.e.size_in && M.e.size_in[0]) || 2.05), h: IN((M.e.size_in && M.e.size_in[1]) || .85) }; const mx = BR.shoulderX - IN(.02); draw('muzzle', M, dM, mx, boreY - dM.h / 2); frontMost = mx + dM.w; }

    // charging handle, upper, dust cover + forward assist
    boxes.charging = drawCH(L, uX, railTopY);
    draw('upper', U, dU, uX, uY);
    { const F = ua.feat, ux = (f) => uX + f * dU.w, uy = (f) => uY + f * dU.h;
      const x1 = ux(F.port[0]) - IN(.05), x2 = ux(F.port[1]) + IN(.05), y1 = uy(F.port[2]) - IN(.04), y2 = uy(F.port[3]) + IN(.04);
      const g = L.createLinearGradient(0, y1, 0, y2); g.addColorStop(0, '#3a3c40'); g.addColorStop(.12, '#232427'); g.addColorStop(.85, '#151618'); g.addColorStop(1, '#0b0c0d');
      L.fillStyle = g; L.beginPath(); L.roundRect(x1, y1, x2 - x1, y2 - y1, IN(.06)); L.fill(); L.strokeStyle = 'rgba(0,0,0,.85)'; L.lineWidth = 1.2; L.stroke();
      L.strokeStyle = 'rgba(255,255,255,.13)'; L.beginPath(); L.moveTo(x1 + IN(.08), y1 + IN(.06)); L.lineTo(x2 - IN(.08), y1 + IN(.06)); L.stroke();
      L.fillStyle = '#0c0d0e'; L.fillRect(x1 - IN(.08), y2 - IN(.06), x2 - x1 + IN(.16), IN(.07));
      L.fillStyle = '#1a1b1d'; L.beginPath(); L.roundRect(x2 - IN(.42), y1 + IN(.1), IN(.28), IN(.16), IN(.04)); L.fill(); L.strokeStyle = 'rgba(255,255,255,.1)'; L.stroke();
      boxes.dustcover = [x1, y1, x2 - x1, y2 - y1];
      const fx = ux(F.fa[0]), fy = uy(F.fa[1]), fr = IN(.27); const g2 = L.createRadialGradient(fx - fr * .3, fy - fr * .3, fr * .1, fx, fy, fr); g2.addColorStop(0, '#4d5055'); g2.addColorStop(.6, '#1e1f22'); g2.addColorStop(1, '#0a0b0c');
      L.fillStyle = g2; L.beginPath(); L.arc(fx, fy, fr, 0, 7); L.fill(); L.strokeStyle = 'rgba(255,255,255,.12)'; L.lineWidth = 1; for (let i = -3; i <= 3; i++) { L.beginPath(); L.moveTo(fx + i * fr * .22, fy - fr * .78); L.lineTo(fx + i * fr * .22, fy + fr * .78); L.stroke(); }
      boxes.fa = [fx - fr, fy - fr, fr * 2, fr * 2]; }

    // handguard: butts the upper face, rail tops flush. M-LOK slots are open, so the barrel nut, gas tube,
    // gas block and backdrop show through them, as in real product photos.
    { const dH = fit(H, o.hgLen), hTopRow = H.a.railTopRow ?? mode(H.m.top, H.c.width * .25, H.c.width * .85);
      dH.h = H.h * (H.e.size_in[0] / H.w) * S; // keep the photo's own proportions if a stand-in is stretched to a new length
      const hX = faceX - IN(.04), hY = railTopY - hTopRow * (dH.h / H.h);
      draw('handguard', H, dH, hX, hY); }

    // optic: clamp base gripping the rail
    if (O) { const dO = fit(O, O.e.size_in[0] || 5.6); draw('optic', O, dO, uX + IN(1.25), railTopY + IN(.24) - dO.h); }

    // hole classification by position, trigger pinned behind the lower
    const near = (h, p) => p && Math.hypot(h.x - p.x, h.y - p.y) < IN(.15);
    const rearPin = HL.find((h) => near(h, lRear)), frontPin = HL.find((h) => near(h, lFront));
    const rest = HL.filter((h) => h !== rearPin && h !== frontPin && h.y > lowerTopY + IN(.12));
    const catchH = rest.filter((h) => Math.abs(h.x - magRear) < IN(.7)).sort((a, b) => b.r - a.r)[0];
    const sel = rest.filter((h) => h !== catchH && h.x < magRear - IN(1)).sort((a, b) => b.r - a.r)[0];
    const fcp = rest.filter((h) => h !== sel && h !== catchH && sel && h.x > sel.x + IN(.2) && h.x < magRear - IN(.1));
    const tPin = [...fcp].sort((a, b) => a.x - b.x)[0], hPin = [...fcp].sort((a, b) => b.x - a.x)[0];
    let trigDone = false;
    if (P.trigger && tPin && hPin && tPin !== hPin && P.trigger.a.pins) {
      const T = P.trigger, TP = T.a.pins, th = [{ cx: TP.trig[0] * T.w, cy: TP.trig[1] * T.h }, { cx: TP.ham[0] * T.w, cy: TP.ham[1] * T.h }];
      const sc = Math.hypot(hPin.x - tPin.x, hPin.y - tPin.y) / Math.hypot(th[1].cx - th[0].cx, th[1].cy - th[0].cy);
      const ang = Math.atan2(hPin.y - tPin.y, hPin.x - tPin.x) - Math.atan2(th[1].cy - th[0].cy, th[1].cx - th[0].cx);
      if (Math.abs(ang) < .5 && sc * T.w / S > .8 && sc * T.w / S < 3) {
        L.save(); L.translate(tPin.x, tPin.y); L.rotate(ang); L.scale(sc, sc); L.drawImage(T.c, -th[0].cx, -th[0].cy); L.restore(); trigDone = true;
        boxes.trigger = [tPin.x - IN(.25), slotY - IN(.1), IN(.6), IN(1.0)];
      }
    }
    draw('lower', Lw, dL, lX, lY);

    // trigger guard, pins, selector, mag release
    const gBarTop = Math.max(earFY, earRY) - IN(.16), gBarH = IN(.19), gFx = earFX + IN(.1), gRx = earRX - IN(.1);
    { const g = L.createLinearGradient(0, gBarTop, 0, gBarTop + gBarH); g.addColorStop(0, '#3a3c40'); g.addColorStop(.45, '#18191b'); g.addColorStop(1, '#0b0c0d'); L.fillStyle = g;
      L.beginPath(); L.moveTo(gRx, gBarTop - IN(.05)); L.lineTo(gFx, gBarTop - IN(.05)); L.quadraticCurveTo(gFx + IN(.06), gBarTop + gBarH * .5, gFx - IN(.04), gBarTop + gBarH); L.lineTo(gRx + IN(.12), gBarTop + gBarH + IN(.03)); L.quadraticCurveTo(gRx - IN(.06), gBarTop + gBarH, gRx, gBarTop - IN(.05)); L.fill();
      boxes.tguard = [gRx, gBarTop - IN(.05), gFx - gRx, gBarH + IN(.08)]; }
    const pin = (X, Y, r, fill = '#2c2e32', ring = 'rgba(255,255,255,.42)') => { L.fillStyle = '#050506'; L.beginPath(); L.arc(X, Y, r + 1.2, 0, 7); L.fill(); const g = L.createRadialGradient(X - r * .35, Y - r * .35, r * .1, X, Y, r); g.addColorStop(0, '#5a5d62'); g.addColorStop(.55, fill); g.addColorStop(1, '#101113'); L.fillStyle = g; L.beginPath(); L.arc(X, Y, r, 0, 7); L.fill(); L.strokeStyle = ring; L.lineWidth = Math.max(1, r * .16); L.beginPath(); L.arc(X, Y, r * .8, 3.5, 5.6); L.stroke(); };
    pin(earFX, (earFY + gBarTop) / 2, IN(.07), '#2a2b2e'); pin(earRX, (earRY + gBarTop) / 2, IN(.07), '#2a2b2e');
    if (!trigDone) {
      const tx = earRX + (earFX - earRX) * .42, tt = slotY - IN(.12), tb = gBarTop - IN(.18); L.fillStyle = '#111214'; L.beginPath();
      L.moveTo(tx - IN(.1), tt); L.lineTo(tx + IN(.08), tt); L.bezierCurveTo(tx + IN(.02), tt + (tb - tt) * .45, tx + IN(.1), tb - IN(.12), tx + IN(.27), tb);
      L.lineTo(tx + IN(.2), tb + IN(.06)); L.bezierCurveTo(tx - IN(.04), tb - IN(.08), tx - IN(.13), tt + (tb - tt) * .45, tx - IN(.1), tt); L.fill();
      boxes.trigger = [tx - IN(.15), tt, IN(.45), tb - tt];
    }
    if (rearPin) pin(rearPin.x, rearPin.y, IN(.15));
    if (frontPin) pin(frontPin.x, frontPin.y, IN(.15));
    if (rearPin || frontPin) boxes.pins = [(rearPin || frontPin).x - IN(.2), (rearPin || frontPin).y - IN(.2), IN(.4), IN(.4)];
    fcp.forEach((h) => pin(h.x, h.y, IN(.085), '#2b2c2f', 'rgba(255,255,255,.3)'));
    if (sel) { const r = IN(.19); pin(sel.x, sel.y, r, '#1b1c1f'); L.strokeStyle = 'rgba(255,255,255,.38)'; L.lineWidth = 1.6; L.beginPath(); L.moveTo(sel.x, sel.y - r * .72); L.lineTo(sel.x, sel.y - r * .2); L.stroke(); boxes.safety = [sel.x - r, sel.y - r, r * 2, r * 2]; }
    if (catchH) {
      const MR = P.magrel, D = IN(.5);
      if (MR) { const w = D * MR.w / MR.h; L.save(); L.shadowColor = 'rgba(0,0,0,.7)'; L.shadowBlur = 4; L.fillStyle = '#1c1d20'; L.beginPath(); L.ellipse(catchH.x, catchH.y, w / 2, D / 2, 0, 0, 7); L.fill(); L.restore();
        L.save(); L.beginPath(); L.ellipse(catchH.x, catchH.y, w / 2, D / 2, 0, 0, 7); L.clip(); L.globalCompositeOperation = 'multiply'; L.drawImage(MR.c, catchH.x - w / 2, catchH.y - D / 2, w, D); L.globalCompositeOperation = 'source-over';
        L.strokeStyle = 'rgba(255,255,255,.22)'; L.lineWidth = 1.4; L.beginPath(); L.ellipse(catchH.x, catchH.y, w / 2 - 1, D / 2 - 1, 0, 3.6, 5.8); L.stroke(); L.restore(); }
      else pin(catchH.x, catchH.y, D / 2, '#202124');
      boxes.magrel = [catchH.x - D / 2, catchH.y - D / 2, D, D];
    }
    HL.filter((h) => ![sel, rearPin, frontPin, catchH, ...fcp].includes(h) && h.r < IN(.22) && h.y > lowerTopY + IN(.1)).forEach((h) => { L.fillStyle = '#141517'; L.beginPath(); L.arc(h.x, h.y, h.r + 1, 0, 7); L.fill(); });

    return { layer: Lc, boxes, rearMost, frontMost, oalIn: (frontMost - rearMost) / S };
  }

  // ---------------- site integration ----------------
  let cv = null, vpEl = null, last = null, cb = {}, seq = 0;
  const ORDER = ['optic', 'magrel', 'safety', 'trigger', 'muzzle', 'fa', 'dustcover', 'charging', 'handguard', 'upper', 'tguard', 'pins', 'mag', 'grip', 'lower', 'stock', 'barrel', 'buffertube'];

  IB2D.mount = (vp, callbacks) => {
    vpEl = vp; cb = callbacks || {};
    vp.classList.add('v2d');
    const ld = document.getElementById('loading'); if (ld) ld.remove();
    cv = document.createElement('canvas'); cv.id = 'pv2d'; cv.width = CW; cv.height = CH; vp.prepend(cv);
    const bl = vp.querySelector('.hud.bl'); if (bl) bl.textContent = '2D build preview · click a part to swap it';
    const rb = document.getElementById('refreshModel'); if (rb) { rb.textContent = 'Refresh preview'; rb.title = 'Reload the 2D preview'; }
    const mb = document.getElementById('miniBtn'); if (mb) mb.title = 'Hide the preview';
    const ml = vp.querySelector('.vpmini .lbl'); if (ml) ml.textContent = 'Preview hidden';
    const ub = document.getElementById('unminiBtn'); if (ub) ub.textContent = 'Show preview';
    const toCanvas = (e) => { const r = cv.getBoundingClientRect(); const k = Math.min(r.width / CW, r.height / CH); const ox = (r.width - CW * k) / 2, oy = (r.height - CH * k) / 2; return [(e.clientX - r.left - ox) / k, (e.clientY - r.top - oy) / k]; };
    const hit = (e) => { if (!last) return null; const [x, y] = toCanvas(e); for (const s of ORDER) { const b = last.boxes[s]; if (b && x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) return s; } return null; };
    cv.addEventListener('pointermove', (e) => { const s = hit(e); const t = document.getElementById('hoverTag'); if (!t) return;
      if (s && cb.label && cb.label(s)) { const rc = vp.getBoundingClientRect(); t.hidden = false; t.textContent = cb.label(s); t.style.left = (e.clientX - rc.left) + 'px'; t.style.top = (e.clientY - rc.top) + 'px'; cv.style.cursor = 'pointer'; }
      else { t.hidden = true; cv.style.cursor = 'default'; } });
    cv.addEventListener('pointerleave', () => { const t = document.getElementById('hoverTag'); if (t) t.hidden = true; });
    cv.addEventListener('click', (e) => { const s = hit(e); if (s && cb.pick) cb.pick(s); });
  };

  // get(slot) -> selected part object (or null)
  IB2D.render = async (get) => {
    const my = ++seq; const stand = [], missing = [];
    const slots = ['upper', 'lower', 'handguard', 'muzzle', 'stock', 'grip', 'mag', 'optic', 'trigger', 'magrel'];
    const P = {};
    await Promise.all(slots.map(async (s) => {
      const part = get(s);
      if (!part && ['muzzle', 'optic', 'stock'].includes(s)) return;          // genuinely absent: draw nothing (bare threads for muzzle)
      if (s === 'optic' && part) { const slug = slugOf(part); if (!MAN.parts[slug]) { missing.push('optic'); return; } }
      const pk = pick(s, part); if (!pk) { missing.push(s); return; }
      if (pk.stand) stand.push(s);
      try { P[s] = await loadLayer(pk.e); } catch (e) { missing.push(s); }
    }));
    if (my !== seq) return last;                                              // a newer render started
    if (!P.upper || !P.lower || !P.handguard) return null;
    const b = get('barrel'), h = get('handguard');
    const ua = P.upper.a, la = P.lower.a;
    const spacingIn = (ua.lugFront.x - ua.lugRear.x) * (ua.bodyLen_in || 7.05) / ua.faceCol;
    const lowerLen = P.lower.w * spacingIn / (la.pinFront[0] - la.pinRear[0]);
    const o = { lowerLen, hgLen: (h && h.len) || P.handguard.e.size_in[0], barrel: barrelSpec(b), lX: 430 };
    let r = compose(P, o);
    o.lX += Math.round((CW - (r.frontMost - r.rearMost)) / 2 - r.rearMost);  // centre the rifle
    r = compose(P, o);
    // paint: studio backdrop, floor shadow, layered rifle
    const x = cv.getContext('2d');
    const bg = x.createLinearGradient(0, 0, 0, CH); bg.addColorStop(0, '#f2f2ef'); bg.addColorStop(.75, '#dededa'); bg.addColorStop(1, '#cfcfca'); x.fillStyle = bg; x.fillRect(0, 0, CW, CH);
    x.save(); x.translate(CW / 2, CH - 40); x.scale(1, .07); const sg = x.createRadialGradient(0, 0, 10, 0, 0, 640); sg.addColorStop(0, 'rgba(0,0,0,.30)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sg; x.beginPath(); x.arc(0, 0, 640, 0, 7); x.fill(); x.restore();
    x.save(); x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowBlur = 18; x.shadowOffsetY = 10; x.drawImage(r.layer, 0, 0); x.restore();
    r.standIns = stand; r.missing = missing; r.threadSrc = o.barrel.threadSrc;
    const bl = vpEl && vpEl.querySelector('.hud.bl');
    if (bl) { const lab = (s) => (cb.slotLabel ? cb.slotLabel(s) : s);
      const bits = []; if (stand.length) bits.push('stand-in photo: ' + stand.map(lab).join(', ')); if (missing.length) bits.push('not pictured yet: ' + missing.map(lab).join(', '));
      bl.textContent = bits.length ? '2D preview · ' + bits.join(' · ') : '2D build preview · click a part to swap it'; }
    last = r; return r;
  };
})();
