/* Small shared helpers. */
const Util = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
  // phones and touch tablets: the bird rides along with the page there instead of flying around
  const phone = window.matchMedia('(hover: none) and (pointer: coarse), (max-width: 820px)');

  // €5,95 (Dutch formatting, comma decimals)
  const money = cents => '€' + (cents / 100).toFixed(2).replace('.', ',');
  const priceHTML = cents => `${money(cents)}${DATA.pricesConfirmed ? '' : '<span class="tbd">[TBD]</span>'}`;

  // browser storage can be missing or throw; the site works without it
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem('aracari.' + k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem('aracari.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };

  // relative luminance + pick the more readable ink for a background
  function lum(hex) {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const inkFor = bg => contrast(bg, '#13333a') >= contrast(bg, '#fbf3e3') ? '#13333a' : '#fbf3e3';
  const mix = (a, b, t) => {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };

  // Split a heading into words and letters for animation. A's get the pack's painted peak.
  function split(el) {
    if (el.dataset.text == null) el.dataset.text = el.innerHTML;
    const tmp = document.createElement('div'); tmp.innerHTML = el.dataset.text;
    const text = tmp.textContent.trim();
    el.setAttribute('aria-label', text);
    const words = text.split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w" aria-hidden="true">${[...w].map(ch => `<span class="ch${/[aA]/.test(ch) ? ' pa' : ''}">${ch}</span>`).join('')}</span>`).join(' ');
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---- dialogs: drawer, sheets, checkout. Focus trap, Esc, focus restore. ---- */
  const stack = [];
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  function open(el, opts = {}) {
    if (stack.find(s => s.el === el)) return;
    const scrim = $('#scrim');
    stack.push({ el, returnTo: document.activeElement, onClose: opts.onClose });
    if (el.id !== 'checkout') { scrim.hidden = false; scrim.style.zIndex = 70 + stack.length * 2; }
    el.style.zIndex = 71 + stack.length * 2;
    el.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    const fromX = el.classList.contains('drawer') || el.classList.contains('sheet');
    if (window.gsap && !reduced.matches) {
      gsap.fromTo(el, fromX ? { xPercent: 100 } : { yPercent: 6, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: .7, ease: 'expo.out' });
      if (!scrim.hidden) gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: .4 });
    }
    const first = el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE);
    setTimeout(() => first && first.focus({ preventScroll: true }), 60);
    const btn = opts.trigger; if (btn) btn.setAttribute('aria-expanded', 'true');
    el._trigger = btn;
  }
  function close(el) {
    const i = stack.findIndex(s => s.el === el); if (i < 0) return;
    const [entry] = stack.splice(i, 1);
    const scrim = $('#scrim');
    const done = () => {
      el.hidden = true;
      if (!stack.some(s => s.el.id !== 'checkout')) scrim.hidden = true; else scrim.style.zIndex = 70 + stack.length * 2;
      if (!stack.length) { document.documentElement.style.overflow = ''; }
    };
    if (el._trigger) el._trigger.setAttribute('aria-expanded', 'false');
    if (window.gsap && !reduced.matches) {
      const fromX = el.classList.contains('drawer') || el.classList.contains('sheet');
      gsap.to(el, { ...(fromX ? { xPercent: 100 } : { yPercent: 4, opacity: 0 }), duration: .45, ease: 'power3.in', onComplete: done });
      if (!stack.some(s => s.el.id !== 'checkout')) gsap.to(scrim, { opacity: 0, duration: .35 });
    } else done();
    entry.onClose && entry.onClose();
    if (entry.returnTo && document.contains(entry.returnTo)) entry.returnTo.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', e => {
    const top = stack[stack.length - 1]; if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); close(top.el); return; }
    if (e.key === 'Tab') {
      const f = $$(FOCUSABLE, top.el).filter(n => n.offsetParent !== null || n === document.activeElement);
      if (!f.length) return;
      const [a, b] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    }
  });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-close]');
    if (c) { const d = c.closest('[role="dialog"]'); if (d) close(d); }
    if (e.target.id === 'scrim') { const top = [...stack].reverse().find(s => s.el.id !== 'checkout'); if (top) close(top.el); }
  });
  const isOpen = el => stack.some(s => s.el === el);

  return { $, $$, clamp, lerp, rand, reduced, coarse, phone, money, priceHTML, store, inkFor, contrast, mix, split, toast, open, close, isOpen };
})();
