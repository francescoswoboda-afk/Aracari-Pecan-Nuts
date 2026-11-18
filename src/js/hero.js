/* Colour worlds + hero.
   World.set(flavour) tweens the --f-* tokens so the page, the patterns
   and the bird's accents shift to that flavour. */
const World = (() => {
  let current = null;
  function vars(f) {
    const c = f.colors, ink = Util.inkFor(c.body);
    return { '--f-body': c.body, '--f-strip': c.strip, '--f-band': c.band, '--f-ink': ink, '--f-soft': Util.mix(c.body, '#f6efe2', .7) };
  }
  function set(f, opts = {}) {
    if (!f || current === f.id) return;
    current = f.id;
    // set the tokens once; the elements that show them fade with CSS transitions (--world-t in styles.css).
    // Tweening the tokens restyled the whole page every frame and dropped the frame rate.
    const v = vars(f), root = document.documentElement;
    v['--world-t'] = opts.instant || Util.reduced.matches ? '0s' : `${opts.duration ?? 1.1}s ease-in-out`;
    Object.entries(v).forEach(([k, val]) => root.style.setProperty(k, val));
    Bird.setAccent(f.colors);
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = f.colors.body;
  }
  return { set, get current() { return current; } };
})();

const Hero = (() => {
  let pack, index = 0, timer, pausedUntil = 0, inView = true;
  const flavours = DATA.flavours;

  // the handwritten note from the v3 pack, beside the hero pack
  function notes(f) {
    const n = document.querySelectorAll('.hn');
    n.forEach((el, i) => {
      el.textContent = i === 0 ? f.note[I18N.lang] : '';
      if (window.gsap && !Util.reduced.matches) gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)', y: 6 }, { clipPath: 'inset(0 0% 0 0)', y: 0, duration: .9, delay: .25 + i * .18, ease: 'power3.out' });
    });
  }
  // the hero alternates formats so both are seen: even flavours as a pouch, odd ones as a tube
  const fmtFor = i => (i % 2 ? 'tube' : 'pouch');
  const label = () => `${fname(flavours[index])} · ${DATA.formats[fmtFor(index)].name[I18N.lang]}`;
  function show(i, opts = {}) {
    index = (i + flavours.length) % flavours.length;
    const f = flavours[index];
    if (pack.flavour !== f || pack.fmt !== fmtFor(index)) pack.swap(f, opts.dir || 1, fmtFor(index));
    World.set(f);
    document.getElementById('heroFlavourName').textContent = label();
    document.querySelectorAll('.swatch').forEach((s, j) => { s.setAttribute('aria-checked', String(j === index)); s.tabIndex = j === index ? 0 : -1; });
    notes(f);
  }
  function choose(i) {
    pausedUntil = performance.now() + 14000;
    show(i, { dir: i > index ? 1 : -1 });
    if (Bird.currentPerch()?.el === pack.el && !Bird.busy) { Bird.hop(2); }
  }
  function renderSwatches() {
    const box = document.getElementById('heroSwatches');
    box.innerHTML = flavours.map((f, i) => `<button type="button" class="swatch" role="radio" aria-checked="${i === index}" tabindex="${i === index ? 0 : -1}" aria-label="${fname(f)}" style="--sw-body:${f.colors.body};--sw-band:${f.colors.band};--sw-strip:${f.colors.strip}" data-i="${i}"><span></span></button>`).join('');
    box.onclick = e => { const b = e.target.closest('.swatch'); if (b) choose(+b.dataset.i); };
    box.onkeydown = e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault(); const n = (index + d + flavours.length) % flavours.length; choose(n); box.children[n].focus();
    };
  }
  function cycle() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!inView || performance.now() < pausedUntil || document.hidden) return;
      show(index + 1);
    }, Util.reduced.matches ? 11000 : 8000);
  }
  function intro() {
    const title = document.getElementById('heroTitle');
    if (!window.gsap || Util.reduced.matches) return;
    const chars = title.querySelectorAll('.ch');
    const words = title.querySelectorAll('.w');
    gsap.set(words, { overflow: 'hidden', verticalAlign: 'top', paddingTop: '.2em', marginTop: '-.2em', paddingBottom: '.14em', marginBottom: '-.14em' });
    gsap.from(chars, { yPercent: 130, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: .035, delay: .15, onComplete: () => gsap.set(words, { overflow: 'visible' }) });
    gsap.from('.hero .eyebrow, .hero .lead, .hero-cta > *, .hero-picker', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, delay: .5 });
    gsap.from(pack.el, { y: -140, rotate: -8, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .2 });
  }
  function init() {
    pack = createPack(document.getElementById('heroPack'), flavours[0], { ry: -16, bob: 12, sway: 1.6, swapSlow: 1.6 });
    pack.el.tabIndex = 0; pack.el.setAttribute('role', 'img');
    renderSwatches();
    show(0);
    intro();
    cycle();
    // tilt the hero pack toward the pointer anywhere in the hero
    const hero = document.getElementById('hero');
    let heroBox = null;
    hero.addEventListener('pointerenter', () => { heroBox = hero.getBoundingClientRect(); });
    hero.addEventListener('pointermove', e => {
      if (Util.coarse.matches || !heroBox) return;
      pack.setTilt(((e.clientY - heroBox.top) / heroBox.height - .5) * -10);
    });
    new IntersectionObserver(es => es.forEach(e => (inView = e.isIntersecting)), { threshold: .25 }).observe(hero);
  }
  return { init, get pack() { return pack; }, relabel() { renderSwatches(); document.getElementById('heroFlavourName').textContent = label(); pack.paint(flavours[index]); notes(flavours[index]); } };
})();
