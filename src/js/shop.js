/* Shop: product cards, bundles, product detail sheet, and the cart. */
const byId = id => DATA.flavours.find(f => f.id === id);
const bundleById = id => DATA.bundles.find(b => b.id === id);
const fmtOf = l => (l.fmt === 'tube' ? 'tube' : 'pouch');
const packImg = (f, fmt) => (fmt === 'tube' ? f.img.tube : f.img.front);
const fmtName = fmt => DATA.formats[fmt].name[I18N.lang];

const Cart = (() => {
  const { $, money, store } = Util;
  let lines = store.get('cart', []).filter(l => (l.type === 'flavour' ? byId(l.id) : bundleById(l.id)))
    .map(l => (l.type === 'flavour' ? { ...l, fmt: fmtOf(l) } : l));

  const unit = l => {
    if (l.type === 'bundle') return bundleById(l.id).priceCents;
    const p = byId(l.id).price[fmtOf(l)];
    return l.sub ? Math.round(p * (1 - DATA.subscription.discountPercent / 100)) : p;
  };
  const subtotal = () => lines.reduce((s, l) => s + unit(l) * l.qty, 0);
  const count = () => lines.reduce((s, l) => s + l.qty, 0);
  const shipping = () => (subtotal() === 0 || subtotal() >= DATA.shipping.freeFromCents ? 0 : DATA.shipping.standardCents);
  const total = () => subtotal() + shipping();
  const vatIncluded = () => Math.round(total() - total() / (1 + DATA.vat.foodRatePercent / 100));
  const key = it => [it.type, it.id, it.type === 'flavour' ? fmtOf(it) : '', it.sub ? 'm' : 'o', it.msg || ''].join('|');
  const save = () => store.set('cart', lines);

  let lastAdd = -1e9;
  function add(item, fromEl) {
    lastAdd = performance.now(); $('#nav').classList.remove('hide');
    const k = key(item), found = lines.find(l => key(l) === k);
    if (found) found.qty += item.qty || 1; else lines.push({ type: item.type, id: item.id, fmt: item.type === 'flavour' ? fmtOf(item) : undefined, qty: item.qty || 1, sub: !!item.sub, msg: item.msg || '' });
    save(); render();
    const name = item.type === 'flavour' ? fname(byId(item.id)) : bundleById(item.id).name[I18N.lang];
    Util.toast(I18N.s().added(name));
    const img = item.type === 'flavour' ? packImg(byId(item.id), fmtOf(item)) : byId((bundleById(item.id).contents === 'all' ? DATA.flavours[0].id : bundleById(item.id).contents[0])).img.front;
    if (fromEl) Bird.deliver(fromEl, img, $('#cartBtn')); else bump();
  }
  function setQty(i, q) { if (q <= 0) lines.splice(i, 1); else lines[i].qty = Math.min(99, q); save(); render(); }
  function clear() { lines = []; save(); render(); }
  function bump() {
    const b = $('#cartBtn'), c = $('#cartCount');
    if (window.gsap && !Util.reduced.matches) {
      gsap.fromTo(b, { scale: 1 }, { scale: 1.12, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out' });
      gsap.fromTo(c, { rotate: -20, scale: 1.5 }, { rotate: 0, scale: 1, duration: .7, ease: 'elastic.out(1,.4)' });
    }
  }

  function lineName(l) { return l.type === 'flavour' ? fname(byId(l.id)) : bundleById(l.id).name[I18N.lang]; }
  function lineColor(l) { return l.type === 'flavour' ? byId(l.id).colors.body : '#285c69'; }
  function lineImg(l) { const b = l.type === 'bundle' && bundleById(l.id); return l.type === 'flavour' ? packImg(byId(l.id), fmtOf(l)) : byId(b.contents === 'all' ? 'salted-caramel' : b.contents[0]).img.front; }
  function lineSub(l) { const s = I18N.s(), b = l.type === 'bundle' && bundleById(l.id); return (b ? s.bundleOf(b.contents === 'all' ? DATA.flavours.length : b.contents.length) : fmtName(fmtOf(l))) + (l.sub ? ' · ' + s.monthly : ''); }

  function upsell() {
    const s = I18N.s();
    if (!lines.length) return '';
    const singles = lines.filter(l => l.type === 'flavour').reduce((a, l) => a + l.qty, 0);
    const box = bundleById('tasting-box');
    if (singles >= 3 && !lines.some(l => l.id === 'tasting-box')) {
      const eight = DATA.flavours.reduce((a, f) => a + f.price.pouch, 0), save = eight - box.priceCents;
      return { html: s.upsellBox(save > 0 ? s.upsellSave(money(save)) : ''), item: { type: 'bundle', id: box.id }, img: byId('salted-caramel').img.front, color: '#285c69' };
    }
    // balance the cart: sweet carts get something salty, salty carts something sweet or spiced
    const tastes = lines.filter(l => l.type === 'flavour').map(l => byId(l.id).taste);
    const salty = tastes.filter(t => t.includes('salty')).length, sweet = tastes.length - salty;
    const want = salty > sweet ? ['sweet', 'spiced', 'rich'] : ['salty-sweet', 'salty-rich'];
    const pick = DATA.flavours.find(f => want.includes(f.taste) && !lines.some(l => l.id === f.id));
    if (!pick) return '';
    return { html: s.upsellPair(fname(pick)), item: { type: 'flavour', id: pick.id, fmt: 'pouch' }, img: pick.img.front, color: pick.colors.body };
  }

  function render() {
    const s = I18N.s(), n = count();
    $('#cartCount').textContent = n;
    $('#cartBtn').setAttribute('aria-label', `${I18N.lang === 'nl' ? 'Mand' : 'Cart'}: ${n}`);
    const list = $('#cartLines');
    list.innerHTML = lines.map((l, i) => `
      <li class="line" style="--l-body:${lineColor(l)}">
        <div class="line-img"><img src="${lineImg(l)}" alt=""></div>
        <div>
          <h3>${lineName(l)}</h3>
          <div class="sub">${lineSub(l)}</div>
          ${l.msg ? `<div class="gift">“${escapeHTML(l.msg)}”</div>` : ''}
          <button type="button" class="remove" data-rm="${i}">${s.remove}</button>
        </div>
        <div class="line-right">
          <span class="line-price">${money(unit(l) * l.qty)}</span>
          <div class="qty" role="group" aria-label="${s.qty}: ${lineName(l)}">
            <button type="button" data-q="${i}" data-d="-1" aria-label="−1">−</button><output aria-live="polite">${l.qty}</output><button type="button" data-q="${i}" data-d="1" aria-label="+1">+</button>
          </div>
        </div>
      </li>`).join('');
    $('#cartEmpty').hidden = lines.length > 0;
    $('#cartFoot').hidden = lines.length === 0;
    // free shipping progress
    const free = DATA.shipping.freeFromCents, sub = subtotal();
    $('#shipBarText').textContent = sub >= free ? s.freeYes : s.freeAway(money(free - sub));
    $('#shipBarFill').style.width = Math.min(100, sub / free * 100) + '%';
    $('#shipBar').hidden = lines.length === 0;
    // upsell
    const u = upsell(), up = $('#upsell');
    if (u) {
      up.style.setProperty('--u-body', u.color);
      up.innerHTML = `<img src="${u.img}" alt=""><p>${u.html}</p><button type="button" class="btn btn-solid btn-sm" id="upsellAdd">${s.add}</button>`;
      $('#upsellAdd').onclick = () => add(u.item);
    } else up.innerHTML = '';
    $('#cartTotals').innerHTML = totalsHTML();
  }
  function totalsHTML() {
    const s = I18N.s();
    return `<dt>${s.subtotal}</dt><dd>${money(subtotal())}</dd>
      <dt>${s.shipping}</dt><dd>${shipping() ? money(shipping()) : s.free}</dd>
      <dt class="grand">${s.total}</dt><dd class="grand">${money(total())}</dd>
      <dt class="vat muted">${s.vat(DATA.vat.foodRatePercent, money(vatIncluded()))}</dt><dd></dd>`;
  }
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'); if (q) { const i = +q.dataset.q; setQty(i, lines[i].qty + +q.dataset.d); }
    const r = e.target.closest('[data-rm]'); if (r) setQty(+r.dataset.rm, 0);
  });
  function open() { render(); Util.open($('#cart'), { trigger: $('#cartBtn'), onClose: App.birdHome }); App.birdTo($('#cartTitle')); }

  return { get lastAdd() { return lastAdd; }, add, setQty, clear, render, open, bump, totalsHTML, get lines() { return lines; }, unit, lineName, lineSub, subtotal, shipping, total, vatIncluded, count };
})();

function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

const Shop = (() => {
  const { $, $$, priceHTML, money } = Util;
  const packs = [];

  function shipFacts() {
    const s = I18N.s(), sh = DATA.shipping;
    $('#shipFacts').innerHTML = `
      <li><b>NL</b> ${s.shipStd(money(sh.standardCents))}</li>
      <li>${s.shipFree(money(sh.freeFromCents))}</li>
      <li>${s.shipDays(sh.deliveryDays)}</li>
      <li class="allergen">${s.allergen}</li>
      <li><span class="tbd">[TBD]</span> ${s.shipTBD.replace('[TBD]', '').trim()}</li>`;
    $('#priceNote').hidden = DATA.pricesConfirmed;
  }

  function cards() {
    const s = I18N.s();
    packs.length = 0;
    $('#productGrid').innerHTML = DATA.flavours.map((f, i) => `
      <article class="card" data-id="${f.id}" style="--c-body:${f.colors.body};--c-band:${f.colors.band};--c-strip:${f.colors.strip};--c-ink:${Util.inkFor(f.colors.body)}">
        <div class="card-stage" data-cursor="drag">
          <div class="pack-slot" tabindex="0" role="img" aria-label="${fname(f)} pack. ${s.rotate}"></div>
        </div>
        <div class="card-body">
          <h3><button type="button" class="card-title" data-detail="${f.id}" aria-label="${s.details}: ${fname(f)}">${fname(f)}</button></h3>
          <p class="card-notes">${f.note[I18N.lang]}</p>
          <div class="fmt-toggle" role="group" aria-label="${s.format}: ${fname(f)}">
            ${Object.keys(DATA.formats).map(k => `<button type="button" data-fmt="${k}" aria-pressed="${k === 'pouch'}">${fmtName(k)}</button>`).join('')}
          </div>
          <div class="card-buy">
            <span class="price">${priceHTML(f.price.pouch)}</span>
            <button type="button" class="btn btn-solid magnetic" data-add="${f.id}" data-fmt="pouch">${s.addToCart}</button>
          </div>
        </div>
      </article>`).join('');
    $$('#productGrid .card').forEach((c, i) => {
      const p = createPack(c.querySelector('.pack-slot'), DATA.flavours[i], { ry: -12, idle: false });
      packs.push(p);
      const f = DATA.flavours[i];
      // pouch / tube: swaps the 3D pack, the price and what "Add to cart" adds.
      const setFmt = fmt => {
        c.querySelectorAll('.fmt-toggle button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.fmt === fmt)));
        c.querySelector('.card-buy .price').innerHTML = priceHTML(f.price[fmt]);
        c.querySelector('[data-add]').dataset.fmt = fmt;
        p.setFmt(fmt);
      };
      c.querySelector('.fmt-toggle').addEventListener('click', e => { const b = e.target.closest('[data-fmt]'); if (b) setFmt(b.dataset.fmt); });
      c.addEventListener('pointerenter', () => World.set(f, { duration: .8 }));
      c.addEventListener('focusin', () => World.set(f, { duration: .8 }));
    });
    // phones: the card nearest the middle of the screen sets the colour world
    if (Util.coarse.matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) World.set(byId(e.target.dataset.id), { duration: .8 }); }), { rootMargin: '-45% 0px -45% 0px' });
      $$('#productGrid .card').forEach(c => io.observe(c));
    }
  }

  function bundles() {
    const s = I18N.s(), L = I18N.lang;
    const bg = { tasting: '#285c69', wine: '#5b1a2e', gift: '#e9601c' };
    $('#bundleGrid').innerHTML = DATA.bundles.map(b => {
      const ids = b.contents === 'all' ? DATA.flavours.map(f => f.id) : b.contents;
      const n = ids.length, imgs = ids.map((id, i) => {
        const x = n === 1 ? 50 : 8 + (i / (n - 1)) * 64, r = (i - (n - 1) / 2) * (n > 4 ? 4 : 7);
        return `<img src="${byId(id).img.front}" alt="" style="left:${x}%;transform:rotate(${r}deg);--r2:${r * 1.6}deg;z-index:${i < n / 2 ? i : n - i}">`;
      }).join('');
      return `<article class="bundle" data-bundle="${b.id}">
        <div class="bundle-stage" style="--bd-bg:${bg[b.kind]}">${imgs}</div>
        <div class="bundle-body">
          <h3>${b.name[L]}</h3>
          <p>${b.blurb[L]}</p>
          <p class="small">${s.contents}: ${ids.map(id => fname(byId(id))).join(', ')}</p>
          ${b.giftMessage ? `<div class="gift-msg"><label for="gift-${b.id}">${s.giftMsg}</label><textarea id="gift-${b.id}" maxlength="160" rows="2" placeholder="${s.giftPh}"></textarea><span class="count" id="giftCount">${s.chars(0)}</span></div>` : ''}
          <div class="card-meta"><span class="price">${priceHTML(b.priceCents)}</span><span class="size">${s.bundleOf(n)}</span></div>
          <button type="button" class="btn btn-solid magnetic" data-add-bundle="${b.id}">${s.addToCart}</button>
        </div>
      </article>`;
    }).join('');
    const ta = $('#gift-gift-box');
    if (ta) ta.addEventListener('input', () => ($('#giftCount').textContent = I18N.s().chars(ta.value.length)));
  }

  /* ---- product detail ---- */
  let detailPack = null;
  function detail(id, startFmt = 'pouch') {
    const f = byId(id), s = I18N.s(), info = DATA.productInfo, L = I18N.lang;
    World.set(f, { duration: .6 });
    const pairs = [...DATA.pairings.wine, ...DATA.pairings.cheese].filter(p => p.pick === id);
    const sub = DATA.subscription;
    const subPrice = fmt => Math.round(f.price[fmt] * (1 - sub.discountPercent / 100));
    let fmt = startFmt === 'tube' ? 'tube' : 'pouch';
    $('#productBody').innerHTML = `
      <div class="pd-hero" style="--c-body:${f.colors.body};--c-band:${f.colors.band};--c-ink:${Util.inkFor(f.colors.body)}">
        <div class="pd-packcol">
          <div class="pd-pack" data-cursor="drag"></div>
          <button type="button" class="pd-flip" id="pdFlip" aria-pressed="false">${s.seeBack}</button>
        </div>
        <div>
          <p class="eyebrow">${f.tagline[L]}</p>
          <h2 id="pdTitle">${fname(f)}</h2>
          <p class="note">${f.note[L]}</p>
        </div>
      </div>
      <div class="pd-main">
        <form class="pd-buy" id="pdBuy">
          <div class="opt opt-fmt" role="radiogroup" aria-label="${s.format}">
            ${Object.entries(DATA.formats).map(([k, v]) => `<label><input type="radio" name="fmt" value="${k}"${k === fmt ? ' checked' : ''}><span class="o-t">${v.name[L]}<span class="o-s">${s.fmtSub[k]}</span></span><span class="o-p price">${priceHTML(f.price[k])}</span></label>`).join('')}
          </div>
          <div class="opt" role="radiogroup" aria-label="${s.oneOff} / ${s.subscribe}">
            <label><input type="radio" name="plan" value="once" checked><span class="o-t">${s.oneOff}<span class="o-s">${s.oneOffSub}</span></span></label>
            ${sub.enabled ? `<label><input type="radio" name="plan" value="sub"><span class="o-t">${s.subscribe}<span class="o-s">${s.subscribeSub(sub.discountPercent)}</span></span><span class="o-p" id="pdSubPrice">${money(subPrice(fmt))} ${s.perMonth}</span></label>` : ''}
          </div>
          <div class="pd-buyrow">
            <div class="qty" role="group" aria-label="${s.qty}"><button type="button" data-pdq="-1" aria-label="−1">−</button><output id="pdQty">1</output><button type="button" data-pdq="1" aria-label="+1">+</button></div>
            <button type="submit" class="btn btn-solid magnetic">${s.addToCart}</button>
          </div>
          <p class="small muted" style="margin:0">${s.shipStd(money(DATA.shipping.standardCents))} · ${s.shipFree(money(DATA.shipping.freeFromCents))} · ${s.shipDays(DATA.shipping.deliveryDays)} <span class="tbd">[TBD]</span></p>
        </form>
        <div class="allergen-box" role="note">${f.allergen[L]} ${s.traces}: ${info.traces}</div>
        <div class="pd-sec"><h3>${s.tasting}</h3><p><span class="tbd">[TBD]</span> ${s.tastingTBD} <span class="note">${f.note[L]}</span></p></div>
        ${pairs.length ? `<div class="pd-sec"><h3>${s.pairings}</h3><p>${pairs.map(p => `<strong>${p.name[L]}</strong>: ${p.why[L]}`).join('<br><br>')}</p></div>` : ''}
        <div class="pd-cols">
          <div class="pd-sec"><h3>${s.ingredients}</h3><p>${info.ingredients}</p>
            <h3 style="margin-top:22px">${s.storage}</h3><p>${info.storage}</p>
            <h3 style="margin-top:22px">${s.shelf}</h3><p>${info.shelfLife}</p></div>
          <div class="pd-sec"><h3>${s.nutrition}</h3>
            <table class="nutri"><caption>${s.per100}</caption><tbody>
              ${info.nutrition.map(([k, v]) => `<tr class="${['saturates', 'sugars'].includes(k) ? 'sub' : ''}"><th scope="row">${s.nut[k]}</th><td>${v}</td></tr>`).join('')}
            </tbody></table></div>
        </div>
      </div>`;
    detailPack = createPack($('#productBody .pd-pack'), f, { ry: -18, bob: 8, fmt });
    setTimeout(() => detailPack.spin(1), 350);
    // front / back: both packs have a printed back (the tube turns round as a cylinder)
    const flip = $('#pdFlip');
    const syncFlip = () => { flip.setAttribute('aria-pressed', String(detailPack.back)); flip.textContent = detailPack.back ? s.seeFront : s.seeBack; };
    flip.onclick = () => { detailPack.showBack(!detailPack.back); syncFlip(); };
    syncFlip();
    $$('#pdBuy input[name="fmt"]').forEach(r => r.addEventListener('change', () => {
      fmt = r.value; detailPack.setFmt(fmt); detailPack.showBack(false); syncFlip();
      const sp = $('#pdSubPrice'); if (sp) sp.textContent = `${money(subPrice(fmt))} ${s.perMonth}`;
    }));
    let qty = 1;
    $('#productBody').onclick = e => { const b = e.target.closest('[data-pdq]'); if (b) { qty = Math.max(1, Math.min(99, qty + +b.dataset.pdq)); $('#pdQty').textContent = qty; } };
    $('#pdBuy').onsubmit = e => {
      e.preventDefault();
      const subOn = new FormData(e.target).get('plan') === 'sub';
      Cart.add({ type: 'flavour', id, fmt, qty, sub: subOn });
      Util.close($('#product'));
      setTimeout(() => Cart.open(), 500);
    };
    Util.open($('#product'), { onClose: App.birdHome });
    App.birdTo($('#pdTitle'));
  }

  function bind() {
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-add]');
      if (a) { const card = a.closest('.card'); Cart.add({ type: 'flavour', id: a.dataset.add, fmt: a.dataset.fmt }, card ? card.querySelector('.card-stage') : null); }
      const d = e.target.closest('[data-detail]'); if (d) detail(d.dataset.detail);
      const b = e.target.closest('[data-add-bundle]');
      if (b) {
        const id = b.dataset.addBundle, ta = $('#gift-' + id), msg = ta ? ta.value.trim() : '';
        Cart.add({ type: 'bundle', id, msg }, b.closest('.bundle').querySelector('.bundle-stage'));
        if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input')); }
      }
    });
    // a click on a pack (not a drag) opens the details
    $('#productGrid').addEventListener('click', e => {
      const st = e.target.closest('.card-stage'); if (!st) return;
      const slot = st.querySelector('.pack-slot'); if (slot.dataset.dragged) return;
      const card = st.closest('.card');
      detail(card.dataset.id, card.querySelector('[data-add]').dataset.fmt);
    });
    $('#cartBtn').addEventListener('click', () => Cart.open());
  }

  function render() { shipFacts(); cards(); bundles(); Cart.render(); }
  function init() { render(); bind(); }
  return { init, render, detail };
})();
