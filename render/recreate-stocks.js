// IronBench — side-profile recreations for stocks whose PSA gallery has no usable side view.
// Runs in the processing tab after ib2d.js (needs IB.SG galleries, IB.cutStrict, IB.toneBlack, IB.desat).
// Every drawing is made at 100 px per inch, butt on the left, muzzle to the right, tube centreline at
// 0.675" below the stock's top edge (0.10" wall + 0.575" tube radius) unless noted.
// Colours were sampled from the PSA photos: black glass-filled polymer, mid tone ~rgb(34–50), neutral hue.
(function () {
  const IB = window.IB, PPI = 100, I = (v) => v * PPI;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(I(w)); c.height = Math.ceil(I(h)); return c; };
  // matte polymer fill for a path: vertical light falloff + fine grain, clipped to the shape
  function polymer(x, path, y0, y1, base = [38, 39, 41], grain = 6) {
    const g = x.createLinearGradient(0, y0, 0, y1), c = (k) => `rgb(${base.map((v) => Math.max(0, Math.min(255, Math.round(v * k)))).join(',')})`;
    g.addColorStop(0, c(1.9)); g.addColorStop(.06, c(1.35)); g.addColorStop(.35, c(1.05)); g.addColorStop(.8, c(.78)); g.addColorStop(1, c(.55));
    x.save(); x.fillStyle = g; x.fill(path); x.clip(path);
    if (grain) { const W = x.canvas.width, H = x.canvas.height, n = (W * H) / 30; x.globalAlpha = .045; for (let i = 0; i < n; i++) { x.fillStyle = Math.random() < .5 ? '#777' : '#000'; x.fillRect(Math.random() * W, Math.random() * H, 1.2, 1.2); } x.globalAlpha = 1; }
    x.restore();
    x.save(); x.strokeStyle = 'rgba(0,0,0,.85)'; x.lineWidth = 2; x.stroke(path); x.restore();
  }
  const edgeHi = (x, pts, a = .22, w = 2) => { x.save(); x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = w; x.beginPath(); x.moveTo(I(pts[0][0]), I(pts[0][1])); for (const p of pts.slice(1)) x.lineTo(I(p[0]), I(p[1])); x.stroke(); x.restore(); };
  const groove = (x, x1, y1, x2, y2, w = 3) => { x.save(); x.lineCap = 'round'; x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = w; x.beginPath(); x.moveTo(I(x1), I(y1)); x.lineTo(I(x2), I(y2)); x.stroke(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; x.beginPath(); x.moveTo(I(x1), I(y1) + w * .7); x.lineTo(I(x2), I(y2) + w * .7); x.stroke(); x.restore(); };
  const socket = (x, cx, cy, r) => { // QD sling socket: raised boss + recessed cup
    const g = x.createRadialGradient(I(cx - r * .3), I(cy - r * .3), 1, I(cx), I(cy), I(r * 1.5)); g.addColorStop(0, '#5a5c60'); g.addColorStop(.6, '#2a2b2e'); g.addColorStop(1, '#151618');
    x.fillStyle = g; x.beginPath(); x.arc(I(cx), I(cy), I(r * 1.45), 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.8)'; x.lineWidth = 1.5; x.stroke();
    x.fillStyle = '#0b0b0c'; x.beginPath(); x.arc(I(cx), I(cy), I(r), 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(I(cx), I(cy), I(r), 2.3, 4.2); x.stroke(); };
  const rubberPad = (x, x1, y1, w, h, ribs = 9) => { // butt pad seen from the side: rubber slab with grip ribs on the rear face
    const p = new Path2D(); p.roundRect(I(x1), I(y1), I(w), I(h), I(Math.min(w * .45, .3))); polymer(x, p, I(y1), I(y1 + h), [30, 30, 31], 4);
    x.save(); x.clip(p); x.fillStyle = 'rgba(0,0,0,.45)'; for (let i = 1; i <= ribs; i++) { const yy = I(y1 + (h * i) / (ribs + 1)); x.fillRect(I(x1), yy - 2, I(w * .38), 4); } x.restore();
    edgeHi(x, [[x1 + w - .04, y1 + .15], [x1 + w - .04, y1 + h - .15]], .12, 1.5); };

  // ---------------- Luth-AR MBA-5 (collapsible, black) ----------------
  // 7.9" x 5.85": long tube housing with flared cheek rest, vertical rear section, rubber pad, angled lower strut
  // leaving an open triangle, integral Picatinny segment at the bottom rear, paddle adjustment lever under the
  // front, QD cups on both ends. LOP 11.5–14.5" (Shooting Illustrated); length estimated from LOP vs. MOE/DT.
  IB.drawMBA5 = () => {
    const L = 7.9, H = 5.85, c = mk(L, H), x = c.getContext('2d');
    const body = new Path2D();
    body.moveTo(I(.6), I(.12)); body.lineTo(I(L - .12), I(.05)); body.quadraticCurveTo(I(L), I(.05), I(L), I(.2));
    body.lineTo(I(L), I(1.42)); body.lineTo(I(5.9), I(1.5));                          // housing underside, front
    body.quadraticCurveTo(I(5.45), I(1.52), I(5.2), I(1.75));                        // strut root
    body.lineTo(I(2.25), I(5.12)); body.quadraticCurveTo(I(2.05), I(5.4), I(1.75), I(5.42)); // strut down to the toe
    body.lineTo(I(.6), I(5.42)); body.lineTo(I(.6), I(.12)); body.closePath();
    // open triangle between the rear section, the housing and the strut
    const win = new Path2D(); win.moveTo(I(1.75), I(1.75)); win.lineTo(I(4.55), I(1.75)); win.quadraticCurveTo(I(4.7), I(1.78), I(4.55), I(1.95)); win.lineTo(I(1.95), I(4.8)); win.quadraticCurveTo(I(1.75), I(4.95), I(1.75), I(4.7)); win.closePath();
    x.save(); polymer(x, body, 0, I(5.5)); x.globalCompositeOperation = 'destination-out'; x.fill(win); x.restore();
    x.save(); x.strokeStyle = 'rgba(0,0,0,.8)'; x.lineWidth = 2; x.stroke(win); x.restore();
    edgeHi(x, [[.7, .14], [L - .15, .07]], .3, 2.5);                                  // top edge catch-light
    edgeHi(x, [[1.8, 1.78], [4.5, 1.78]], .1, 1.5);
    // cheek-rest flare: soft highlight band and its lower parting line
    x.save(); const g = x.createLinearGradient(0, I(.25), 0, I(1.1)); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(I(.8), I(.25), I(5.4), I(.85)); x.restore();
    groove(x, 1.0, 1.15, 6.3, 1.1, 2);
    groove(x, 6.5, .35, 7.6, .35, 2); groove(x, 6.5, 1.15, 7.6, 1.15, 2);            // front collar seams
    // rear section: recessed panel + sling slot
    const pan = new Path2D(); pan.roundRect(I(.85), I(1.55), I(.6), I(3.4), I(.12)); x.fillStyle = 'rgba(0,0,0,.28)'; x.fill(pan); x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 1.5; x.stroke(pan);
    // integral Picatinny segment along the toe
    x.fillStyle = '#1a1b1d'; x.fillRect(I(.75), I(5.42), I(1.35), I(.32)); for (let i = 0; i < 6; i++) { x.fillStyle = '#0c0c0d'; x.fillRect(I(.82 + i * .21), I(5.6), I(.1), I(.14)); }
    // paddle adjustment lever under the front of the housing
    const pad = new Path2D(); pad.moveTo(I(6.05), I(1.45)); pad.lineTo(I(7.55), I(1.42)); pad.quadraticCurveTo(I(7.7), I(1.75), I(7.35), I(1.85)); pad.lineTo(I(6.35), I(1.86)); pad.quadraticCurveTo(I(6.0), I(1.8), I(6.05), I(1.45)); pad.closePath();
    polymer(x, pad, I(1.4), I(1.9), [30, 31, 33], 0); for (let i = 0; i < 5; i++) groove(x, 6.6 + i * .17, 1.55, 6.6 + i * .17, 1.78, 1.5);
    socket(x, 7.05, .78, .17); socket(x, 1.15, 1.0, .17);
    rubberPad(x, 0, .02, .62, 5.42);
    // anti-rattle clamp screw at the front lower corner
    x.fillStyle = '#0d0d0e'; x.beginPath(); x.arc(I(7.7), I(1.25), I(.07), 0, 7); x.fill();
    return { c, len: L, hgt: H, tubeY: .675 / H, note: 'recreated: PSA photo is a lifestyle shot' };
  };

  // ---------------- Reptilia RECC-E QD front end (black) ----------------
  // The PSA listing is the front-end module only (MPN 100-223), not a full stock. 2.35" long sleeve that rides the
  // tube, flat top, octagonal channel inside, QD socket boss low on the front, stepped rear lip where it meets the
  // stock body. Drawn as it appears installed on the tube.
  IB.drawRECCE = () => {
    const L = 2.35, H = 2.05, c = mk(L, H), x = c.getContext('2d');
    const p = new Path2D();
    p.moveTo(I(.18), I(.06)); p.lineTo(I(L - .12), I(.06)); p.quadraticCurveTo(I(L), I(.06), I(L), I(.2));
    p.lineTo(I(L), I(1.32)); p.quadraticCurveTo(I(L), I(1.45), I(L - .1), I(1.5));
    p.lineTo(I(L - .1), I(1.78)); p.quadraticCurveTo(I(L - .12), I(1.98), I(L - .45), I(1.98)); // QD boss
    p.lineTo(I(1.3), I(1.98)); p.quadraticCurveTo(I(1.05), I(1.98), I(.95), I(1.62));
    p.lineTo(I(.18), I(1.5)); p.lineTo(I(.18), I(.06)); p.closePath();
    polymer(x, p, 0, I(2.0), [36, 37, 39]);
    // stepped rear lip
    const lip = new Path2D(); lip.rect(I(0), I(.14), I(.2), I(1.28)); polymer(x, lip, I(.14), I(1.42), [28, 29, 31], 0);
    edgeHi(x, [[.25, .08], [L - .14, .08]], .3, 2.5);
    groove(x, .55, .3, .55, 1.35, 2); groove(x, 1.75, .3, 1.75, 1.35, 2);              // moulded ribs
    socket(x, L - .55, 1.67, .16);
    x.fillStyle = '#0d0d0e'; x.beginPath(); x.arc(I(1.15), I(.72), I(.06), 0, 7); x.fill();   // retention screw
    return { c, len: L, hgt: H, tubeY: .675 / H, note: 'recreated: PSA only shows a rear 3/4 view; module only' };
  };

  // ---------------- Doublestar ARFX skeleton stock (rifle length, black) ----------------
  // PSA's only photo is an exploded layout, but the frame in it is a true side view. The frame is cut from the
  // photo; the foam overtube from the same photo is fitted between the rear ring and the front collar; the
  // butt pad (seen face-on in the photo) is redrawn in profile with the photo's rubber tone.
  IB.buildARFX = async () => {
    const u = IB.orig(IB.SG['doublestar-corp-arfx-skeleton-stock-black'][0]); const bm = await IB.bitmap(u);
    const cut = IB.cutStrict(bm, 200, 2000), W = cut.width, H = cut.height, d = cut.getContext('2d').getImageData(0, 0, W, H).data;
    const lab = new Int32Array(W * H).fill(-1), comps = [];
    for (let p0 = 0; p0 < W * H; p0++) { if (lab[p0] >= 0 || d[p0 * 4 + 3] < 100) continue; const id = comps.length, st = [p0]; let n = 0, x1 = 1e9, y1 = 1e9, x2 = 0, y2 = 0; lab[p0] = id;
      while (st.length) { const q = st.pop(); n++; const qx = q % W, qy = (q / W) | 0; x1 = Math.min(x1, qx); x2 = Math.max(x2, qx); y1 = Math.min(y1, qy); y2 = Math.max(y2, qy);
        for (const r of [qx > 0 ? q - 1 : -1, qx < W - 1 ? q + 1 : -1, qy > 0 ? q - W : -1, qy < H - 1 ? q + W : -1]) if (r >= 0 && lab[r] < 0 && d[r * 4 + 3] >= 100) { lab[r] = id; st.push(r); } }
      comps.push({ id, n, box: [x1, y1, x2, y2] }); }
    comps.sort((a, b) => b.n - a.n);
    const frame = comps.find((o) => o.box[2] - o.box[0] > W * .6), foam = comps.find((o) => o !== frame && (o.box[2] - o.box[0]) > 4 * (o.box[3] - o.box[1]));
    const only = (o) => { const [x1, y1, x2, y2] = o.box, c = document.createElement('canvas'); c.width = x2 - x1 + 1; c.height = y2 - y1 + 1; const x = c.getContext('2d'), im = x.createImageData(c.width, c.height);
      for (let y = y1; y <= y2; y++) for (let a = x1; a <= x2; a++) { const p = y * W + a; if (lab[p] !== o.id) continue; const j = ((y - y1) * c.width + (a - x1)) * 4; im.data[j] = d[p * 4]; im.data[j + 1] = d[p * 4 + 1]; im.data[j + 2] = d[p * 4 + 2]; im.data[j + 3] = d[p * 4 + 3]; }
      x.putImageData(im, 0, 0); return c; };
    const F = only(frame), FO = only(foam);
    // scale: rear plate height (frame bbox height) = 4.6" -> photo px per inch
    const ppi = F.height / 4.6, padIn = .72, L = padIn + F.width / ppi, Hh = F.height / ppi;
    const c = mk(L, Hh + .02), x = c.getContext('2d');
    // tube centreline: front collar top + 0.66"
    const fd = F.getContext('2d').getImageData(0, 0, F.width, F.height).data; let collarTop = 0;
    for (let y = 0; y < F.height; y++) if (fd[(y * F.width + F.width - 18) * 4 + 3] > 128) { collarTop = y; break; }
    const tubeYin = collarTop / ppi + .66;
    // foam overtube (1.35" dia) from the rear ring to the front collar
    const ringX = padIn + 1.45, collarX = padIn + (F.width - 70) / ppi;
    x.drawImage(FO, I(ringX), I(tubeYin - .68), I(collarX - ringX), I(1.36));
    x.drawImage(F, I(padIn), 0, I(F.width / ppi), I(Hh));
    rubberPad(x, 0, .05, padIn + .04, Hh - .1, 11);
    IB.toneBlack(c, 34); IB.desat(c);
    return { c, len: +L.toFixed(2), hgt: +Hh.toFixed(2), tubeY: tubeYin / (Hh + .02), note: 'assembled from the exploded-parts photo: frame + foam cut from it, pad redrawn' };
  };
})();
