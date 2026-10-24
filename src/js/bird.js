/* The araçari: a rigged character drawn in SVG and animated procedurally.
   Parts: tail, far wing, body, chest, folded wing, near wing, head (eye, lid, beak), feet.
   It perches on elements, follows the cursor with its head, flies between sections,
   reacts to the shop and has idle behaviours. All motion is computed per frame here. */
const Bird = (() => {
  const { clamp, lerp, rand, reduced, phone } = Util;
  const NS = 'http://www.w3.org/2000/svg';
  const ANCHOR = { x: 106, y: 180 };            // where the feet grip, in SVG units
  const NECK = { x: 112, y: 82 }, SHOULDER = { x: 100, y: 94 }, TAIL = { x: 90, y: 164 };
  const C = { ink: '#13333a', navy: '#1c5fa3', teal: '#1f5e63', blue: '#2a84cc', light: '#5cc5e8', mint: '#8ff0e6', sky: '#58b7e8', sun: '#f6d641', orange: '#e9601c', red: '#d9431e', lime: '#b9d93b', green: '#8cbf3f' };

  // a leaf-shaped feather pointing along +y, rotated and placed
  function feather(x, y, len, w, ang, fill, extra = '') {
    const d = `M0 0C${w} ${len * .28} ${w * .62} ${len * .8} 0 ${len}C${-w * .62} ${len * .8} ${-w} ${len * .28} 0 0Z`;
    return `<g transform="translate(${x} ${y}) rotate(${ang})" ${extra}><path class="feather" d="${d}" fill="${fill}"/><path class="rib" d="M0 ${len * .12}L0 ${len * .86}"/></g>`;
  }
  function wingFan(dark) {
    const k = dark ? ['#16477a', '#17474b', '#1f63a0', 'var(--b-acc-d)', '#3d93b8'] : [C.navy, C.teal, C.blue, 'var(--b-acc)', C.light];
    const lens = [62, 70, 74, 66, 56], angs = [118, 136, 154, 172, 190];
    let s = `<path class="feather" d="M0 0C-14 -10 -26 -6 -30 2C-18 6 -8 6 0 0Z" fill="${k[0]}"/>`;
    lens.forEach((l, i) => { s += feather(-4 - i * 3, -2 + i * 1.2, l, 8.5, angs[i], k[i % k.length]); });
    for (let i = 0; i < 4; i++) s += feather(-2 - i * 5, -4, 26, 6.5, 140 + i * 14, i % 2 ? (dark ? '#3d93b8' : C.light) : (dark ? 'var(--b-acc-d)' : 'var(--b-acc)'));
    return s;
  }

  function svgMarkup() {
    const covertsA = [[86, 96, C.light], [95, 99, 'var(--b-acc)'], [104, 102, C.light], [113, 106, 'var(--b-acc)']];
    const covertsB = [[80, 110, C.blue], [89, 114, C.teal], [98, 117, C.blue], [107, 120, C.teal]];
    const prim = [[74, 122, C.navy, 18], [83, 124, C.teal, 22], [92, 126, C.blue, 26], [101, 128, C.teal, 30]];
    return `
<svg viewBox="0 0 200 200" xmlns="${NS}">
  <defs><clipPath id="eyeClip"><circle cx="124" cy="52" r="9.8"/></clipPath></defs>
  <g class="b-root">
    <g class="b-tail">
      ${feather(92, 162, 64, 9, 20, C.navy)}${feather(88, 160, 72, 9.5, 32, C.teal)}${feather(98, 164, 58, 8.5, 8, C.blue)}
      ${feather(108, 168, 32, 6, -6, C.red)}
    </g>
    <g class="b-wing-far" opacity="0">${wingFan(true)}</g>
    <g class="b-body">
      <path d="M100 80C78 92 68 128 76 156C82 176 108 186 124 173C140 160 146 130 140 104C136 90 124 80 112 80Z" fill="${C.ink}" stroke="#fff" stroke-width="2.5"/>
      <path d="M114 84C130 88 142 104 142 124C142 136 136 146 130 150C120 136 110 112 108 92Z" fill="${C.sun}" stroke="#fff" stroke-width="1.5"/>
      <g fill="none" stroke="${C.orange}" stroke-width="1.7" stroke-linecap="round">
        <path d="M118 98q4 4 8 0"/><path d="M127 108q4 4 8 0"/><path d="M118 116q4 4 8 0"/><path d="M129 124q4 4 8 0"/><path d="M121 132q4 4 8 0"/>
      </g>
      <path d="M142 118C146 136 140 154 128 164L124 156C134 146 138 132 136 120Z" fill="${C.orange}" stroke="#fff" stroke-width="1.2"/>
      <path d="M96 166C106 160 118 158 126 152L128 160C120 168 106 173 98 173Z" fill="${C.red}" stroke="#fff" stroke-width="1.2"/>
    </g>
    <g class="b-feet" fill="none" stroke="${C.sky}" stroke-width="4.2" stroke-linecap="round">
      <path d="M99 170q5 8 1 14"/><path d="M107 171q5 8 1 14"/><path d="M115 170q5 8 1 14"/>
    </g>
    <g class="b-carry" opacity="0"><image class="b-carry-img" x="-18" y="0" width="36" height="54" href=""/></g>
    <g class="b-wing">
      <path class="feather" d="M104 86C80 92 66 120 70 150C76 140 92 120 114 104Z" fill="${C.navy}"/>
      ${prim.map(p => feather(p[0], p[1], 58, 8.5, p[3], p[2])).join('')}
      ${covertsB.map(p => feather(p[0], p[1], 30, 7, 30, p[2])).join('')}
      ${covertsA.map(p => feather(p[0], p[1], 24, 6.5, 34, p[2])).join('')}
    </g>
    <g class="b-wing-near" opacity="0">${wingFan(false)}</g>
    <g class="b-head">
      <ellipse cx="114" cy="58" rx="30" ry="30" fill="${C.ink}" stroke="#fff" stroke-width="2.5"/>
      <g fill="none" stroke="#3fb6a8" stroke-width="1.9" stroke-linecap="round"><path d="M92 50q5-4 10 0"/><path d="M90 60q5-4 10 0"/><path d="M94 70q5-4 10 0"/></g>
      <circle cx="124" cy="52" r="11" fill="${C.sky}" stroke="#fff" stroke-width="1.6"/>
      <g clip-path="url(#eyeClip)">
        <g class="b-eye"><circle cx="124" cy="52" r="5.6" fill="${C.ink}"/><circle cx="122.2" cy="50" r="1.9" fill="#fff"/><circle cx="126.2" cy="54.6" r=".85" fill="#fff"/></g>
        <rect class="b-lid" x="112" y="41" width="24" height="22" fill="#3f9fd2"/>
      </g>
      <path class="b-happy" d="M118 55q6-8 12 0" fill="none" stroke="${C.ink}" stroke-width="2.8" stroke-linecap="round" opacity="0"/>
      <ellipse class="b-blush" cx="129" cy="67" rx="5.2" ry="3.3" fill="var(--b-blush)" opacity=".9"/>
      <path d="M120 75q7 3 14-2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
      <g class="b-beak-low"><path d="M142 66C162 64 180 72 192 82C186 88 166 86 142 80Z" fill="${C.green}" stroke="#fff" stroke-width="1.4"/></g>
      <g class="b-pecan" opacity="0"><ellipse cx="190" cy="80" rx="7" ry="4.4" fill="#8a5a2b" stroke="#5a3515" stroke-width="1"/><path d="M185 79l3 3M189 78l3 3M193 78l2 2" stroke="#5a3515" stroke-width=".9"/></g>
      <g class="b-beak-up">
        <path d="M141 42C162 36 188 52 198 78C200 84 196 86 192 82C180 70 162 64 142 66Z" fill="${C.lime}" stroke="#fff" stroke-width="1.6"/>
        <path d="M149 46C166 44 182 56 190 70" fill="none" stroke="#f3d33c" stroke-width="2.4" stroke-linecap="round"/>
      </g>
      <path d="M136 40q4-2 6 2L144 80q-2 4-6 2Z" fill="${C.ink}" stroke="#fff" stroke-width="1.4"/>
    </g>
  </g>
</svg>`;
  }

  /* ---------------- state ---------------- */
  const S = {
    x: -200, y: -200, size: 120, flip: 1, tilt: 0, squash: 1, hop: 0, scale: 1, alpha: 1,
    headRot: 0, pupilX: 0, pupilY: 0, blink: 0, lid: .2, happy: 0, beak: 0,
    wing: 0, tail: 0, flying: false, flap: 0, flapSpeed: 0, spread: 0, feet: 1,
    wave: 0, sleep: 0, gold: 0,
  };
  const T = { headRot: 0, pupilX: 0, pupilY: 0, happy: 0, beak: 0, tail: 0, lid: .2, sleep: 0, wave: 0 };
  let el, parts = {}, mode = 'idle', perch = null, busy = false, lookAt = { x: innerWidth / 2, y: innerHeight / 2 }, lookOverride = null;
  let lastT = performance.now(), nextBlink = 2, nextIdle = 4, behindTimer = 0, running = true;
  const particles = [];

  function build() {
    el = document.createElement('div'); el.className = 'bird'; el.innerHTML = svgMarkup();
    fixedLayer = document.getElementById('birdLayer'); pageLayer = document.getElementById('birdPage');
    fixedLayer.appendChild(el);
    const q = s => el.querySelector(s);
    parts = { root: q('.b-root'), tail: q('.b-tail'), wing: q('.b-wing'), near: q('.b-wing-near'), far: q('.b-wing-far'), head: q('.b-head'), eye: q('.b-eye'), lid: q('.b-lid'), happy: q('.b-happy'), up: q('.b-beak-up'), low: q('.b-beak-low'), feet: q('.b-feet'), body: q('.b-body'), carry: q('.b-carry'), carryImg: q('.b-carry-img'), pecan: q('.b-pecan') };
    setSize();
    addEventListener('resize', setSize);
    setAccent(DATA.flavours[0].colors);
    el.addEventListener('click', onClick);
    addEventListener('pointermove', e => { lookAt = { x: e.clientX, y: e.clientY }; }, { passive: true });
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { lastT = performance.now(); requestAnimationFrame(tick); } });
    // phones: tilt the head with the gyroscope where allowed; touch position otherwise
    addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      const next = { x: innerWidth / 2 + clamp(e.gamma, -40, 40) / 40 * innerWidth * .6, y: innerHeight / 2 + clamp((e.beta || 45) - 45, -40, 40) / 40 * innerHeight * .6 };
      // ignore the sensor's jitter: every tiny head move repaints the bird and costs cheap phones frames
      if (Math.hypot(next.x - lookAt.x, next.y - lookAt.y) > 24) lookAt = next;
    }, { passive: true });
    requestAnimationFrame(tick);
  }
  let sizeMul = 1, sizeT = 124;
  function setSize() { sizeT = (innerWidth < 700 ? 66 : innerWidth < 1100 ? 104 : 124) * sizeMul; if (S.size === 120) { S.size = sizeT; el.style.setProperty('--bird-w', sizeT + 'px'); } }
  // inside panels (cart, product sheet, checkout) the bird shrinks so it fits beside the title
  function setMini(on) { sizeMul = typeof on === 'number' ? on : on ? .62 : 1; setSize(); }
  function setAccent(c) {
    el.style.setProperty('--b-acc', c.band);
    el.style.setProperty('--b-acc-d', Util.mix(c.band, '#13333a', .3));
    el.style.setProperty('--b-blush', Util.contrast(c.body, '#13333a') > 2.2 ? c.body : '#e9601c');
  }

  /* ---------------- per-frame ---------------- */
  const k = (dt, speed) => 1 - Math.exp(-dt * speed);
  function tick(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    update(dt, now / 1000);
    render();
    stepParticles(dt);
    requestAnimationFrame(tick);
  }
  function anchorScreen() { return { x: S.x, y: S.y }; }
  function perchPoint(p = perch) {
    if (!p || !p.el || !p.el.isConnected) return null;
    if (p.get) return p.get();
    const r = p.el.getBoundingClientRect(); if (!r.width && !r.height) return null;
    return { x: r.left + r.width * p.fx, y: r.top + r.height * p.fy + (p.dy || 0) };
  }

  function update(dt, t) {
    // follow the perch while sitting
    if (mode === 'perched') {
      const p = perchPoint();
      if (p) { S.x = p.x; S.y = p.y; }
    }
    // follow a moving point in flight (the route on the map)
    if (mode === 'track' && trackFn) {
      const p = trackFn();
      if (p) {
        const vx = p.x - S.x, vy = p.y - S.y, kk = k(dt, 8);
        S.x += vx * kk; S.y += vy * kk;
        if (Math.abs(vx) > .8) S.flip = vx > 0 ? 1 : -1;
        S.tilt += (clamp(Math.atan2(vy, Math.abs(vx) + 2) * 57 * .5, -30, 30) * S.flip - S.tilt) * k(dt, 6);
      }
    }
    // head looks at the cursor (or at an override point)
    const target = lookOverride || lookAt;
    const s = S.size / 200;
    const hx = S.x + (NECK.x - ANCHOR.x) * s * S.flip, hy = S.y + (NECK.y - 25 - ANCHOR.y) * s;
    const dx = (target.x - hx) * S.flip, dy = target.y - hy;
    const ang = Math.atan2(dy, Math.max(20, Math.abs(dx)) * Math.sign(dx || 1)) * 180 / Math.PI;
    if (!S.flying && !busy && S.sleep < .1) {
      T.headRot = clamp(dx < 0 ? -12 : ang * .55, -26, 24);
      const d = Math.hypot(dx, dy) || 1;
      T.pupilX = clamp(dx / d * 2.4, -2.4, 2.4); T.pupilY = clamp(dy / d * 2.2, -2.2, 2.2);
      // turn around when the cursor stays behind the bird
      if (dx < -40 && mode === 'perched') { behindTimer += dt; if (behindTimer > 1.1) { S.flip *= -1; behindTimer = 0; hopOnce(5); } } else behindTimer = 0;
    }
    // blink
    nextBlink -= dt;
    if (nextBlink <= 0) { blink(); nextBlink = rand(2.2, 5.5); }
    // idle behaviours
    if (mode === 'perched' && !busy) {
      nextIdle -= dt;
      if (nextIdle <= 0) { idle(); nextIdle = rand(3.5, 7.5); }
    }
    // size eases toward its target (smaller inside panels)
    if (Math.abs(sizeT - S.size) > .3) { S.size += (sizeT - S.size) * k(dt, 8); el.style.setProperty('--bird-w', S.size.toFixed(1) + 'px'); }
    // breathing is a CSS animation on the SVG (.bird svg in styles.css): the graphics chip runs it,
    // so a bird sitting still costs nothing per frame

    // springs
    const kk = k(dt, 12);
    for (const key of ['headRot', 'pupilX', 'pupilY', 'happy', 'beak', 'tail', 'lid', 'sleep', 'wave']) S[key] += (T[key] - S[key]) * (key === 'beak' ? k(dt, 28) : kk);
    S.squash += (1 - S.squash) * k(dt, 9);
    S.hop += (0 - S.hop) * k(dt, 10);
    if (!S.flying) S.tilt += (0 - S.tilt) * k(dt, 6);

    // flight
    if (S.flying) {
      S.flap += dt * S.flapSpeed;
      S.spread += (1 - S.spread) * k(dt, 14);
      S.feet += (0 - S.feet) * k(dt, 10);
    } else {
      S.spread += ((S.wave > .05 ? 1 : 0) - S.spread) * k(dt, 10);
      S.feet += (1 - S.feet) * k(dt, 10);
    }
  }

  const cache = new WeakMap();
  function setA(node, name, val) { let m = cache.get(node); if (!m) cache.set(node, m = {}); if (m[name] !== val) { m[name] = val; node.setAttribute(name, val); } }
  // While perched on page content the bird lives in a layer that scrolls with the page, so the
  // browser moves it together with its perch (no one-frame lag, no wobble while scrolling).
  // Flying, on the navbar, in panels or on a pinned scene, it lives in the fixed layer.
  let pageLayer = null, fixedLayer = null;
  function render() {
    const s = S.size / 200, ax = ANCHOR.x * s, ay = ANCHOR.y * s;
    const anchored = pageFlight || (mode === 'perched' && !!perch && !perch.nav && !perch.fixed);
    if (anchored !== el._anch) { (anchored ? pageLayer : fixedLayer).appendChild(el); el._anch = anchored; el._tf = null; }
    const ox = anchored ? scrollX : 0, oy = anchored ? scrollY : 0;
    const tf = `translate3d(${(S.x + ox - ax).toFixed(1)}px, ${(S.y + oy - ay - S.hop).toFixed(1)}px, 0) rotate(${S.tilt.toFixed(1)}deg) scale(${(S.flip * S.scale).toFixed(3)}, ${(S.scale * S.squash).toFixed(3)})`;
    if (tf !== el._tf) { el.style.transformOrigin = `${ax}px ${ay}px`; el.style.transform = tf; el._tf = tf; }
    if (el._a !== S.alpha) { el.style.opacity = S.alpha; el._a = S.alpha; }
    const R = (g, a, cx, cy, extra = '') => setA(g, 'transform', `rotate(${a.toFixed(1)} ${cx} ${cy})${extra}`);
    R(parts.head, S.headRot + S.sleep * 70, NECK.x, NECK.y);
    setA(parts.eye, 'transform', `translate(${S.pupilX.toFixed(1)} ${S.pupilY.toFixed(1)})`);
    const lid = clamp(Math.max(S.lid, S.blink, S.sleep), 0, 1);
    setA(parts.lid, 'transform', `translate(0 41) scale(1 ${lid.toFixed(2)}) translate(0 -41)`);
    setA(parts.happy, 'opacity', (Math.max(S.happy, S.sleep) * (lid > .85 ? 1 : 0)).toFixed(2));
    R(parts.up, -S.beak * 7, 141, 60);
    R(parts.low, S.beak * 16, 141, 68);
    R(parts.tail, S.tail + S.sleep * 148, TAIL.x, TAIL.y);
    // folded wing vs flight wings
    const sp = S.spread;
    setA(parts.wing, 'opacity', (1 - sp).toFixed(2));
    setA(parts.near, 'opacity', sp.toFixed(2)); setA(parts.far, 'opacity', (S.flying ? sp : 0).toFixed(2));
    let flapA, flapS;
    if (S.flying) { const f = Math.sin(S.flap); flapA = -18 + f * 46; flapS = .72 + .28 * Math.abs(Math.cos(S.flap * .5 + .4)); }
    else { flapA = 40 + Math.sin(performance.now() / 120) * 22 * S.wave; flapS = .9; }
    setA(parts.near, 'transform', `translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${flapA.toFixed(1)}) scale(1 ${flapS.toFixed(2)})`);
    setA(parts.far, 'transform', `translate(${SHOULDER.x + 8} ${SHOULDER.y - 4}) rotate(${(flapA - 12).toFixed(1)}) scale(.9 ${(flapS * .9).toFixed(2)})`);
    R(parts.wing, S.sleep * -6, SHOULDER.x, SHOULDER.y);
    setA(parts.feet, 'transform', `translate(0 ${((1 - S.feet) * -6).toFixed(1)}) scale(1 ${(.4 + .6 * S.feet).toFixed(2)})`);   // rounded: unrounded, it changed (and repainted) every frame
    const fl = S.gold > .01 ? `drop-shadow(0 0 ${(12 * S.gold).toFixed(1)}px rgba(246,214,65,${S.gold.toFixed(2)}))` : '';
    if (fl !== el._fl) { el.style.filter = fl; el._fl = fl; }
    Bubble.follow(S.x, S.y - S.size * .95);
  }

  /* ---------------- small actions ---------------- */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function blink() { S.blink = 1; setTimeout(() => (S.blink = 0), 130); }
  function hopOnce(h = 14) { S.hop = h; S.squash = .86; }
  async function hop(n = 2) { for (let i = 0; i < n; i++) { hopOnce(16); await wait(240); } }
  async function idle() {
    const r = Math.random();
    if (reduced.matches) { blink(); return; }
    if (r < .25) { busy = true; T.headRot = 20; T.pupilY = -1; await wait(900); busy = false; }                 // curious tilt
    else if (r < .45) { busy = true; T.headRot = 62; T.beak = .3; await wait(400); T.beak = 0; T.headRot = 55; await wait(300); T.beak = .3; await wait(350); T.beak = 0; busy = false; } // preen
    else if (r < .62) { await hop(1); }
    else if (r < .78) { S.flip *= -1; hopOnce(4); }                                                             // look the other way
    else if (r < .9) { T.tail = -14; await wait(220); T.tail = 10; await wait(220); T.tail = 0; }               // tail flick
    else { T.beak = 1; Sound.chirp(3); await wait(160); T.beak = 0; await wait(120); T.beak = .8; await wait(140); T.beak = 0; }
  }
  async function happy(ms = 900) { T.happy = 1; T.lid = 1; await wait(ms); T.happy = 0; T.lid = .2; }

  /* ---------------- flight ---------------- */
  let flightId = 0, pageFlight = false;
  // opts.page: fly in page coordinates, in the layer that scrolls with the page (phones). The phone
  // scrolls that layer itself, so a scroll during the flight can never make the bird lag or jump.
  function flyTo(getTarget, opts = {}) {
    const id = ++flightId;
    pageFlight = false;
    if (opts.page && !reduced.matches && !opts.instant) return flyInPage(id, getTarget, opts);
    const start = anchorScreen();
    if (reduced.matches || opts.instant) {
      return new Promise(res => {
        S.alpha = 0;
        setTimeout(() => { const e = getTarget(); if (e) { S.x = e.x; S.y = e.y; } S.alpha = 1; mode = opts.after || 'perched'; res(); }, reduced.matches ? 250 : 0);
      });
    }
    mode = 'flying'; S.flying = true; S.flapSpeed = 26; T.happy = 0; T.lid = .1;
    let e0 = getTarget() || start;
    const dist = Math.hypot(e0.x - start.x, e0.y - start.y);
    const dur = clamp(dist / 850, .55, 1.7) * (opts.speed || 1);
    const lift = clamp(dist * .38, 50, 240) * (opts.lift || 1);
    const t0 = performance.now();
    return new Promise(res => {
      const step = now => {
        if (id !== flightId) return res('cancelled');
        let p = clamp((now - t0) / (dur * 1000), 0, 1);
        const e = getTarget() || e0; e0 = e;
        const ep = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const cx = (start.x + e.x) / 2, cy = Math.max(30, Math.min(start.y, e.y) - lift);
        const nx = (1 - ep) * (1 - ep) * start.x + 2 * (1 - ep) * ep * cx + ep * ep * e.x;
        const ny = (1 - ep) * (1 - ep) * start.y + 2 * (1 - ep) * ep * cy + ep * ep * e.y;
        const vx = nx - S.x, vy = ny - S.y;
        if (Math.abs(vx) > .6) S.flip = vx > 0 ? 1 : -1;
        S.tilt = clamp(Math.atan2(vy, Math.abs(vx) + 4) * 180 / Math.PI * .45, -28, 28) * S.flip;
        S.x = nx; S.y = ny;
        S.flapSpeed = p > .82 ? 12 : 26;                        // glide in to land
        T.headRot = clamp(-S.tilt * S.flip * .5, -20, 20);
        if (p < 1) requestAnimationFrame(step);
        else {
          S.flying = false; S.squash = .78; S.hop = 0; T.lid = .2;
          mode = opts.after || 'perched';
          Sound.chirp(2);
          setTimeout(() => hopOnce(6), 160);
          res('landed');
        }
      };
      requestAnimationFrame(step);
    });
  }

  function flyInPage(id, getTarget, opts) {
    const doc = v => v && { x: v.x + scrollX, y: v.y + scrollY };
    let e0 = doc(getTarget()); if (!e0) return Promise.resolve('no target');
    // start where the bird is; if that is far off screen, come in from just above the screen
    let start = { x: S.x + scrollX, y: S.y + scrollY };
    if (S.y < -S.size || S.y > innerHeight + S.size) start = { x: e0.x < innerWidth / 2 ? innerWidth + 40 : -40, y: scrollY - 40 };
    mode = 'flying'; S.flying = true; S.flapSpeed = 26; T.happy = 0; T.lid = .1; pageFlight = true;
    S.x = start.x - scrollX; S.y = start.y - scrollY;
    const dist = Math.hypot(e0.x - start.x, e0.y - start.y);
    const dur = clamp(dist / 700, .6, 1.4) * (opts.speed || 1), lift = clamp(dist * .3, 40, 160);
    const t0 = performance.now();
    return new Promise(res => {
      const step = now => {
        if (id !== flightId) { pageFlight = false; return res('cancelled'); }
        const p = clamp((now - t0) / (dur * 1000), 0, 1);
        const e = doc(getTarget()) || e0; e0 = e;
        const ep = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const cx = (start.x + e.x) / 2, cy = Math.min(start.y, e.y) - lift;
        const nx = (1 - ep) * (1 - ep) * start.x + 2 * (1 - ep) * ep * cx + ep * ep * e.x;
        const ny = (1 - ep) * (1 - ep) * start.y + 2 * (1 - ep) * ep * cy + ep * ep * e.y;
        const vx = nx - (S.x + scrollX), vy = ny - (S.y + scrollY);
        if (Math.abs(vx) > .6) S.flip = vx > 0 ? 1 : -1;
        S.tilt = clamp(Math.atan2(vy, Math.abs(vx) + 4) * 180 / Math.PI * .45, -28, 28) * S.flip;
        S.x = nx - scrollX; S.y = ny - scrollY;               // render() adds the scroll back: page coordinates
        S.flapSpeed = p > .82 ? 12 : 26;
        T.headRot = clamp(-S.tilt * S.flip * .5, -20, 20);
        if (p < 1) requestAnimationFrame(step);
        else {
          S.flying = false; S.squash = .78; S.hop = 0; T.lid = .2; pageFlight = false;
          mode = opts.after || 'perched';
          Sound.chirp(2); setTimeout(() => hopOnce(6), 160);
          res('landed');
        }
      };
      requestAnimationFrame(step);
    });
  }

  let trackFn = null;
  function track(fn) { if (busy) return; flightId++; trackFn = fn; mode = 'track'; perch = null; S.flying = true; S.flapSpeed = 20; }
  function untrack() { if (mode !== 'track') return; trackFn = null; mode = 'idle'; S.flying = false; }

  /* ---------------- perching ---------------- */
  function perchOn(p, opts = {}) {
    if (!p) return;
    if (perch && perch.el === p.el && mode !== 'flying') return;
    perch = p;
    if (busy && !opts.force) return;
    return flyTo(() => perchPoint(p), { page: phone.matches && !p.fixed && !p.nav, ...opts });
  }
  const currentPerch = () => perch;
  // phones: step aside while a panel (cart, product, checkout) is open, and come back after
  function hideFor(on) { S.alpha = on ? 0 : 1; if (el) el.style.pointerEvents = on ? 'none' : ''; }

  /* ---------------- reactions ---------------- */
  // pick up a pecan, crack it with the beak, toss the pieces
  async function crack() {
    if (busy || S.flying) return; busy = true;
    T.headRot = 40; await wait(260);
    parts.pecan.setAttribute('opacity', '1'); T.headRot = -6; T.beak = .5; await wait(260);
    for (let i = 0; i < 2; i++) { T.beak = .05; T.headRot = 14; await wait(130); Sound.crack(.5); T.beak = .45; T.headRot = -4; await wait(170); }
    parts.pecan.setAttribute('opacity', '0');
    const s = S.size / 200, bx = S.x + (190 - ANCHOR.x) * s * S.flip, by = S.y + (80 - ANCHOR.y) * s;
    T.headRot = -30; T.beak = 1;
    burst(bx, by, 9, ['#8a5a2b', '#6b4220', '#c9965a', '#e2b878'], { up: 260, spread: 220, dir: S.flip });
    await wait(240); T.beak = 0; T.headRot = 0; happy(700); busy = false;
  }
  async function celebrate() {
    busy = true; happy(1600);
    burst(S.x, S.y - S.size * .6, 60, ['#e88028', '#c1d04a', '#58b7e8', '#f6d641', '#e9601c', '#8a5a2b', '#1c5fa3'], { up: 560, spread: 600, confetti: true });
    Sound.melody();
    for (let i = 0; i < 4; i++) { S.flying = true; S.flapSpeed = 30; hopOnce(22); await wait(300); }
    S.flying = false; busy = false;
  }
  function say(text, ms = 3200) { Bubble.show(text, ms); }
  async function sleep(on) {
    T.sleep = on ? 1 : 0; busy = on;
    if (!on) { blink(); }
  }
  async function toss() {
    if (busy) return; busy = true;
    parts.pecan.setAttribute('opacity', '1'); T.beak = .5; T.headRot = -40; await wait(200);
    parts.pecan.setAttribute('opacity', '0'); T.beak = 1;
    const s = S.size / 200, bx = S.x + (190 - ANCHOR.x) * s * S.flip, by = S.y + (80 - ANCHOR.y) * s;
    const p = spawn(bx, by, '#8a5a2b', { vx: -S.flip * 40, vy: -420, life: .95, size: 11 });
    await wait(900); T.headRot = -10; T.beak = .9; await wait(120); T.beak = 0; p.life = 0; Sound.crack(.3); happy(600); busy = false;
  }
  async function showBeak() { busy = true; T.beak = 1; T.headRot = -18; await wait(1100); T.beak = 0; T.headRot = 0; busy = false; }
  async function wave(on) { T.wave = on ? 1 : 0; if (on) happy(1200); }

  // carry a pack from a card to the cart
  let delivering = false;
  async function deliver(fromEl, imgSrc, toEl) {
    if (delivering || reduced.matches || phone.matches) { flyClone(fromEl, imgSrc, toEl); return; }
    delivering = true; busy = true;
    const back = perch;
    const r0 = () => { const r = fromEl.getBoundingClientRect(); return { x: r.left + r.width * .5, y: r.top + r.height * .3 }; };
    await flyTo(r0, { after: 'busy', speed: .7, lift: .6 });
    parts.carryImg.setAttribute('href', imgSrc); parts.carry.setAttribute('transform', 'translate(106 176)'); parts.carry.setAttribute('opacity', '1');
    hopOnce(10); await wait(160);
    // land just under the cart button so the whole bird stays on screen
    const r1 = () => { const r = toEl.getBoundingClientRect(); return { x: r.left + r.width * .5, y: Math.max(r.top - 4, S.size * .92 + 8) }; };
    await flyTo(r1, { after: 'busy', speed: .75, lift: .8 });
    parts.carry.setAttribute('opacity', '0');
    Cart.bump(); say(I18N.s().bird.cart, 1400); Sound.pluck(784);
    await wait(420);
    delivering = false; busy = false;
    perch = null; perchOn(back || App.bestPerch());
  }
  function flyClone(fromEl, imgSrc, toEl) {
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const img = new Image(); img.src = imgSrc; img.alt = '';
    Object.assign(img.style, { position: 'fixed', left: a.left + a.width / 2 - 30 + 'px', top: a.top + 'px', width: '60px', zIndex: 95, pointerEvents: 'none' });
    document.body.appendChild(img);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top - a.top;
    if (window.gsap && !reduced.matches) {
      gsap.timeline({ onComplete: () => { img.remove(); Cart.bump(); } })
        .to(img, { x: dx, duration: .8, ease: 'power1.inOut' }, 0)
        .to(img, { y: dy, duration: .8, ease: 'back.in(1.4)' }, 0)
        .to(img, { scale: .25, rotate: 20, duration: .8, ease: 'power2.in' }, 0);
    } else { img.remove(); Cart.bump(); }
  }

  /* ---------------- clicks and the easter egg ---------------- */
  let clicks = 0, clickTimer;
  async function onClick(e) {
    e.stopPropagation();
    clicks++; clearTimeout(clickTimer); clickTimer = setTimeout(() => (clicks = 0), 2600);
    if (clicks === 7) { clicks = 0; secret(); return; }
    if (S.sleep > .5) { sleep(false); return; }
    Sound.chirp(2);
    if (clicks % 3 === 1) crack(); else hop(1);
  }
  async function secret() {
    if (reduced.matches) { say(I18N.s().bird.secret, 6500); return; }
    busy = true; const p = perch;
    const cx = innerWidth / 2, cy = innerHeight / 2, R = Math.min(innerWidth, innerHeight) * .28;
    await flyTo(() => ({ x: cx, y: cy + R }), { after: 'busy' });
    S.flying = true; S.flapSpeed = 30; S.gold = 1;
    const t0 = performance.now();
    await new Promise(res => {
      const step = now => {
        const a = (now - t0) / 1500 * Math.PI * 2;
        S.x = cx + Math.sin(a) * R; S.y = cy + Math.cos(a) * R; S.flip = Math.cos(a) > 0 ? 1 : -1; S.tilt = -Math.sin(a) * 20 * S.flip;
        burst(S.x, S.y, 1, ['#f6d641', '#e88028'], { up: 40, spread: 60, confetti: true });
        if (now - t0 < 1500) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    S.flying = false; Sound.melody(); say(I18N.s().bird.secret, 7000);
    await wait(800); S.gold = 0; busy = false; perch = null; perchOn(p || App.bestPerch());
  }

  /* ---------------- particles (pecan pieces, confetti) ---------------- */
  function spawn(x, y, color, o = {}) {
    const d = document.createElement('div'); d.className = 'bird-piece';
    const size = o.size || rand(6, 11);
    Object.assign(d.style, { background: color, width: size + 'px', height: (o.confetti ? size * .5 : size * .75) + 'px', borderRadius: o.confetti ? '2px' : '50% 50% 45% 45%' });
    document.getElementById('birdLayer').appendChild(d);
    const p = { d, x, y, vx: o.vx ?? 0, vy: o.vy ?? 0, r: rand(0, 360), vr: rand(-720, 720), life: o.life ?? rand(1.2, 2), g: o.confetti ? 700 : 1300, drag: o.confetti ? .985 : .995, confetti: o.confetti };
    particles.push(p); return p;
  }
  function burst(x, y, n, colors, o = {}) {
    if (reduced.matches) n = Math.min(n, 8);
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI * .95, -Math.PI * .05);
      const sp = rand(.35, 1) * (o.spread || 300);
      spawn(x, y, colors[i % colors.length], { vx: Math.cos(a) * sp + (o.dir || 0) * 80, vy: Math.sin(a) * (o.up || 300) * rand(.6, 1.2), confetti: o.confetti });
    }
  }
  function stepParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g * dt; p.vx *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
      const sway = p.confetti ? Math.sin(p.life * 9) * 6 : 0;
      p.d.style.transform = `translate3d(${p.x + sway}px, ${p.y}px, 0) rotate(${p.r}deg)`;
      p.d.style.opacity = clamp(p.life * 2, 0, 1);
      if (p.life <= 0 || p.y > innerHeight + 40) { p.d.remove(); particles.splice(i, 1); }
    }
  }

  return {
    build, setMini, perchOn, hideFor, currentPerch, flyTo, track, untrack, hop, crack, celebrate, say, sleep, toss, showBeak, wave, deliver, setAccent, burst, happy,
    get busy() { return busy || delivering; }, set busy(v) { busy = v; },
    get mode() { return mode; }, set mode(v) { mode = v; }, get state() { return S; },
  };
})();

/* Speech bubble that follows the bird */
const Bubble = (() => {
  let el, timer, visible = false;
  function show(text, ms) {
    el = el || document.getElementById('bubble');
    el.textContent = text; el.hidden = false; visible = true;
    if (window.gsap) gsap.fromTo(el, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' });
    clearTimeout(timer); timer = setTimeout(hide, ms);
  }
  function hide() { if (!el || !visible) return; visible = false; if (window.gsap) gsap.to(el, { opacity: 0, duration: .3, onComplete: () => (el.hidden = true) }); else el.hidden = true; }
  function follow(x, y) {
    if (!visible || !el) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    const left = Util.clamp(x - w / 2, 12, innerWidth - w - 12), top = Util.clamp(y - h - 6, 70, innerHeight - h - 12);
    el.style.left = left + 'px'; el.style.top = top + 'px';
  }
  return { show, hide, follow };
})();
