/* Origin: a pinned, scroll-scrubbed scene.
   0–4: the orchard turns through spring, summer, autumn (harvest) and winter.
   4–5: the view becomes a map and the route draws from Santa Cruz do Sul to the Netherlands. */
const Origin = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const leaves = [], catkins = [], nuts = [], frost = [], segs = [], trunks = [];
  let cv, ctx, W = 0, H = 0, dpr = 1, staticLayer = null, map, route, routeLen = 0, kmText, progress = 0, active = false;

  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };

  // recursive branches; tips collect leaves, catkins and nuts
  function branch(x, y, ang, len, w, depth) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    const mx = (x + x2) / 2 + (rnd() - .5) * len * .3, my = (y + y2) / 2 + (rnd() - .5) * len * .2;
    segs.push([x, y, mx, my, x2, y2, w]);
    if (depth <= 0 || len < 14) { tip(x2, y2); return; }
    const n = depth > 3 ? 2 : 2 + (rnd() > .5 ? 1 : 0);
    for (let i = 0; i < n; i++) branch(x2, y2, ang + (rnd() - .5) * 1.1 + (i - (n - 1) / 2) * .5, len * (.68 + rnd() * .12), w * .66, depth - 1);
    if (depth < 3) tip(x2, y2);
  }
  function tip(x, y) {
    for (let i = 0; i < 3; i++) leaves.push({ x: x + (rnd() - .5) * 26, y: y + (rnd() - .5) * 20, r: rnd() * Math.PI, s: .7 + rnd() * .6, fall: rnd() });
    if (rnd() > .45) catkins.push({ x, y, l: 14 + rnd() * 14 });
    if (rnd() > .55) nuts.push({ x: x + (rnd() - .5) * 10, y: y + 6, drop: rnd(), gx: x + (rnd() - .5) * 60 });
  }
  function tree(x, base, s) {
    trunks.push([x, base, s]);
    branch(x + 3 * s, base - 140 * s, -Math.PI / 2 - .5, 70 * s, 9 * s, 5);
    branch(x + 3 * s, base - 140 * s, -Math.PI / 2 + .5, 70 * s, 9 * s, 5);
    branch(x + 3 * s, base - 145 * s, -Math.PI / 2, 80 * s, 8 * s, 5);
  }
  function buildOrchard() {
    cv = document.getElementById('orchard'); ctx = cv.getContext('2d');
    for (let i = 0; i < 5; i++) tree(60 + i * 175, 452, .42);
    tree(400, 520, 1.15); tree(110, 516, .7); tree(690, 516, .72);
    for (let i = 0; i < 90; i++) frost.push([rnd() * 800, rnd() * 600, 1 + rnd() * 2]);
    new ResizeObserver(resize).observe(cv);
  }
  // the scene is 800×600, drawn like preserveAspectRatio "xMidYMid slice"
  let sc = 1, ox = 0, oy = 0;
  function resize() {
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    dpr = Util.phone.matches ? 1 : Math.min(1.5, devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    sc = Math.max(W / 800, H / 600); ox = (W - 800 * sc) / 2; oy = (H - 600 * sc) / 2;
    // hills and trees never change: draw them once
    staticLayer = document.createElement('canvas'); staticLayer.width = cv.width; staticLayer.height = cv.height;
    const s = staticLayer.getContext('2d'); s.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    s.fillStyle = '#9cc9a0'; s.fill(new Path2D('M0 410C120 360 220 380 330 350S560 330 800 380V600H0Z'));
    s.fillStyle = '#7db37f'; s.fill(new Path2D('M0 450C160 420 300 440 420 420S640 400 800 440V600H0Z'));
    s.fillStyle = '#5b3a22'; s.strokeStyle = '#5b3a22'; s.lineCap = 'round';
    trunks.forEach(([x, b, k]) => s.fill(new Path2D(`M${x - 9 * k} ${b}C${x - 6 * k} ${b - 60 * k} ${x - 4 * k} ${b - 110 * k} ${x} ${b - 150 * k}L${x + 6 * k} ${b - 150 * k}C${x + 6 * k} ${b - 100 * k} ${x + 8 * k} ${b - 50 * k} ${x + 12 * k} ${b}Z`)));
    segs.forEach(([x, y, mx, my, x2, y2, w]) => { s.lineWidth = w; s.beginPath(); s.moveTo(x, y); s.quadraticCurveTo(mx, my, x2, y2); s.stroke(); });
    render(progress);
  }

  // coarse outlines, enough to read as a stylised map (lon, lat)
  const SA = [[-77, 8], [-72, 12], [-62, 10.5], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5.5], [-35, -9], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38.5], [-62, -41], [-65, -45], [-68, -50], [-69, -55], [-74, -52], [-73.5, -44], [-71.5, -30], [-70.5, -18], [-76, -14], [-81, -5], [-80, 0], [-77, 4]];
  const AF = [[-17, 21], [-17, 15], [-12, 7], [-8, 4.5], [0, 5.5], [9, 4], [9, -1], [12, -6], [13, -12], [12, -17], [15, -27], [18, -34.5], [25, -34], [32, -29], [35, -24], [40, -15], [40, -10], [39, -5], [42, 0], [51, 11], [43, 12], [32, 30], [20, 32], [10, 37], [-6, 36], [-10, 30], [-13, 27]];
  const EU = [[-9, 37], [-9, 43], [-2, 43.5], [-1.5, 46.5], [-4.5, 48.5], [-1.5, 49.7], [1.5, 51], [4, 51.5], [4.7, 53], [8, 54], [8.5, 57], [10.5, 57.7], [12, 54.5], [20, 54.5], [24, 57], [24, 60], [30, 60], [32, 52], [30, 45], [28, 41], [24, 40], [23, 36.5], [20, 39.5], [16, 38], [16, 41], [12.5, 44], [13.5, 45.5], [10, 44], [6.5, 43], [3, 43.3], [0, 38.5], [-2, 36.7], [-5.5, 36]];
  const UK = [[-5.7, 50], [1.4, 51.2], [1.7, 52.7], [0, 53.5], [-1.6, 55.5], [-2, 57.6], [-5, 58.6], [-6, 56.5], [-4.8, 54.8], [-3, 53.4], [-4.6, 52.7], [-5.2, 51.7]];
  const NA = [[-85, 21], [-87, 16], [-83, 10], [-77, 8], [-80, 9], [-85, 12], [-90, 14], [-95, 16], [-97, 21], [-97, 26], [-90, 30], [-83, 29], [-81, 25], [-80, 31], [-76, 35], [-70, 42], [-66, 45], [-60, 47], [-53, 47], [-56, 52], [-64, 60], [-78, 62], [-95, 62], [-95, 21]];
  const P = ([lon, lat]) => [400 + (lon + 20) * 4.67, 300 - (lat - 2) * 4.67];
  function smooth(pts) {
    const p = pts.map(P); let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length; i++) {
      const p0 = p[(i - 1 + p.length) % p.length], p1 = p[i], p2 = p[(i + 1) % p.length], p3 = p[(i + 2) % p.length];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }
  function buildMap() {
    map = document.getElementById('map');
    el('rect', { x: -400, y: -300, width: 1600, height: 1200, fill: '#285c69' }, map);
    const waves = el('g', { stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, map);
    for (let y = 40; y < 600; y += 46) for (let x = (y / 46 % 2) * 40; x < 800; x += 90) el('path', { d: `M${x} ${y}q10 -8 20 0t20 0` }, waves);
    const land = el('g', { fill: '#f6efe2', stroke: '#13333a', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, map);
    [SA, AF, EU, UK, NA].forEach(s => el('path', { d: smooth(s) }, land));
    // Rio Grande do Sul highlighted
    const rs = el('path', { d: smooth([[-57.6, -30.2], [-53.5, -27.2], [-50, -29.3], [-50.6, -31], [-52.7, -33.7], [-53.4, -33.2], [-55.6, -30.9]]), fill: '#e88028', stroke: '#13333a', 'stroke-width': 1.5 }, map);
    const nl = el('path', { d: smooth([[3.4, 51.4], [6.1, 50.8], [7.2, 52.2], [7.1, 53.5], [5.5, 53.4], [4.7, 52.9]]), fill: '#e88028', stroke: '#13333a', 'stroke-width': 1.5 }, map);
    const a = P([-52.43, -29.72]), b = P([4.48, 51.92]);
    const c1 = P([-30, -24]), c2 = P([-24, 44]);
    route = el('path', { d: `M${a[0]} ${a[1]}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b[0]} ${b[1]}`, fill: 'none', stroke: '#f6d641', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': '2 9' }, map);
    const routeMask = el('path', { d: route.getAttribute('d'), fill: 'none', stroke: '#fff', 'stroke-width': 8 });
    const m = el('mask', { id: 'routeMask' }, map); m.appendChild(routeMask);
    route.setAttribute('mask', 'url(#routeMask)');
    routeLen = routeMask.getTotalLength();
    routeMask.setAttribute('stroke-dasharray', routeLen); routeMask.setAttribute('stroke-dashoffset', routeLen);
    route._mask = routeMask;
    const pin = (p, label, anchor, dy) => {
      const g = el('g', {}, map);
      el('circle', { cx: p[0], cy: p[1], r: 6, fill: '#13333a', stroke: '#f6efe2', 'stroke-width': 2.5 }, g);
      const t = el('text', { x: p[0] + (anchor === 'end' ? -12 : 12), y: p[1] + dy, 'text-anchor': anchor, fill: '#f6efe2', stroke: '#285c69', 'stroke-width': 5, 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'font-family': 'Josefin Sans, sans-serif', 'font-weight': 700, 'font-size': 15, 'letter-spacing': 2 }, g);
      t.textContent = label; return g;
    };
    pin(a, 'SANTA CRUZ DO SUL', 'start', 22);
    pin(b, 'NEDERLAND', 'start', -12);
    kmText = el('text', { x: 400, y: 560, 'text-anchor': 'middle', fill: '#f6efe2', 'font-family': 'Literata, serif', 'font-weight': 600, 'font-size': 28, 'font-variant-numeric': 'tabular-nums' }, map);
    kmText.textContent = '0 km';
  }

  const lerpC = (a, b, t) => Util.mix(a, b, Util.clamp(t, 0, 1));
  const GROUND = new Path2D('M0 500C200 480 600 486 800 500V600H0Z');
  const win = (p, a, b, fade = .35) => Util.clamp(Math.min((p - a + fade) / fade, (b + fade - p) / fade), 0, 1);

  function render(p) {
    progress = p;
    const mp = Util.clamp((p - 3.85) / .3, 0, 1);
    if (staticLayer && mp < 1) {
      const i = Math.min(3, Math.floor(p)), f = p - Math.floor(p);
      const skies = ['#d8eef5', '#9fd6ee', '#f3d9ad', '#dfe6ea', '#dfe6ea'];
      const sunY = [130, 80, 150, 230, 230];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = lerpC(skies[i], skies[Math.min(4, i + 1)], (f - .6) / .4); ctx.fillRect(0, 0, W, H);
      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
      ctx.fillStyle = p > 2.6 && p < 3.6 ? '#f2e6b0' : '#f6d641';
      ctx.beginPath(); ctx.arc(640, Util.lerp(sunY[i], sunY[Math.min(4, i + 1)], Util.clamp((f - .5) / .5, 0, 1)), 46, 0, Math.PI * 2); ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(staticLayer, 0, 0);
      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
      ctx.fillStyle = p > 2.9 ? lerpC('#c9b48a', '#e4e7e2', (p - 2.9) / .4) : '#c9b48a';
      ctx.fill(GROUND);
      // leaves: small and fresh, full and dark, golden and falling, gone
      if (p < 3) {
        ctx.fillStyle = p < 1 ? lerpC('#a8d468', '#4d942f', p) : p < 2 ? lerpC('#4d942f', '#5a8f2e', p - 1) : lerpC('#d8a83a', '#b36b28', p - 2);
        const grow = Util.clamp(.45 + p * .55, 0, 1);
        ctx.beginPath();
        for (const l of leaves) {
          const fallT = Util.clamp((p - 2.15 - l.fall * .7) / .5, 0, 1); if (fallT >= 1) continue;
          const s = l.s * grow * (1 - fallT * .3);
          const x = l.x + fallT * 30 * (l.fall - .5), y = l.y + fallT * (520 - l.y) * .9;
          // a leaf: two curves between its tips (much cheaper than rotated ellipses)
          const ang = l.r + fallT * 3.5, ux = Math.cos(ang) * 7 * s, uy = Math.sin(ang) * 7 * s, vx = -uy * .55, vy = ux * .55;
          ctx.moveTo(x - ux, y - uy); ctx.quadraticCurveTo(x + vx, y + vy, x + ux, y + uy); ctx.quadraticCurveTo(x - vx, y - vy, x - ux, y - uy);
        }
        ctx.fill();
      }
      const ca = win(p, 0, .8);
      if (ca > 0) {
        ctx.globalAlpha = ca; ctx.strokeStyle = '#c9c25a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath();
        for (const k of catkins) { ctx.moveTo(k.x, k.y); ctx.quadraticCurveTo(k.x + 2, k.y + k.l / 2, k.x - 1, k.y + k.l); }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      const na = p > 2.75 ? Util.clamp(1 - (p - 2.75) / .3, 0, 1) : Util.clamp((p - .8) / .4, 0, 1);
      if (na > 0) {
        ctx.globalAlpha = na; ctx.fillStyle = p < 1.8 ? '#7aa63b' : lerpC('#7aa63b', '#7a4a22', (p - 1.8) / .4); ctx.beginPath();
        for (const n of nuts) {
          const d = Util.clamp((p - 2 - n.drop * .6) / .4, 0, 1), x = Util.lerp(n.x, n.gx, d), y = Util.lerp(n.y, 506 + n.drop * 30, d * d);
          ctx.moveTo(x + 4.5, y); ctx.ellipse(x, y, 4.5, 3.4, 0, 0, Math.PI * 2);
        }
        ctx.fill(); ctx.globalAlpha = 1;
      }
      const fa = win(p, 3, 4, .3) * .9;
      if (fa > 0) { ctx.globalAlpha = fa; ctx.fillStyle = '#fff'; ctx.beginPath(); for (const [x, y, r] of frost) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); } ctx.fill(); ctx.globalAlpha = 1; }
    }
    if (cv) cv.style.opacity = 1 - mp * .9;
    // map
    map.style.opacity = mp;
    const r = Util.clamp((p - 4.05) / .85, 0, 1);
    route._mask.setAttribute('stroke-dashoffset', routeLen * (1 - r));
    kmText.textContent = String(Math.round(10687 * r)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ' km';
    // copy and dial
    const step = Math.min(4, Math.floor(p + .15));
    document.querySelectorAll('.season').forEach(s => s.classList.toggle('on', +s.dataset.step === step));
    document.querySelectorAll('#seasonDial span').forEach((s, j) => s.style.setProperty('--p', Util.clamp(p - j, 0, 1)));
    active = p > 4.02 && p < 4.98;
  }
  // a point on the route in screen coordinates, for the bird
  function routePoint() {
    const r = Util.clamp((progress - 4.05) / .85, 0, 1);
    const pt = route._mask.getPointAtLength(routeLen * r);
    const m = map.getScreenCTM(); if (!m) return null;
    return { x: m.a * pt.x + m.c * pt.y + m.e, y: m.b * pt.x + m.d * pt.y + m.f };
  }

  let pendingP = 0, drawQueued = false;
  function init() {
    buildOrchard(); buildMap(); render(0);
    if (!window.ScrollTrigger) { document.querySelectorAll('.season').forEach(s => s.classList.add('on')); return; }
    ScrollTrigger.create({
      trigger: '.origin', start: 'top top', end: () => '+=' + innerHeight * 4.2, pin: '.origin-pin', scrub: true,
      onUpdate: self => { pendingP = self.progress * 5; if (!drawQueued) { drawQueued = true; requestAnimationFrame(() => { drawQueued = false; render(pendingP); }); } },
    });
  }
  return { init, routePoint, get onRoute() { return active; }, get progress() { return progress; } };
})();
