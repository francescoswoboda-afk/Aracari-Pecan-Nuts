/* The pairing ritual: pick a wine or a cheese, the glass fills (or the cheese
   is sliced) and a flavour is poured, with the reason written out. */
const Pairing = (() => {
  const { $, $$ } = Util;
  let kind = 'wine', choice = null, typer = null;

  function options() {
    const L = I18N.lang;
    $('#pairOptions').innerHTML = DATA.pairings[kind].map(o => `<button type="button" class="pair-opt" aria-pressed="${choice === o.id}" data-opt="${o.id}" style="--o-c:${o.color}"><i aria-hidden="true"></i>${o.name[L]}</button>`).join('');
    $('#pairOptions').setAttribute('aria-labelledby', kind === 'wine' ? 'tabWine' : 'tabCheese');
  }
  function art(o) {
    const svg = $('#pairArt');
    if (kind === 'wine') {
      svg.innerHTML = `
        <defs><clipPath id="bowl"><path d="M95 40h110c4 50-6 104-55 112C101 144 91 90 95 40z"/></clipPath></defs>
        <g clip-path="url(#bowl)"><g id="liquid"><path d="M60 300V150q22-8 45 0t45 0 45 0 45 0V300z" fill="${o.color}"/><path d="M60 150q22-8 45 0t45 0 45 0 45 0" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/></g></g>
        <path d="M95 40h110c4 50-6 104-55 112C101 144 91 90 95 40z" fill="rgba(246,239,226,.06)" stroke="#f6efe2" stroke-width="3" stroke-linejoin="round"/>
        <path d="M150 152v86M112 246q38-14 76 0" fill="none" stroke="#f6efe2" stroke-width="3" stroke-linecap="round"/>
        <path d="M112 56c-2 20 0 40 8 58" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="4" stroke-linecap="round"/>`;
      if (window.gsap && !Util.reduced.matches) gsap.fromTo('#liquid', { y: 110 }, { y: -62, duration: 1.6, ease: 'power2.out' });
      else $('#liquid').setAttribute('transform', 'translate(0 -62)');
    } else {
      svg.innerHTML = `
        <g id="wedge">
          <path d="M40 200L240 140L250 200Z" fill="${Util.mix(o.color, '#000000', .12)}" stroke="#f6efe2" stroke-width="3" stroke-linejoin="round"/>
          <path d="M40 200L250 200V250L40 250Z" fill="${o.color}" stroke="#f6efe2" stroke-width="3" stroke-linejoin="round"/>
          <path d="M250 200L240 140V196L250 250Z" fill="${Util.mix(o.color, '#000000', .25)}" stroke="#f6efe2" stroke-width="3" stroke-linejoin="round"/>
          <g fill="${Util.mix(o.color, '#000000', .2)}"><circle cx="90" cy="226" r="8"/><circle cx="150" cy="214" r="5"/><circle cx="200" cy="232" r="9"/><circle cx="125" cy="240" r="4"/></g>
          ${o.id === 'blue' ? '<g stroke="#4a6a8a" stroke-width="2.5" stroke-linecap="round"><path d="M70 222l14 6M160 230l10-8M210 214l8 10M120 214l12 3"/></g>' : ''}
        </g>
        <path d="M30 262h240" stroke="#f6efe2" stroke-width="3" stroke-linecap="round" opacity=".5"/>`;
      if (window.gsap && !Util.reduced.matches) gsap.fromTo('#wedge', { x: 120, rotate: 12, opacity: 0, transformOrigin: '50% 100%' }, { x: 0, rotate: 0, opacity: 1, duration: 1.1, ease: 'expo.out' });
    }
  }
  function result(o) {
    const f = byId(o.pick), s = I18N.s(), L = I18N.lang;
    World.set(f, { duration: 1 });
    const box = $('#pairResult');
    box.innerHTML = `
      <span class="pr-eyebrow">${s.pairFor(o.name[L])}</span>
      <img class="pack-mini" src="${f.img.front}" alt="${fname(f)} pack">
      <h3>${fname(f)}</h3>
      <p class="why" aria-live="off"></p>
      <div class="row"><span class="price" style="color:var(--cream)">${Util.priceHTML(f.price.pouch)}</span><button type="button" class="btn btn-solid magnetic" data-add="${f.id}">${s.addToCart}</button><button type="button" class="btn btn-line" style="--b-bg:var(--cream);--b-fg:var(--ink)" data-detail="${f.id}">${s.details}</button></div>`;
    const why = box.querySelector('.why'), text = o.why[L];
    box.setAttribute('aria-label', `${fname(f)}. ${text}`);
    if (window.gsap && !Util.reduced.matches) {
      gsap.from(box.querySelector('.pack-mini'), { y: 60, rotate: -14, opacity: 0, duration: 1, ease: 'back.out(1.6)', delay: .5 });
      gsap.from(box.querySelectorAll('h3, .row'), { y: 18, opacity: 0, duration: .8, ease: 'expo.out', stagger: .1, delay: .8 });
      clearInterval(typer); let i = 0;
      setTimeout(() => { typer = setInterval(() => { why.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(typer); }, 16); }, 1000);
    } else why.textContent = text;
    // the bird hops over to the glass
    if (Bird.currentPerch()?.el?.id === 'pairStage') Bird.hop(1);
  }
  function choose(id) {
    choice = id;
    const o = DATA.pairings[kind].find(x => x.id === id);
    $$('.pair-opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.opt === id)));
    art(o); result(o);
  }
  function setKind(k) {
    kind = k; choice = null;
    $$('.pair-tabs [role=tab]').forEach(t => { const on = t.dataset.kind === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    options();
    choose(DATA.pairings[k][0].id);
  }
  function init() {
    $('.pair-tabs').addEventListener('click', e => { const t = e.target.closest('[role=tab]'); if (t) setKind(t.dataset.kind); });
    $('.pair-tabs').addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const next = kind === 'wine' ? 'cheese' : 'wine'; setKind(next); $(`.pair-tabs [data-kind=${next}]`).focus();
    });
    $('#pairOptions').addEventListener('click', e => { const b = e.target.closest('.pair-opt'); if (b) choose(b.dataset.opt); });
    options();
    // open in a working state: the first wine is already poured
    const o = DATA.pairings.wine[0]; choice = o.id; options(); art(o);
    const f = byId(o.pick), s = I18N.s();
    $('#pairResult').innerHTML = `<span class="pr-eyebrow">${s.pairFor(o.name[I18N.lang])}</span><img class="pack-mini" src="${f.img.front}" alt="${fname(f)} pack"><h3>${fname(f)}</h3><p class="why">${o.why[I18N.lang]}</p><div class="row"><span class="price" style="color:var(--cream)">${Util.priceHTML(f.price.pouch)}</span><button type="button" class="btn btn-solid magnetic" data-add="${f.id}">${s.addToCart}</button><button type="button" class="btn btn-line" style="--b-bg:var(--cream);--b-fg:var(--ink)" data-detail="${f.id}">${s.details}</button></div>`;
  }
  return { init, rerender: () => { options(); if (choice) { const o = DATA.pairings[kind].find(x => x.id === choice); art(o); result(o); } } };
})();
