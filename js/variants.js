// Панель «Варианты» (служебная, без оформления сайта): переключает варианты блоков прямо на странице.
// Блок с вариантами: <div data-variant-group="hero" data-group-label="Обложка"> внутри — <section data-variant="A" data-label="A · …">.
// Выбор запоминается в браузере и открывается ссылкой ?hero=B. Убрать панель перед сдачей: удалить этот скрипт и лишние варианты.
(function () {
  const groups = [...document.querySelectorAll('[data-variant-group]')];
  if (!groups.length) return;
  const params = new URLSearchParams(location.search);
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  const css = document.createElement('style');
  css.textContent = `
    [data-variant][hidden] { display: none !important; }
    .vsw { position: fixed; right: 16px; top: 76px; z-index: 100; width: max-content; max-width: calc(100vw - 32px); background: #FFFFFF; color: #222; border: 1px solid #CCC; font: 13px/1.3 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
    .vsw__bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 6px 8px 6px 10px; border-bottom: 1px solid #E5E5E5; color: #666; font-size: 12px; }
    .vsw__bar button { padding: 2px 6px; background: none; border: 0; color: #666; font: inherit; cursor: pointer; }
    .vsw__body { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }
    .vsw__body[hidden] { display: none; }
    .vsw__row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .vsw__name { min-width: 72px; color: #666; }
    .vsw__btn { padding: 4px 10px; background: #FFFFFF; color: #222; border: 1px solid #CCC; font: inherit; cursor: pointer; }
    .vsw__btn:hover { border-color: #888; }
    .vsw__btn[aria-pressed="true"] { background: #222; color: #FFFFFF; border-color: #222; }
    .vsw__hint { margin: 0; font-size: 11px; color: #999; }`;
  document.head.appendChild(css);

  const panel = document.createElement('aside');
  panel.className = 'vsw'; panel.setAttribute('aria-label', 'Переключатель вариантов');
  panel.innerHTML = '<div class="vsw__bar"><span>Варианты</span><button type="button" aria-expanded="true" aria-label="Свернуть">свернуть</button></div><div class="vsw__body"></div>';
  const body = panel.querySelector('.vsw__body');
  const toggle = panel.querySelector('.vsw__bar button');
  toggle.addEventListener('click', () => { const open = body.hidden; body.hidden = !open; toggle.textContent = open ? 'свернуть' : 'развернуть'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Свернуть' : 'Развернуть'); });

  groups.forEach((g) => {
    const key = g.dataset.variantGroup;
    const items = [...g.querySelectorAll(':scope > [data-variant]')];
    const row = document.createElement('div'); row.className = 'vsw__row';
    row.innerHTML = '<span class="vsw__name">' + (g.dataset.groupLabel || key) + '</span>';
    const btns = items.map((el) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'vsw__btn';
      b.textContent = el.dataset.label || el.dataset.variant; b.title = el.dataset.label || '';
      b.addEventListener('click', () => show(el.dataset.variant, true));
      row.appendChild(b); return b;
    });
    body.appendChild(row);
    function show(id, remember) {
      items.forEach((el, i) => {
        const on = el.dataset.variant === id;
        el.hidden = !on; btns[i].setAttribute('aria-pressed', String(on));
        if (!on) el.querySelectorAll('video').forEach((v) => v.pause());
      });
      if (remember) {
        store.set('besti-var-' + key, id);
        params.set(key, id); history.replaceState(null, '', location.pathname + '?' + params.toString() + location.hash);
      }
    }
    const want = params.get(key) || store.get('besti-var-' + key);
    show(items.some((el) => el.dataset.variant === want) ? want : items[0].dataset.variant, false);
  });
  const hint = document.createElement('p'); hint.className = 'vsw__hint'; hint.textContent = 'Выбор сохраняется · ссылка с выбором — в адресной строке';
  body.appendChild(hint);
  document.body.appendChild(panel);
})();
