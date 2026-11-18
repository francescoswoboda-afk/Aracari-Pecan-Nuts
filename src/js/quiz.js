/* Flavour finder: four questions; the eight packs react live to every answer
   (matches grow, the rest fade), then the winner is shown as a 3D pack with
   Add to cart. Questions and scoring live in DATA.quiz (data.js). */
const Quiz = (() => {
  const { $, $$ } = Util;
  const T = {
    en: { of: (a, b) => `Question ${a} of ${b}`, back: 'Back', again: 'Start over', yours: 'Your flavour', also: 'Also try', done: 'All done', notYou: 'Not quite you?', notYouP: 'Try the runner-up, or start again.' },
    nl: { of: (a, b) => `Vraag ${a} van ${b}`, back: 'Terug', again: 'Opnieuw', yours: 'Jouw smaak', also: 'Probeer ook', done: 'Klaar', notYou: 'Niet helemaal jij?', notYouP: 'Probeer de nummer twee, of begin opnieuw.' },
  };
  const t = () => T[I18N.lang] || T.en;
  const Q = () => DATA.quiz.questions;
  let step = 0, answers = [], shown = null, pack = null;

  function scores() {
    const s = {}; DATA.flavours.forEach(f => (s[f.id] = 0));
    answers.forEach((a, i) => { if (a != null) Object.entries(Q()[i].options[a].pts).forEach(([id, p]) => (s[id] += p)); });
    return DATA.flavours.map(f => ({ f, p: s[f.id] })).sort((a, b) => b.p - a.p);   // ties keep data order
  }

  /* ---- the pack grid on the right ---- */
  function buildGrid() {
    $('#quizGrid').innerHTML = DATA.flavours.map(f => `
      <div class="qg-item" data-id="${f.id}" style="--qg-body:${f.colors.body}">
        <img src="${f.img.front}" alt="" draggable="false"><span>${fname(f)}</span>
      </div>`).join('');
  }
  function updateGrid() {
    const res = scores(), max = res[0].p;
    $$('#quizGrid .qg-item').forEach(el => {
      const r = res.find(x => x.f.id === el.dataset.id), k = max ? r.p / max : 1;
      el.style.setProperty('--k', k.toFixed(2));
      el.classList.toggle('lead', !!max && r === res[0]);
    });
    $('#quizGrid').classList.toggle('scored', !!max);
  }

  /* ---- the card on the left ---- */
  function renderCard(dir = 1) {
    const card = $('#quizCard'), L = I18N.lang, s = t();
    let html;
    if (!shown) {
      const q = Q()[step];
      html = `<p class="quiz-step">${s.of(step + 1, Q().length)}</p>
        <div class="quiz-dots" aria-hidden="true">${Q().map((_, i) => `<span class="${i < step ? 'done' : i === step ? 'now' : ''}"></span>`).join('')}</div>
        <h3 class="quiz-q">${q.q[L]}</h3>
        <div class="quiz-opts">${q.options.map((o, i) => `<button type="button" class="quiz-opt" data-a="${i}" aria-pressed="${answers[step] === i}">${o.t[L]}</button>`).join('')}</div>
        ${step > 0 ? `<button type="button" class="quiz-link" data-quiz="back">← ${s.back}</button>` : ''}`;
    } else {
      const res = scores(), other = res.find(r => r.f.id !== shown.id);
      html = `<p class="quiz-step">${s.done}</p>
        <h3 class="quiz-q">${s.notYou}</h3>
        <p class="quiz-you">${s.notYouP}</p>
        <div class="quiz-row">
          <button type="button" class="quiz-chip" data-quiz="alt" data-id="${other.f.id}" style="--qc:${other.f.colors.body}">${s.also}: ${fname(other.f)}</button>
          <button type="button" class="quiz-link" data-quiz="again">↺ ${s.again}</button>
        </div>`;
    }
    if (window.gsap && !Util.reduced.matches && card.children.length) {
      gsap.to(card, { x: -20 * dir, opacity: 0, duration: .16, ease: 'power2.in', onComplete: () => { card.innerHTML = html; gsap.fromTo(card, { x: 20 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'expo.out' }); } });
    } else card.innerHTML = html;
  }

  /* ---- the result on the right ---- */
  function showResult(f, first) {
    shown = f;
    const s = t(), L = I18N.lang, stage = $('#quizStage'), box = $('#quizResult');
    World.set(f, { duration: 1 });
    box.style.setProperty('--r-body', f.colors.body); box.style.setProperty('--r-band', f.colors.band); box.style.setProperty('--r-ink', Util.inkFor(f.colors.body));
    box.innerHTML = `<div class="qr-pack"></div>
      <div class="qr-copy">
        <p class="qr-eyebrow">${s.yours}</p>
        <h3>${fname(f)}</h3>
        <p class="qr-notes">${f.note[L]}</p>
        <p class="qr-why">${DATA.quiz.you[f.id][L]}</p>
        <div class="qr-buy"><span class="price">${Util.priceHTML(f.price.pouch)}</span><span class="size">${fmtName('pouch')}</span></div>
        <div class="qr-actions"><button type="button" class="btn btn-solid magnetic" data-add="${f.id}">${I18N.s().addToCart}</button><button type="button" class="btn btn-line" data-detail="${f.id}">${I18N.s().details}</button></div>
      </div>`;
    pack = createPack(box.querySelector('.qr-pack'), f, { ry: -16, bob: 8 });
    stage.classList.add('done');
    if (window.gsap && !Util.reduced.matches) {
      gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: .5, delay: first ? .35 : 0 });
      gsap.from(box.querySelector('.qr-pack'), { y: 60, scale: .6, rotate: -10, duration: 1.1, ease: 'back.out(1.6)', delay: first ? .4 : .05 });
      gsap.from(box.querySelectorAll('.qr-copy > *'), { y: 18, opacity: 0, duration: .7, ease: 'expo.out', stagger: .06, delay: first ? .55 : .15 });
      setTimeout(() => pack && pack.spin(1), first ? 900 : 300);
    }
    if (first) { Bird.happy(1200); }
    renderCard(1);
    // phones: the result sits below the questions, so bring it into view
    if (matchMedia('(max-width: 820px)').matches) setTimeout(() => stage.scrollIntoView({ behavior: Util.reduced.matches ? 'auto' : 'smooth', block: 'center' }), first ? 300 : 0);
  }

  function answer(i) {
    answers[step] = i;
    updateGrid();
    if (step < Q().length - 1) { step++; renderCard(1); }
    else setTimeout(() => showResult(scores()[0].f, true), Util.reduced.matches ? 0 : 450);   // let the grid settle first
  }
  function reset() {
    step = 0; answers = []; shown = null; pack = null;
    $('#quizStage').classList.remove('done'); $('#quizResult').innerHTML = '';
    updateGrid(); renderCard(-1);
  }

  function init() {
    buildGrid(); updateGrid(); renderCard();
    $('#quizCard').addEventListener('click', e => {
      const o = e.target.closest('[data-a]'), q = e.target.closest('[data-quiz]');
      if (o) answer(+o.dataset.a);
      if (!q) return;
      if (q.dataset.quiz === 'back' && step > 0) { step--; answers.length = step; updateGrid(); renderCard(-1); }
      if (q.dataset.quiz === 'again') reset();
      if (q.dataset.quiz === 'alt') showResult(byId(q.dataset.id), false);
    });
  }
  function rerender() { buildGrid(); updateGrid(); if (shown) showResult(shown, false); else renderCard(0); }
  return { init, rerender };
})();
