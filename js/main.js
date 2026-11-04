// Бэсти: меню, сертификат на обложке (перетаскивается), папки прайса, видео без звука рядом с экраном
(function () {
  // меню
  const burgers = document.querySelectorAll('.nav__burger');
  const mob = document.getElementById('mob-menu');
  const setMenu = (open) => { mob.hidden = !open; burgers.forEach((b) => { b.setAttribute('aria-expanded', String(open)); b.lastChild.textContent = open ? 'Закрыть' : 'Меню'; }); };
  document.addEventListener('click', (e) => { if (!mob.hidden && !e.target.closest('#mob-menu, .nav__burger')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mob.hidden) setMenu(false); });
  burgers.forEach((b) => b.addEventListener('click', () => setMenu(mob.hidden)));
  mob.addEventListener('click', (e) => { if (e.target.closest('a, [data-close]')) setMenu(false); });

  // купон на обложке: перетаскивается в пределах обложки.
  // Только мышью на компьютере; на телефоне купон стоит на месте (иначе мешало бы листать страницу).
  const cert = document.querySelector('.cert');
  if (cert) {
    const box = cert.closest('.vb');
    // телефон: купон всплывает и закрывается крестиком; закрытый не показываем до конца сеанса
    const KEY = 'besti-kupon-closed';
    try { if (sessionStorage.getItem(KEY) && innerWidth <= 900) cert.hidden = true; } catch (e) {}
    cert.querySelector('.kp__close').addEventListener('click', () => {
      cert.classList.add('is-closing');
      setTimeout(() => { cert.hidden = true; }, 220);
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    });
    const clamp = (v, max) => Math.max(0, Math.min(v, max));
    const place = (x, y) => {
      cert.style.left = clamp(x, box.clientWidth - cert.offsetWidth) + 'px';
      cert.style.top = clamp(y, box.clientHeight - cert.offsetHeight) + 'px';
    };
    const float = () => {
      if (cert.classList.contains('is-float')) return;
      const b = box.getBoundingClientRect(), r = cert.getBoundingClientRect();
      const keep = document.createElement('div'); // держит место, чтобы заголовок не прыгнул
      keep.style.height = (cert.offsetHeight + parseFloat(getComputedStyle(cert).marginBottom)) + 'px';
      cert.before(keep); box.appendChild(cert); cert.classList.add('is-float');
      place(r.left - b.left, r.top - b.top);
    };
    let dx = 0, dy = 0;
    cert.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button, a')) return;
      if (innerWidth <= 900 || e.pointerType !== 'mouse') return; // на телефоне и планшете купон не перетаскивается
      float();
      dx = e.clientX - cert.offsetLeft; dy = e.clientY - cert.offsetTop;
      cert.classList.add('is-drag'); cert.setPointerCapture(e.pointerId); e.preventDefault();
    });
    cert.addEventListener('pointermove', (e) => { if (cert.classList.contains('is-drag')) place(e.clientX - dx, e.clientY - dy); });
    const drop = () => cert.classList.remove('is-drag');
    cert.addEventListener('pointerup', drop); cert.addEventListener('pointercancel', drop);
    window.addEventListener('resize', () => { if (cert.classList.contains('is-float')) place(cert.offsetLeft, cert.offsetTop); });
  }

  // «В гостях у бэсти»: слова съезжаются к фото по мере прокрутки заставки
  const gi = document.querySelector('.gintro');
  if (gi && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const st = gi.querySelector('.gintro__stick');
    let ticking = false;
    const upd = () => {
      ticking = false;
      const run = gi.offsetHeight - st.offsetHeight;
      const top = gi.getBoundingClientRect().top - parseFloat(getComputedStyle(st).top);
      const p = Math.max(0, Math.min(1, -top / (run * 0.65)));
      gi.style.setProperty('--p', p.toFixed(3));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }

  // «Руки после бэсти»: веер карточек как в первой версии — кнопки, свайп, средняя открывается на весь экран
  const pile = document.querySelector('.pile');
  if (pile) {
    const cards = [...pile.querySelectorAll('.pc')], total = cards.length, jit = [-7, 5, -4, 8, -6, 4, -8, 6];
    const num = document.querySelector('.pile__n b'), lb = document.querySelector('.lb');
    let cur = 0, swiped = false, sw = null;
    const step = () => (innerWidth <= 900 ? 120 : 205);
    const draw = () => {
      cards.forEach((c, i) => {
        let d = ((i - cur) % total + total) % total;
        if (d > total / 2) d -= total;
        const a = Math.abs(d);
        c.style.transform = 'translateX(' + d * step() + 'px) translateY(' + a * 16 + 'px) rotate(' + (d === 0 ? 0 : jit[i % 8]) + 'deg) scale(' + (1 - Math.min(a, 3) * 0.08).toFixed(2) + ')';
        c.style.zIndex = 20 - a; c.style.opacity = a > 2 ? 0 : 1; c.style.pointerEvents = a > 2 ? 'none' : 'auto';
        c.style.boxShadow = d === 0 ? '8px 10px 0 rgba(43, 26, 23, .3)' : '4px 6px 0 rgba(43, 26, 23, .18)';
        c.classList.toggle('is-cur', d === 0);
        c.setAttribute('aria-label', c.querySelector('img').alt + (d === 0 ? ' — открыть на весь экран' : ' — показать'));
      });
      num.textContent = cur + 1;
    };
    const go = (d) => { cur = (cur + d + total) % total; draw(); };
    document.querySelectorAll('.pile__btn').forEach((b) => b.addEventListener('click', () => go(+b.dataset.d)));
    cards.forEach((c, i) => c.addEventListener('click', () => {
      if (swiped) return;
      if (i !== cur) { cur = i; draw(); return; }
      openLb(c);
    }));
    // открытие как в первой версии (FLIP): фото вырастает из карточки, закрывается обратно в неё
    const card = lb.querySelector('.lb__card');
    let from = null, closing = false;
    const fromTf = (r) => {
      const W = card.offsetWidth;
      return 'translate(-50%, -50%) translate(' + Math.round(r.left + r.width / 2 - innerWidth / 2) + 'px, ' + Math.round(r.top + r.height / 2 - innerHeight / 2) + 'px) scale(' + Math.max(0.05, r.width / W).toFixed(3) + ')';
    };
    const openLb = (c) => {
      const img = c.querySelector('img');
      card.querySelector('img').src = img.src; card.querySelector('img').alt = img.alt;
      card.querySelector('figcaption').textContent = c.querySelector('.pc__cap span').textContent;
      from = c; lb.hidden = false; document.documentElement.style.overflow = 'hidden';
      card.style.transition = 'none'; card.style.transform = fromTf(c.getBoundingClientRect());
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.transition = ''; card.style.transform = 'translate(-50%, -50%) rotate(-1.2deg)'; lb.classList.add('is-open');
      }));
      lb.querySelector('.lb__close').focus({ preventScroll: true });
    };
    const closeLb = () => {
      if (lb.hidden || closing) return;
      closing = true; lb.classList.remove('is-open');
      if (from) card.style.transform = fromTf(from.getBoundingClientRect());
      setTimeout(() => { lb.hidden = true; closing = false; document.documentElement.style.overflow = ''; }, 560);
    };
    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
    pile.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY }; });
    pile.addEventListener('pointercancel', () => { sw = null; });
    pile.addEventListener('pointerup', (e) => {
      const s0 = sw; sw = null; if (!s0) return;
      const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      swiped = true; setTimeout(() => { swiped = false; }, 350); go(dx < 0 ? 1 : -1);
    });
    addEventListener('resize', draw); draw();
  }

  // отзывы: «ещё» раскрывает длинный текст
  document.querySelectorAll('.rvm').forEach((r) => {
    const t = r.querySelector('.rvm__t'), more = r.querySelector('.rvm__more');
    if (!more) return;
    const chk = () => { if (t.scrollHeight > t.clientHeight + 4) more.hidden = false; };
    chk(); new ResizeObserver(chk).observe(t);
    more.addEventListener('click', () => { const o = r.classList.toggle('is-open'); more.textContent = o ? 'свернуть' : 'ещё'; });
  });

  // отзывы, вариант B — листание стрелками; вариант C — переключение по аватарам
  document.querySelectorAll('.rvb__nav .pile__btn').forEach((b) => b.addEventListener('click', () => {
    const row = b.closest('.rvx').querySelector('.rvb__row'), card = row.querySelector('.rvb');
    row.scrollBy({ left: +b.dataset.d * (card.offsetWidth + 28), behavior: 'smooth' });
  }));
  document.querySelectorAll('.rvx--c').forEach((c) => {
    const tabs = c.querySelectorAll('.rvc__tab'), panes = c.querySelectorAll('.rvc__pane');
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
      panes.forEach((p) => { p.hidden = p.dataset.i !== t.dataset.i; });
    }));
  });

  // клавиша G — показать сетку из 12 колонок поверх страницы (проверка силовых линий)
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'g' && e.key.toLowerCase() !== 'п' || e.target.closest('input, textarea')) return;
    let g = document.getElementById('grid-overlay');
    if (g) { g.remove(); return; }
    g = document.createElement('div'); g.id = 'grid-overlay';
    g.style.cssText = 'position:fixed;inset:0 16px;z-index:999;pointer-events:none;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:8px';
    for (let i = 0; i < 12; i++) { const c = document.createElement('i'); c.style.cssText = 'background:rgba(255,172,228,.18);border-left:1px solid rgba(133,35,26,.35);border-right:1px solid rgba(133,35,26,.35)'; g.appendChild(c); }
    document.body.appendChild(g);
  });

  // папки прайса
  const cats = window.BESTI_PRICES;
  const tabs = document.querySelector('.tabs');
  const panel = document.querySelector('.panel');
  const list = panel.querySelector('.plist');
  const det = panel.querySelector('.pdetail');
  let ci = 0, ri = 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  cats.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + c.id;
    b.setAttribute('aria-controls', 'price-panel'); b.style.background = c.bg; b.style.setProperty('--c', c.bg);
    b.innerHTML = '<span class="tab__fold"><img src="' + c.icon + '" alt=""></span><span><i>(0' + (i + 1) + ')</i>' + esc(c.title) + '</span>';
    b.addEventListener('click', () => { ci = i; ri = 0; render(); });
    tabs.appendChild(b);
  });

  function render() {
    const cur = cats[ci], s = cur.rows[ri];
    [...tabs.children].forEach((b, i) => b.setAttribute('aria-selected', String(i === ci)));
    panel.style.background = cur.bg;
    panel.setAttribute('aria-labelledby', 'tab-' + cur.id);
    list.innerHTML = cur.rows.map((r, i) =>
      '<li><button type="button" class="prow" data-i="' + i + '" aria-pressed="' + (i === ri) + '">' +
      '<span><span class="prow__mark" aria-hidden="true">▸</span>' + esc(r.n) + '</span><span class="prow__price">' + esc(r.p) + '</span></button></li>').join('');
    const parts = s.c ? s.c.split(' · ') : [];
    det.innerHTML =
      '<p class="label">(0' + (ci + 1) + ') ' + esc(cur.title) + '</p>' +
      '<h3>' + esc(s.n) + '</h3>' +
      '<div class="pdetail__meta"><span class="pdetail__price">' + esc(s.p) + '</span><span class="pdetail__time">' + esc(s.t) + '</span></div>' +
      (parts.length ? '<p class="label" style="margin-top:22px">Что входит</p><ul class="pdetail__parts">' + parts.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      '<a class="btn" href="https://n2379744.yclients.com/" target="_blank" rel="noopener">Записаться онлайн</a>';
  }
  list.addEventListener('click', (e) => { const b = e.target.closest('.prow'); if (b) { ri = +b.dataset.i; render(); } });
  render();

  // видео: без звука, играют только рядом с экраном
  const vids = document.querySelectorAll('video');
  const play = (v) => { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting ? play(en.target) : en.target.pause()), { rootMargin: '200px 0px' });
    vids.forEach((v) => io.observe(v));
  } else vids.forEach(play);
})();
