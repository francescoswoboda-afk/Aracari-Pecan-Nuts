/* Wiring: smooth scroll, the bird's perches, reveals, cursor, magnetic buttons,
   language, sound, cookies, legal pages, forms and the easter eggs. */
const App = (() => {
  const { $, $$, store, reduced, coarse } = Util;
  const hasGsap = !!window.gsap;

  /* ---------- where the bird sits in each section ---------- */
  // line: true = sit at the end of the heading's first line, on the baseline
  const PERCHES = [
    { sec: '#hero', sel: '#heroPack', fx: .64, fy: .035 },
    { sec: '#origin', sel: '.origin-stage', fx: .84, fy: 0, fixed: true },   // pinned while you scroll
    { sec: '#nut', sel: '.quiz-stage', fx: .8, fy: 0 },
    { sec: '#shop', sel: '#shopTitle, .bundles-head .h2', line: true },
    // phone: true = only on phones, where the bird sits on boxes instead of headings
    { sec: '#shop', sel: '#productGrid .card, .bundle', fx: .22, fy: 0, phone: true },
    { sec: '#packaging', sel: '.pk-card', fx: .8, fy: 0, phone: true },
    { sec: '#pairing', sel: '#pairTitle', line: true },
    { sec: '#pairing', sel: '#pairStage', fx: .82, fy: 0 },
    { sec: '#bird', sel: '.fact', fx: .955, fy: 0, dy: 2 },
    { sec: '#farm', sel: '.farm-map', fx: .8, fy: 0 },
    { sec: '#retail', sel: '#retailForm', fx: .84, fy: 0 },
    { sec: '#letter', sel: '#letterTitle', line: true },
    { sec: '#letter', sel: '#letterForm', fx: .9, fy: 0 },
  ];
  const navH = () => $('#nav').getBoundingClientRect().bottom;
  function lineEnd(el) {
    const chars = el.querySelectorAll('.ch'); if (!chars.length) return null;
    const top0 = chars[0].getBoundingClientRect().top; let last = chars[0];
    for (const c of chars) { if (Math.abs(c.getBoundingClientRect().top - top0) < 6) last = c; else break; }
    const r = last.getBoundingClientRect();
    return { x: r.right + Bird.state.size * .4, y: r.bottom - r.height * .1 };
  }
  function pointOf(p) {
    if (p.get) return p.get() || { x: -999, y: -999 };
    const r = p.el.getBoundingClientRect(); return { x: r.left + r.width * p.fx, y: r.top + r.height * p.fy + (p.dy || 0), w: r.width };
  }
  function goodPoint(pt) { return pt.y > navH() + 70 && pt.y < innerHeight - 30 && pt.x > 30 && pt.x < innerWidth - 30; }
  function activeSection() {
    let best = null, bestV = 0;
    [...new Set(PERCHES.map(c => c.sec))].forEach(sec => {
      const s = $(sec); if (!s) return;
      const r = s.getBoundingClientRect();
      const v = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight;
      if (v > bestV) { bestV = v; best = sec; }
    });
    return best;
  }
  function candidates(sec) {
    return PERCHES.filter(c => c.sec === sec && (!c.phone || Util.phone.matches)).flatMap(cfg => $$(cfg.sel).filter(el => el.offsetParent !== null)
      .map(el => ({ el, fx: cfg.fx, fy: cfg.fy, dy: cfg.dy, fixed: cfg.fixed, get: cfg.line ? () => lineEnd(el) : null })));
  }
  function bestPerch() {
    const sec = activeSection(); if (!sec) return null;
    const c = candidates(sec).map(p => ({ p, pt: pointOf(p) })).filter(o => goodPoint(o.pt));
    if (!c.length) return null;
    c.sort((a, b) => Math.abs(a.pt.y - innerHeight * .38) - Math.abs(b.pt.y - innerHeight * .38));
    return c[0].p;
  }
  // the bird's home: the little branch growing out of the navbar
  // the navbar is fixed, so its branch only moves when the window resizes: measure it once per resize
  let navPoint = null;
  addEventListener('resize', () => { navPoint = null; });
  const NAV_PERCH = { el: null, get: () => { if (!navPoint) { const r = NAV_PERCH.el.getBoundingClientRect(); navPoint = { x: r.left + r.width * .6, y: r.top + r.height * .46 }; } return navPoint; }, nav: true };
  function goHome() { if (Bird.currentPerch() === NAV_PERCH && Bird.mode !== 'idle') return; Bird.setMini(.55); Bird.perchOn(NAV_PERCH, { force: true }); }
  // Scrolling: the bird waits on the navbar branch (a fast scroll sends it straight there).
  // After 5 seconds without scrolling it flies down to a spot on the screen.
  const IDLE_MS = 5000, FAST_PX_S = 1600;
  let lastScroll = -1e9, lastY = scrollY, lastT = performance.now(), speed = 0;
  addEventListener('scroll', () => {
    const now = performance.now(), dt = Math.max(16, now - lastT);
    speed = speed * .6 + Math.abs(scrollY - lastY) / dt * 1000 * .4;
    lastY = scrollY; lastT = now; lastScroll = now;
    if (Util.phone.matches) Bubble.hide();      // phones: a speech bubble would trail behind a scrolling page
  }, { passive: true });
  // Phones: the bird only sits on boxes in the page (never on headings, never on the navbar branch) and
  // scrolls along with them. When you stop scrolling in a new section it flies over, in page coordinates.
  // No route-following on the pinned map: that part of the page is moved by script, so it would lag.
  const PHONE_QUIET_MS = 700;
  const phonePerches = sec => candidates(sec).filter(p => !p.fixed && !p.get);
  function phonePerchManager() {
    if (Bird.busy || Bird.mode === 'flying' || Bird.mode === 'busy') return;
    if (Bird.mode === 'track') Bird.untrack();
    if (performance.now() - lastScroll < PHONE_QUIET_MS) return;          // never move while you scroll
    const cur = Bird.currentPerch(), sec = activeSection(); if (!sec) return;
    const inView = pt => pt.y > navH() + 40 && pt.y < innerHeight - 20 && pt.x > 20 && pt.x < innerWidth - 20;
    if (cur && cur.el && cur.el.isConnected && !cur.nav && !cur.fixed && inView(pointOf(cur))) return;   // still visible: stay
    const c = phonePerches(sec).map(p => ({ p, pt: pointOf(p) })).filter(o => inView(o.pt));
    if (!c.length) return;                                                 // nothing to sit on here: stay where it was
    c.sort((a, b) => Math.abs(a.pt.y - innerHeight * .4) - Math.abs(b.pt.y - innerHeight * .4));
    Bird.setMini(1); Bird.perchOn(c[0].p);
  }
  function perchManager() {
    const panel = ['#checkout', '#product', '#cart', '#legal'].some(s => Util.isOpen($(s)));
    if (Util.phone.matches) { Bird.hideFor(panel); if (!panel) phonePerchManager(); return; }
    if (panel) return;
    const now = performance.now(), quiet = now - lastScroll > IDLE_MS, fast = now - lastScroll < 250 && speed > FAST_PX_S;
    if (Origin.onRoute && !reduced.matches && !fast) { if (Bird.mode !== 'track' && !Bird.busy) { Bird.setMini(1); Bird.track(Origin.routePoint); } return; }
    if (Bird.mode === 'track') Bird.untrack();
    if (Bird.busy || Bird.mode === 'busy') return;
    const cur = Bird.currentPerch(), sec = activeSection();
    if (fast) { goHome(); return; }
    // already sitting somewhere on the page and still in view: stay (it scrolls with the page)
    if (cur && !cur.nav && sec && Bird.mode !== 'idle') {
      const stillHere = candidates(sec).some(p => p.el === cur.el) && cur.el.isConnected && goodPoint(pointOf(cur));
      if (stillHere) return;
    }
    if (!quiet) { goHome(); return; }       // still scrolling recently: wait on the branch
    const b = bestPerch();
    if (b) { Bird.setMini(1); Bird.perchOn(b); }
    else goHome();
  }

  /* ---------- scrolling: native, no smoothing, so it stops when you stop ---------- */
  function initScroll() {
    if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href'); const t = id === '#top' ? document.body : $(id); if (!t) return;
      e.preventDefault();
      closeMenu();
      const go = () => {
        const top = id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - navH() - 10;
        scrollTo({ top, behavior: reduced.matches ? 'auto' : 'smooth' });
      };
      if (a.closest('#cart')) { Util.close($('#cart')); setTimeout(go, 350); } else go();
      if (t.tabIndex < 0 && t !== document.body) { t.setAttribute('tabindex', '-1'); }
      setTimeout(() => t.focus && t.focus({ preventScroll: true }), 900);
    });
  }

  /* ---------- reveals ---------- */
  function initReveals() {
    if (!hasGsap || !window.ScrollTrigger || reduced.matches) return;
    $$('.split').forEach(h => {
      if (h.id === 'heroTitle') return;
      const words = h.querySelectorAll('.w');
      // room above and below so accents (é) and cedillas (ç) are not cut by the mask
      gsap.set(words, { overflow: 'hidden', verticalAlign: 'top', paddingTop: '.2em', marginTop: '-.2em', paddingBottom: '.14em', marginBottom: '-.14em' });
      gsap.from(h.querySelectorAll('.ch'), { yPercent: 130, rotate: 6, duration: 1, ease: 'expo.out', stagger: .022, scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        onComplete: () => gsap.set(words, { overflow: 'visible' }) });
    });
    const batch = (sel, vars = {}) => ScrollTrigger.batch(sel, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.from(els, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, ...vars, overwrite: true }),
    });
    batch('.card'); batch('.bundle'); batch('.fact'); batch('.retail-points li'); batch('.ship-facts li', { y: 14 }); batch('#farmPoints li', { y: 20 });
    // the hero headline gets lighter as it leaves
  }

  /* ---------- headings: letters near the pointer turn lighter ---------- */
  function initWeightPlay() {
    if (coarse.matches || reduced.matches) return;
    $$('.display, .h2').forEach(h => {
      // measure the letters once when the pointer enters (in page coordinates), then only write:
      // reading positions between weight changes would force a full re-layout per letter
      let raf = null, px = 0, py = 0, letters = [];
      h.addEventListener('pointerenter', () => {
        letters = [...h.querySelectorAll('.ch')].map(c => { const r = c.getBoundingClientRect(); return { c, x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY, w: 0 }; });
      });
      h.addEventListener('pointermove', e => {
        px = e.clientX + scrollX; py = e.clientY + scrollY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          for (const l of letters) {
            const w = Math.round((300 + 400 * Util.clamp(Math.hypot(l.x - px, l.y - py) / 160, 0, 1)) / 50) * 50;
            if (w !== l.w) { l.w = w; l.c.style.fontWeight = w; }
          }
        });
      });
      h.addEventListener('pointerleave', () => { letters.forEach(l => { l.w = 0; l.c.style.fontWeight = ''; }); letters = []; });
      h.querySelectorAll('.ch').forEach(c => c.classList.add('hoverable'));
    });
  }

  /* ---------- cursor + magnetic buttons ---------- */
  function initCursor() {
    if (coarse.matches || reduced.matches) return;
    document.documentElement.classList.add('has-cursor');
    const cur = $('#cursor'), label = $('#cursorLabel');
    const TYPING = 'input:not([type=checkbox]):not([type=radio]), textarea, select';
    const NL = () => I18N.lang === 'nl';
    let lastTarget = null;
    // move on every pointer event (no animation loop, so it never trails behind)
    addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      cur.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const t = e.target;
      if (t === lastTarget && !cur.classList.contains('off')) return;   // same element: states are unchanged
      lastTarget = t;
      if (!t.closest) return;
      const typing = !!t.closest(TYPING);
      const lab = t.closest('[data-cursor="drag"]') ? (NL() ? 'draai' : 'turn') : '';
      const interactive = t.closest('a, button, label, summary, [data-cursor], .bird, .pack-slot, canvas, [role=tab], [role=radio]');
      cur.classList.toggle('off', typing);                               // text fields keep the normal I-beam only
      cur.classList.toggle('hover', !!interactive && !lab);
      cur.classList.toggle('label', !!lab);
      label.textContent = lab;
      cur.classList.toggle('on-dark', !!t.closest('.pairing, .retail, .footer, .strip, .bundle'));
    }, { passive: true });
    addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') cur.classList.add('down'); });
    addEventListener('pointerup', () => cur.classList.remove('down'));
    // hide when the pointer leaves the window, show again when it comes back
    document.documentElement.addEventListener('pointerleave', () => cur.classList.add('off'));
    document.documentElement.addEventListener('pointerenter', () => { lastTarget = null; cur.classList.remove('off'); });
    addEventListener('blur', () => cur.classList.add('off'));
    // a touch on a touchscreen laptop: step aside until the mouse moves again
    addEventListener('touchstart', () => { cur.classList.add('off'); lastTarget = null; }, { passive: true });
    // magnetic buttons pull toward the pointer
    document.addEventListener('pointermove', e => {
      const m = e.target.closest && e.target.closest('.magnetic');
      $$('.magnetic.pulled').forEach(b => { if (b !== m) { b.classList.remove('pulled'); gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }); } });
      if (!m) return;
      const r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      m.classList.add('pulled');
      gsap.to(m, { x: dx * .22, y: dy * .3, duration: .4, ease: 'power3.out' });
    }, { passive: true });
  }

  /* ---------- menu, sound, language ---------- */
  function closeMenu() { const m = $('#menu'); if (!m.hidden) { m.hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; } }
  function initControls() {
    $('#menuBtn').addEventListener('click', () => {
      const m = $('#menu'), open = m.hidden;
      if (!open) return closeMenu();
      m.hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); document.documentElement.style.overflow = 'hidden';
      if (hasGsap && !reduced.matches) gsap.from('#menu a', { y: 40, opacity: 0, duration: .7, stagger: .05, ease: 'expo.out' });
      m.querySelector('a').focus();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    $('#soundBtn').addEventListener('click', () => {
      const on = !Sound.on; Sound.set(on);
      $('#soundBtn').setAttribute('aria-pressed', String(on));
      $('#soundBtn').setAttribute('aria-label', on ? (I18N.lang === 'nl' ? 'Geluid aan. Zet geluid uit' : 'Sound on. Turn sound off') : (I18N.lang === 'nl' ? 'Geluid uit. Zet geluid aan' : 'Sound off. Turn sound on'));
      if (on) Sound.chirp(3);
    });
    $$('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  }
  function setLang(lang) {
    if (lang === I18N.lang) return;
    I18N.apply(lang); store.set('lang', lang);
    Shop.render(); Hero.relabel(); Pairing.rerender(); Checkout.rerender(); Farm.relabel(); Quiz.rerender();
    if (!coarse.matches && !reduced.matches) initWeightPlay();
  }

  /* ---------- cookies + legal ---------- */
  function initCookies() {
    const c = $('#cookies');
    const choice = store.get('cookies', null);
    if (!choice) setTimeout(() => { c.hidden = false; if (hasGsap && !reduced.matches) gsap.from(c, { y: 40, opacity: 0, duration: .8, ease: 'expo.out' }); }, 1800);
    const save = v => { store.set('cookies', v); c.hidden = true; Util.toast(I18N.s().cookieSaved); };
    $('#cookieDecline').addEventListener('click', () => save('essential'));
    $('#cookieAccept').addEventListener('click', () => save('analytics'));   // no analytics are loaded yet [TBD]
    $('#cookieOpen').addEventListener('click', () => { c.hidden = false; $('#cookieDecline').focus(); });
  }
  function legal(which) {
    const L = I18N.s().legal, sh = DATA.shipping, m = Util.money;
    const tabs = Object.keys(L).map(k => `<button type="button" data-legal-tab="${k}" aria-current="${k === which}">${L[k].t}</button>`).join('');
    $('#legalBody').innerHTML = `<div class="legal-tabs">${tabs}</div><h2 id="legalTitle">${L[which].t}</h2>${L[which].body.replace('{ship}', m(sh.standardCents)).replace('{free}', m(sh.freeFromCents)).replace('{days}', sh.deliveryDays)}`;
  }
  function initLegal() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-legal]'); if (b) { legal(b.dataset.legal); Util.open($('#legal'), { trigger: b }); }
      const t = e.target.closest('[data-legal-tab]'); if (t) { legal(t.dataset.legalTab); $(`[data-legal-tab="${t.dataset.legalTab}"]`).focus(); }
    });
  }

  /* ---------- forms ---------- */
  function fieldError(input, msg) {
    const f = input.closest('.field'); let err = f.querySelector('.err');
    if (!err) { err = document.createElement('span'); err.className = 'err'; err.id = input.id + '-err'; err.setAttribute('aria-live', 'polite'); f.appendChild(err); input.setAttribute('aria-describedby', err.id); }
    if (msg) { f.setAttribute('data-invalid', ''); input.setAttribute('aria-invalid', 'true'); } else { f.removeAttribute('data-invalid'); input.removeAttribute('aria-invalid'); }
    err.textContent = msg || '';
  }
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  function initForms() {
    const rf = $('#retailForm');
    const checkR = i => { const bad = i.required && (!i.value.trim() || (i.type === 'email' && !emailOk(i.value))); fieldError(i, bad ? (i.type === 'email' && i.value ? I18N.s().co.err.email : I18N.s().co.err.required) : ''); return !bad; };
    rf.addEventListener('focusout', e => { if (e.target.matches('input[required], select[required]') && e.target.value) checkR(e.target); });
    rf.addEventListener('input', e => { if (e.target.closest('[data-invalid]')) checkR(e.target); });
    rf.addEventListener('submit', e => {
      e.preventDefault();
      const req = $$('input[required], select[required]', rf); let first = null;
      req.forEach(i => { if (!checkR(i) && !first) first = i; });
      if (first) { first.focus(); Util.toast(I18N.s().retailErr); return; }
      const ok = $('#retailSuccess'); ok.hidden = false; ok.focus();
      if (hasGsap && !reduced.matches) {
        gsap.from(ok, { opacity: 0, duration: .4 });
        gsap.fromTo(ok.querySelector('.envelope'), { y: 40, rotate: -12, scale: .6 }, { y: 0, rotate: 0, scale: 1, duration: 1, ease: 'elastic.out(1,.5)' });
        gsap.from(ok.querySelectorAll('h3, p'), { y: 16, opacity: 0, stagger: .1, delay: .3, duration: .8, ease: 'expo.out' });
      }
      Bird.happy(1200); Sound.melody();
    });
    const lf = $('#letterForm');
    lf.addEventListener('submit', e => {
      e.preventDefault();
      const em = $('#nlEmail'), ok = emailOk(em.value) && $('#nlConsent').checked;
      $('#letterMsg').textContent = ok ? I18N.s().letterOk : I18N.s().letterErr;
      fieldError(em, emailOk(em.value) ? '' : I18N.s().co.err.email);
      if (ok) { lf.reset(); Bird.happy(1200); Bird.hop(2); Sound.melody(); }
    });
  }

  /* ---------- the bird's facts, goodbye and bedtime ---------- */
  function initBirdMoments() {
    $('#facts').addEventListener('click', async e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act, s = I18N.s().bird;
      Bird.say(s[act], 2600);
      if (act === 'sleep') { Bird.sleep(true); setTimeout(() => Bird.sleep(false), 3200); }
      if (act === 'toss') Bird.toss();
      if (act === 'beak') Bird.showBeak();
      if (act === 'hop') Bird.hop(3);
      if (act === 'sing') { Sound.chirp(5); Bird.happy(1200); }
    });
    // wave goodbye at the newsletter; fall asleep if you linger at the very bottom
    let waved = false, sleepTimer = null, asleep = false;
    const letter = $('#letter');
    new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting && en.intersectionRatio > .55) { Bird.wave(true); if (!waved) { waved = true; setTimeout(() => Bird.say(I18N.s().bird.bye, 2400), 700); } setTimeout(() => Bird.wave(false), 2600); }
    }), { threshold: [0, .55, .8] }).observe(letter);
    addEventListener('scroll', () => {
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && !sleepTimer && !asleep) sleepTimer = setTimeout(() => { asleep = true; Bird.sleep(true); $('#footerSecret').textContent = I18N.s().bird.night; }, 5000);
      if (!atBottom) { clearTimeout(sleepTimer); sleepTimer = null; if (asleep) { asleep = false; Bird.sleep(false); $('#footerSecret').textContent = ''; } }
    }, { passive: true });
  }

  function init() {
    if (hasGsap) document.documentElement.classList.add('js');
    I18N.capture();
    $$('.split').forEach(h => Util.split(h));
    const lang = store.get('lang', 'en');
    if (lang === 'nl') I18N.apply('nl');
    NAV_PERCH.el = $('#navBranch svg');
    initScroll();
    Bird.build();
    Hero.init();
    Origin.init();
    Shop.init();
    Checkout.init();
    Pairing.init();
    Farm.init();
    Quiz.init();
    initReveals();
    initWeightPlay();
    initCursor();
    initControls();
    initCookies();
    initLegal();
    initForms();
    initBirdMoments();
    // the bird flies in and lands on the hero pack
    const s = Bird.state; s.x = innerWidth + 80; s.y = -60;
    setTimeout(() => {
      Bird.perchOn({ el: $('#heroPack'), fx: .64, fy: .035 }).then(() => setTimeout(() => Bird.say(I18N.s().bird.hello, 2600), 300));
      setInterval(perchManager, 220);
    }, reduced.matches ? 100 : 1100);
    if (window.ScrollTrigger) addEventListener('load', () => ScrollTrigger.refresh());
  }
  // perch at the end of a panel title (cart, product sheet, checkout)
  function birdTo(el) {
    if (!el || Util.phone.matches) return;          // phones: the bird steps aside while a panel is open
    Bird.setMini(true);
    setTimeout(() => Bird.perchOn({ el, fixed: true, get: () => { const r = el.getBoundingClientRect(); const t = el.firstChild && el.firstChild.nodeType === 3 ? (() => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); })() : r; return { x: Math.min(t.right + Bird.state.size * .45, innerWidth - Bird.state.size * .5), y: t.top >= 0 ? Math.max(t.bottom - 4, Bird.state.size * .92 + 8) : t.bottom - 4 }; } }, { force: true }), 380);
  }
  function birdHome() { if (Util.phone.matches) return; setTimeout(() => { const b = bestPerch(); if (b) { Bird.setMini(1); Bird.perchOn(b, { force: true }); } else goHome(); }, 300); }
  return { init, bestPerch, birdTo, birdHome };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init); else App.init();
window.App = App;
