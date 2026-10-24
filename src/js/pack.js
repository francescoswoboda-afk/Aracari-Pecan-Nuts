/* A pack in CSS 3D. Drag to turn it; it settles on its front or back with a
   little inertia. opts.fmt: 'pouch' (default) or 'tube'.
   - Pouch: two flat faces, the v3 front and the printed back, with a foil sheen.
   - Tube: a real cylinder of TUBE_SIDES strips wrapped in the flat label
     (front half + back half, src/assets/<slug>-tube-label.webp, full resolution,
     loaded as a separate file), with a thin rim at the bottom.
     The copper slip lid is NOT made of 3D strips: dozens of extra 3D layers per
     tube made the browser drop frames. It is round and plain, so it is drawn as
     one SVG over the top of the tube (.lid2d): the lid's top and
     bottom circles are projected with the same tilt and perspective
     as the tube, and the outline between them is filled with copper.
     Light works the same way: a cylinder is lit the same at any turn, so the
     shading is a smooth gradient in that SVG, filling the tube's exact projected
     outline. The strips themselves never change while the tube turns, so the
     GPU only moves them (no repaints): cheap enough for 120 Hz screens.
   All motion is time-based, so packs move at the same speed at any refresh rate. */
const TUBE_SIDES = 24;   // fewer strips = fewer 3D layers; the light no longer depends on them
const PERSPECTIVE = 1200;   // must match .pack3d { perspective } in styles.css
let lidCount = 0;           // unique ids for each pack's SVG gradients
// copper band on the top of the label, under the lid, so nothing light can show at the lid's edge
const LID_METAL = 'linear-gradient(#4a1f08, #f3b67e 9%, #d98a4a 22%, #c06f33 45%, #a85a24 70%, #d08548 84%, #7a3712 94%, #3e1806)';
// light from the front-left: how dark and how bright a surface turned by a degrees (0 = facing you) looks
const tubeDark = a => { const l = Math.max(0, Math.cos((a + 22) * Math.PI / 180)); return .62 * (1 - l) ** 1.25; };
const tubeShine = a => .26 * Math.max(0, Math.cos((a + 30) * Math.PI / 180)) ** 24;
// SVG gradient stops across the tube's outline: at screen position u (-1 left edge .. 1 right edge) the
// surface faces the viewer at asin(u). Denser near the edges, where the light changes fastest.
function tubeLightStops(fn, color) {
  const us = [-1, -.98, -.94, -.88, -.8, -.7, -.58, -.45, -.3, -.15, 0, .15, .3, .45, .58, .7, .8, .88, .94, .98, 1];
  return us.map(u => `<stop offset="${((u + 1) / 2).toFixed(3)}" stop-color="${color}" stop-opacity="${fn(Math.asin(u) * 180 / Math.PI).toFixed(3)}"/>`).join('');
}
// One stylesheet rule per flavour for the tube label, written once. Passing the label through a CSS
// variable made the browser re-read the whole image string on every restyle, which cost frames.
let tubeStylesDone = false;
function tubeStyles() {
  if (tubeStylesDone) return; tubeStylesDone = true;
  // the lid casts a soft shadow onto the label; a thin rim at the bottom
  const shadow = 'linear-gradient(rgba(20,8,2,.3), rgba(20,8,2,0))';
  const rim = 'linear-gradient(#5a260b, #c9773a 25%, #f0b27a 50%, #b0602a 78%, #4a1f08)';   // thin copper rim
  const el = document.createElement('style');
  el.textContent = DATA.flavours.map(f => `.tube3d[data-f="${f.id}"] .tube-side{background-image:${LID_METAL},${shadow},${rim},url("${f.img.label}")}`).join('\n');
  document.head.append(el);
}
function createPack(host, flavour, opts = {}) {
  tubeStyles();
  const lidId = ++lidCount;
  host.classList.add('pack3d');
  host.innerHTML = `
    <div class="pack-float"><div class="pack-inner">
      <div class="pack-face pack-front"><img alt="" draggable="false" decoding="async"><div class="pack-sheen"></div></div>
      <div class="pack-face pack-back"><img alt="" draggable="false" decoding="async"></div>
      <div class="tube3d" hidden>
        ${Array.from({ length: TUBE_SIDES }, (_, i) => `<div class="tube-side" style="--i:${i}"></div>`).join('')}
        <div class="tube-cap tube-bottom"></div>
      </div>
    </div>
      <svg class="lid2d" hidden aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="lidV${lidId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#4a1f08"/><stop offset=".12" stop-color="#f3b67e"/><stop offset=".3" stop-color="#d98a4a"/>
            <stop offset=".55" stop-color="#c06f33"/><stop offset=".78" stop-color="#a85a24"/><stop offset="1" stop-color="#8a4519"/>
          </linearGradient>
          <linearGradient id="lidH${lidId}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#140802" stop-opacity=".6"/><stop offset=".1" stop-color="#140802" stop-opacity=".2"/>
            <stop offset=".26" stop-color="#fff0dc" stop-opacity=".26"/><stop offset=".4" stop-color="#fff0dc" stop-opacity="0"/>
            <stop offset=".62" stop-color="#140802" stop-opacity="0"/><stop offset=".86" stop-color="#140802" stop-opacity=".28"/>
            <stop offset="1" stop-color="#140802" stop-opacity=".62"/>
          </linearGradient>
          <radialGradient id="lidT${lidId}" cx=".42" cy=".4" r=".7">
            <stop offset="0" stop-color="#eaa66c"/><stop offset=".6" stop-color="#bd6c30"/><stop offset="1" stop-color="#8f4a1d"/>
          </radialGradient>
          <linearGradient id="tubeD${lidId}" x1="0" y1="0" x2="1" y2="0">${tubeLightStops(tubeDark, '#160902')}</linearGradient>
          <linearGradient id="tubeL${lidId}" x1="0" y1="0" x2="1" y2="0">${tubeLightStops(tubeShine, '#fff6e6')}</linearGradient>
        </defs>
        <path class="tube-light" fill="url(#tubeD${lidId})"/>
        <path class="tube-light" fill="url(#tubeL${lidId})"/>
        <path class="lid-band" fill="url(#lidV${lidId})"/>
        <path class="lid-band" fill="url(#lidH${lidId})"/>
        <path class="lid-top-edge" fill="none" stroke="#f8c896" stroke-width="1.6" stroke-linecap="round"/>
        <path class="lid-low-edge" fill="none" stroke="#e7a56b" stroke-width="1.4" stroke-linecap="round"/>
        <path class="lid-seam" fill="none" stroke="#3a1606" stroke-width="1.3" stroke-linecap="round"/>
        <path class="lid-cap" fill="url(#lidT${lidId})" stroke="#f6c290" stroke-width="1.4"/>
      </svg>
    </div>
    ${opts.shadow === false ? '' : '<div class="pack-shadow"></div>'}`;
  const inner = host.querySelector('.pack-inner'), float = host.querySelector('.pack-float');
  const img = host.querySelector('.pack-front img'), sheen = host.querySelector('.pack-sheen');
  const backImg = host.querySelector('.pack-back img');
  const tube = host.querySelector('.tube3d');
  const lidSvg = host.querySelector('.lid2d'), lidBands = lidSvg.querySelectorAll('.lid-band'), tubeLights = lidSvg.querySelectorAll('.tube-light');
  const [lidTopEdge, lidLowEdge, lidSeam, lidCap] = ['.lid-top-edge', '.lid-low-edge', '.lid-seam', '.lid-cap'].map(q => lidSvg.querySelector(q));
  const dim = { W: 0, H: 0, h: 0, r: 0, lr: 0, lh: 0 };
  let lastLid = '';
  const st = { ry: opts.ry ?? -14, rx: 4, try: opts.ry ?? -14, trx: 4, vel: 0, dragging: false, idle: opts.idle ?? true, hoverX: 0, hoverY: 0 };
  // fmt = what is painted now; target = where the latest swap is heading (a quick second switch must compare against this)
  let current = null, fmt = opts.fmt || 'pouch', target = fmt, raf = null, visible = true, lastF = '', lastI = '', lastFrame = 0;

  // the browser must never treat the pack as a picture to drag out or text to select
  host.setAttribute('draggable', 'false');
  host.addEventListener('dragstart', e => e.preventDefault());
  host.addEventListener('selectstart', e => e.preventDefault());

  // cylinder size from the host box: label height = 0.9 of the box, diameter from the label's proportions
  function sizeTube() {
    const H = host.clientHeight; if (!H) return;
    const h = H * .9, side = h * 1.62 / TUBE_SIDES;          // label is 1.62 × as wide as it is tall
    const r = side / 2 / Math.tan(Math.PI / TUBE_SIDES);
    host.style.setProperty('--tn', TUBE_SIDES);
    host.style.setProperty('--th', h.toFixed(1) + 'px');
    host.style.setProperty('--tw', side.toFixed(3) + 'px');
    host.style.setProperty('--tr', r.toFixed(2) + 'px');
    // the copper slip lid sits over the top 6% of the label and is 2.5% wider (drawn by drawLid)
    Object.assign(dim, { W: host.clientWidth, H, h, r, lr: r * 1.025, lh: h * .06 });
    lidSvg.setAttribute('viewBox', `0 0 ${dim.W} ${H}`);
    lastLid = '';
  }

  // Where a point of the pack (x, y, z from its centre; y down, z towards you) lands on screen, using the
  // same transforms as the tube: rotateZ (sway), then rotateX (tilt), then the bob, then perspective.
  // The lid is round, so the turn (rotateY) does not change it. (The frame loop passes sway = bob = 0:
  // those move the whole wrapper, SVG included.)
  function project(x, y, z, cX, sX, cZ, sZ, bob) {
    const x1 = x * cZ - y * sZ, y1 = x * sZ + y * cZ;
    const y2 = y1 * cX - z * sX + bob, z2 = y1 * sX + z * cX;
    const k = PERSPECTIVE / (PERSPECTIVE - z2);
    return [dim.W / 2 + x1 * k, dim.H / 2 + y2 * k, z2];
  }
  const LID_STEPS = 64;
  function drawLid(rx, sway, bob) {
    const key = `${rx.toFixed(2)}|${sway.toFixed(2)}|${bob.toFixed(1)}|${dim.W}`;
    if (key === lastLid || !dim.W) return; lastLid = key;
    const a = rx * Math.PI / 180, b = sway * Math.PI / 180, cX = Math.cos(a), sX = Math.sin(a), cZ = Math.cos(b), sZ = Math.sin(b);
    const top = -dim.h / 2 - 1, low = -dim.h / 2 + dim.lh;
    const ring = (y, r = dim.lr) => Array.from({ length: LID_STEPS }, (_, i) => { const t = i / LID_STEPS * 2 * Math.PI; return project(r * Math.cos(t), y, r * Math.sin(t), cX, sX, cZ, sZ, bob); });
    const T = ring(top), L = ring(low);
    // outline of a band between two circles = convex hull of the two projected circles
    const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
    const hullOf = (A, B) => {
      const pts = [...A, ...B].map(p => [p[0], p[1]]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      const lo = [], up = [];
      for (const p of pts) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (const p of pts.reverse()) { while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      return [...lo.slice(0, -1), ...up.slice(0, -1)];
    };
    const poly = ps => 'M' + ps.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    const hullD = poly(hullOf(T, L)) + 'Z';
    lidBands.forEach(el => el.setAttribute('d', hullD));
    // the light on the label: the tube's own outline, from under the lid to the bottom
    const bodyD = poly(hullOf(ring(low - 2, dim.r), ring(dim.h / 2, dim.r))) + 'Z';
    tubeLights.forEach(el => el.setAttribute('d', bodyD));
    // the edges you can see run along the front half of each circle (z towards you)
    const front = ps => { const i0 = ps.findIndex((p, i) => p[2] >= 0 && ps[(i - 1 + ps.length) % ps.length][2] < 0); const o = []; for (let k = 0; k < ps.length; k++) { const p = ps[(i0 + k) % ps.length]; if (p[2] < 0) break; o.push(p); } return o; };
    lidTopEdge.setAttribute('d', poly(front(ring(top + 1.5))));
    lidLowEdge.setAttribute('d', poly(front(ring(low - 2.5))));
    lidSeam.setAttribute('d', poly(front(L)));
    // the round top only shows when you look down onto it
    const n = [sZ, -cZ * cX, -cZ * sX];                                     // the top's normal after sway and tilt
    const xc = -top * sZ, yc = top * cZ * cX + bob, zc = top * cZ * sX;      // its centre before perspective
    const seen = n[0] * -xc + n[1] * -yc + n[2] * (PERSPECTIVE - zc) > 0;    // facing the eye at (0, 0, PERSPECTIVE)
    lidCap.setAttribute('d', seen ? poly(T) + 'Z' : '');
  }
  if ('ResizeObserver' in window) new ResizeObserver(sizeTube).observe(host); else addEventListener('resize', sizeTube);

  function paint(f) {
    current = f;
    const isTube = fmt === 'tube';
    img.alt = opts.alt === false ? '' : `${fname(f)}, ${DATA.formats[fmt].name[I18N.lang]}`;
    host.dataset.fmt = fmt;
    tube.hidden = lidSvg.hidden = !isTube;
    host.querySelectorAll('.pack-face').forEach(el => (el.hidden = isTube));
    if (isTube) {
      tube.dataset.f = f.id;
      sizeTube();
      return;
    }
    img.src = f.img.front; backImg.src = f.img.back;
    const mask = `url("${f.img.front}")`;
    sheen.style.webkitMaskImage = sheen.style.maskImage = mask;
  }
  paint(flavour);

  // flip to another flavour: turn edge-on, swap, turn back
  // newFmt (optional) changes pouch/tube at the same moment; opts.swapSlow stretches the turn (hero)
  function swap(f, dir = 1, newFmt) {
    if (newFmt) target = newFmt;
    const apply = () => { fmt = target; paint(f); };
    if (!window.gsap || Util.reduced.matches) { apply(); return; }
    const o = { a: 0 }, k = opts.swapSlow || 1;
    gsap.timeline()
      .to(o, { a: 90 * dir, duration: .32 * k, ease: 'power2.in', onUpdate: () => { st.ry = st.try + o.a; } })
      .add(() => { apply(); o.a = -90 * dir; })
      .to(o, { a: 0, duration: .7 * k, ease: 'elastic.out(1, .6)', onUpdate: () => { st.ry = st.try + o.a; } });
  }

  // pointer: drag to rotate (horizontal), hover tilts slightly
  let lastX = 0, lastT = 0, startX = 0, startY = 0, decided = false, horiz = false;
  host.addEventListener('pointerdown', e => {
    st.dragging = true; decided = false; startX = lastX = e.clientX; startY = e.clientY; lastT = performance.now(); st.vel = 0;
  });
  addEventListener('pointermove', e => {
    if (st.dragging) {
      if (!decided && (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6)) {
        decided = true; horiz = Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY);
        if (horiz) try { host.setPointerCapture(e.pointerId); } catch (_) {}
        else st.dragging = false;
      }
      if (decided && horiz) {
        const now = performance.now(), dx = e.clientX - lastX;
        st.try += dx * .6; st.vel = dx / Math.max(1, now - lastT) * 16 * .6; lastX = e.clientX; lastT = now;
        host.dataset.dragged = '1';
      }
    }
  }, { passive: true });
  const end = () => { if (!st.dragging) return; st.dragging = false; setTimeout(() => delete host.dataset.dragged, 50); };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  let box = null;
  host.addEventListener('pointerenter', () => { box = host.getBoundingClientRect(); });
  host.addEventListener('pointermove', e => {
    if (Util.coarse.matches || !box) return;
    st.hoverX = (e.clientX - box.left) / box.width - .5; st.hoverY = (e.clientY - box.top) / box.height - .5;
  });
  host.addEventListener('pointerleave', () => { st.hoverX = st.hoverY = 0; });
  host.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { st.try -= 30; e.preventDefault(); }
    if (e.key === 'ArrowRight') { st.try += 30; e.preventDefault(); }
  });

  const rest = opts.ry ?? -14;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    // f = how many 60 Hz frames passed, so the motion has the same speed at 60, 120 or 144 Hz
    const f = Math.min(3, (t - (lastFrame || t - 16.7)) / 16.667); lastFrame = t;
    if (!visible) return;
    const ease = k => 1 - (1 - k) ** f;                       // a per-60-Hz-frame easing factor, for this frame
    if (!st.dragging) {
      st.try += st.vel * f; st.vel *= .93 ** f;
      if (Math.abs(st.vel) < .05) {
        // settle to the nearest face (front or back)
        const turns = Math.round((st.try - rest) / 180);
        st.try += (rest + turns * 180 - st.try) * ease(.06);
      }
    }
    st.ry += (st.try + st.hoverX * 26 - st.ry) * ease(.12);
    st.rx += (st.trx - st.hoverY * 14 - st.rx) * ease(.12);
    const bob = st.idle && !Util.reduced.matches ? Math.sin(t / 900 + (opts.phase || 0)) : 0;
    // bob and sway move the whole flat wrapper (cheap, and the lid needs no redraw for them);
    // the 3D part only tilts (rotateX) and turns about its own axis (rotateY)
    const ft = `translateY(${(bob * (opts.bob ?? 8)).toFixed(1)}px) rotate(${(bob * (opts.sway ?? 1.2)).toFixed(1)}deg)`;
    const it = `rotateX(${st.rx.toFixed(1)}deg) rotateY(${st.ry.toFixed(1)}deg)`;
    if (ft !== lastF) { float.style.transform = ft; lastF = ft; }
    // the same rounded tilt as the CSS transform, so the lid sits exactly on the tube; redrawn only when it changes
    if (fmt === 'tube') drawLid(+st.rx.toFixed(1), 0, 0);
    if (it !== lastI) {
      inner.style.transform = it; lastI = it;
      if (fmt !== 'tube') {
        // the sheen only needs to follow the turn, not the bob
        const sh = (50 - ((st.ry % 360) + 360) % 360 / 3.6 * .9).toFixed(0) + '%';
        if (sh !== sheen.dataset.v) { sheen.dataset.v = sh; sheen.style.setProperty('--sheen', sh); }
      }
    }
  }
  raf = requestAnimationFrame(frame);
  // only animate packs that are on screen
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => (visible = e.isIntersecting)), { rootMargin: '100px' }).observe(host);

  // turn to the front (false) or the back (true) of the pack
  function showBack(on) {
    const turns = Math.round((st.try - rest) / 180), back = Math.abs(turns) % 2 === 1;
    if (back !== !!on) st.try = rest + (turns + 1) * 180;
    st.vel = 0;
  }
  const isBack = () => Math.abs(Math.round((st.try - rest) / 180)) % 2 === 1;

  return {
    el: host, swap, paint, showBack, get back() { return isBack(); }, get flavour() { return current; },
    get fmt() { return target; }, setFmt(v) { if (v !== target) swap(current, 1, v); },
    spin(turns = 1) { st.vel = 0; if (window.gsap && !Util.reduced.matches) gsap.to(st, { try: st.try + 360 * turns, duration: 1.2, ease: 'power3.out' }); },
    nudge(v) { st.vel += v; },
    setTilt(rx, ry) { st.trx = rx; if (ry != null) st.try = rest + ry; },
  };
}
