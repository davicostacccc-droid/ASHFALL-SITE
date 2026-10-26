import { CATEGORIES, UPDATE_FILTERS, STATUS, ACCENTS, escapeHtml as esc, publicItems, publicUpdates, formatDate, safeMediaPath, updateMedia } from './content-model.mjs';

let allUpdates = [];
let activeCategory = 'jogo';
const byId = id => document.getElementById(id);

function renderUpdates() {
  const updates = publicUpdates(allUpdates, activeCategory);
  byId('updatesList').innerHTML = updates.length ? updates.map(item => {
    const media = updateMedia(item);
    const status = item.category === 'site' ? 'SITE PUBLICADO' : STATUS[item.status] || STATUS.integrado;
    return `<article class="update-card ${media.length ? 'has-media' : ''}" id="atualizacao-${esc(item.id)}">
      <div class="update-meta">
        <time class="update-date" datetime="${esc(item.date)}">${esc(formatDate(item.date))}</time>
        <span class="status-pill ${item.status === 'avaliacao' ? 'status-review' : 'status-live'}">${esc(status)}</span>
        <span class="update-category">${esc(CATEGORIES[item.category])}</span>
      </div>
      <div class="update-copy">
        <h3><a href="#atualizacao-${esc(item.id)}">${esc(item.title)}</a></h3>
        <p>${esc(item.summary)}</p>
        <details class="update-details-toggle"><summary>O que mudou · ${item.highlights.length} pontos</summary><ul class="update-details">${item.highlights.map(value => `<li>${esc(value)}</li>`).join('')}</ul></details>
      </div>
      ${media.length ? `<div class="update-media-list">${media.map((image, index) => `<figure class="update-media"><button class="update-media-trigger" type="button" data-update-media="${esc(item.id)}" data-media-index="${index}" aria-label="Ampliar captura: ${esc(image.alt)}"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy" decoding="async" width="1920" height="1080" /><span class="capture-tag">${item.status === 'avaliacao' ? 'EM AVALIAÇÃO' : 'CAPTURA REAL DA ALPHA'}</span><span class="capture-expand" aria-hidden="true">↗</span></button><figcaption>${esc(image.caption)} <span>Toque ou clique para ampliar.</span></figcaption></figure>`).join('')}</div>` : ''}
    </article>`;
  }).join('') : '<p class="empty-state">Ainda não há notas neste filtro. Escolha “Tudo” para ver todas as atualizações.</p>';
  const count = updates.length;
  byId('filterResult').textContent = `${count} ${count === 1 ? 'atualização' : 'atualizações'} · ${UPDATE_FILTERS[activeCategory] || CATEGORIES[activeCategory] || 'Tudo'}`;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === activeCategory;
    const count = publicUpdates(allUpdates, button.dataset.filter).length;
    button.innerHTML = `${esc(UPDATE_FILTERS[button.dataset.filter] || CATEGORIES[button.dataset.filter] || 'Tudo')} <span class="filter-count">${count}</span>`;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function renderGame(game) {
  byId('currentSummary').textContent = game.summary;
  byId('snapshotDate').textContent = formatDate(game.asOf);
  byId('snapshotDate').dateTime = game.asOf;
  const cards = [
    {label:'JÁ NA ALPHA', title:'O que já funciona', cls:'status-live', items:game.available},
    {label:'EM AVALIAÇÃO', title:'O que estamos lapidando', cls:'status-review', items:game.review, note:'São propostas prontas para avaliação. Ainda não fazem parte da versão principal do jogo.'},
    {label:'PRÓXIMOS PASSOS', title:'O que vem depois', cls:'status-next', items:game.next, note:'Esta é a direção planejada. Ainda não há datas de entrega.'}
  ];
  byId('gameState').innerHTML = cards.map(card => `<article class="state-card"><span class="status-pill ${card.cls}">${card.label}</span><h3>${card.title}</h3><ul>${card.items.map(text => `<li>${esc(text)}</li>`).join('')}</ul>${card.note ? `<p class="section-note">${esc(card.note)}</p>` : ''}</article>`).join('');
}

function renderOrigins(origins) {
  const tabs = byId('originTabs');
  tabs.innerHTML = origins.map((origin, i) => `<button class="origin-tab accent-${ACCENTS.has(origin.accent) ? origin.accent : 'ember'}" role="tab" id="origem-${esc(origin.id)}" aria-controls="originPanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" type="button" data-origin="${i}"><span class="origin-tab-symbol" aria-hidden="true">${esc(origin.symbol)}</span><span>${esc(origin.name)}</span><small>JOGÁVEL</small></button>`).join('');
  const buttons = [...tabs.querySelectorAll('[data-origin]')];
  function select(index, focus = false) {
    const origin = origins[index];
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    const panel = byId('originPanel');
    panel.className = `origin-panel accent-${ACCENTS.has(origin.accent) ? origin.accent : 'ember'}`;
    panel.setAttribute('aria-labelledby', buttons[index].id);
    panel.innerHTML = `<div class="origin-insignia" aria-hidden="true"><span>${esc(origin.symbol)}</span><small>ORIGEM ${String(index + 1).padStart(2, '0')} / 05</small></div><div class="origin-copy"><span class="small-label">${esc(origin.role)}</span><h3>${esc(origin.name)}</h3><p>${esc(origin.description)}</p><dl class="origin-facts"><div><dt>ARMA INICIAL</dt><dd>${esc(origin.weapon)}</dd></div><div><dt>NA ALPHA</dt><dd>${esc(origin.mechanic)}</dd></div></dl></div>`;
    if (focus) buttons[index].focus();
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      const selected = {ArrowRight:(index + 1) % buttons.length, ArrowLeft:(index - 1 + buttons.length) % buttons.length, Home:0, End:buttons.length - 1}[event.key];
      if (selected === undefined) return;
      event.preventDefault();
      select(selected, true);
    });
  });
  select(0);
}

function renderRoadmap(items) {
  byId('roadmapList').innerHTML = items.map((item, i) => `<li><span class="milestone-index">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div><span class="status-pill ${item.state === 'planejado' ? 'status-next' : item.state === 'avaliacao' ? 'status-review' : 'status-live'}">${esc(item.label)}</span></li>`).join('');
}

function openMedia(media, caption) {
  if (!safeMediaPath(media.src)) return;
  byId('dialogImage').src = media.src;
  byId('dialogImage').alt = media.alt;
  byId('dialogCaption').textContent = caption;
  const originalLink = byId('originalImageLink');
  if (originalLink) {
    originalLink.href = media.src;
    originalLink.hidden = false;
  }
  byId('galleryDialog').showModal();
}

function renderGallery(items) {
  const target = byId('galleryGrid');
  const safeItems = publicItems(items).filter(item => safeMediaPath(item.src));
  target.innerHTML = safeItems.length ? safeItems.map(item => `<button class="gallery-item" type="button" data-gallery="${esc(item.id)}" aria-label="Ampliar arte conceitual: ${esc(item.title)}"><img src="${esc(item.src)}" alt="${esc(item.alt)}" loading="lazy" width="1350" height="760" /><span class="gallery-type">${esc(item.type)}</span><span class="gallery-label"><strong>${esc(item.title)}</strong><small>${esc(item.subtitle)}</small></span><span class="gallery-expand" aria-hidden="true">↗</span></button>`).join('') : '<p class="empty-state">A galeria está sendo preparada.</p>';
  target.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    const item = safeItems.find(x => x.id === button.dataset.gallery);
    openMedia(item, `${item.title} — arte conceitual, não gameplay`);
  }));
}

function revealHashTarget() {
  const id = window.location.hash.slice(1);
  const update = allUpdates.find(item => `atualizacao-${item.id}` === id);
  if (update && !publicUpdates(allUpdates, activeCategory).some(item => item.id === update.id)) {
    activeCategory = update.category === 'site' ? 'site' : 'jogo';
    renderUpdates();
  }
  const target = byId(id);
  if (!target) return;
  let disclosure = target.closest('details');
  while (disclosure) {
    disclosure.open = true;
    disclosure = disclosure.parentElement?.closest('details');
  }
  requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
}

async function initData() {
  try {
    const response = await fetch('data/content.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    allUpdates = publicItems(data.updates);
    renderUpdates();
    renderGame(data.game);
    renderOrigins(data.origins);
    renderRoadmap(data.roadmap);
    renderGallery(data.gallery);
    revealHashTarget();
  } catch (error) {
    console.error('Não foi possível carregar o conteúdo:', error);
    const message = '<p class="empty-state">Não foi possível carregar esta seção. Recarregue a página para tentar novamente.</p>';
    ['updatesList', 'galleryGrid', 'gameState', 'originPanel'].forEach(id => { byId(id).innerHTML = message; });
    byId('filterResult').textContent = 'Conteúdo indisponível no momento.';
  }
}

function init() {
  if (!document.querySelector('[data-filter="jogo"]')) activeCategory = 'todos';
  byId('year').textContent = new Date().getFullYear();
  const menu = byId('menuButton');
  const nav = byId('mainNavigation');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const opening = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', opening);
    menu.setAttribute('aria-expanded', String(opening));
    menu.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    renderUpdates();
  }));
  byId('updatesList').addEventListener('click', event => {
    const button = event.target.closest('[data-update-media]');
    if (!button) return;
    const update = allUpdates.find(item => item.id === button.dataset.updateMedia);
    const media = updateMedia(update)[Number(button.dataset.mediaIndex)];
    if (media) openMedia(media, media.caption);
  });
  document.querySelectorAll('[data-static-media]').forEach(button => button.addEventListener('click', () => {
    openMedia({src:button.dataset.staticMedia, alt:button.querySelector('img').alt}, button.dataset.caption);
  }));
  window.addEventListener('hashchange', revealHashTarget);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const section = entries.find(entry => entry.isIntersecting);
      if (!section) return;
      nav.querySelectorAll('a').forEach(link => {
        if (link.hash === `#${section.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-15% 0px -60% 0px'});
    ['agora', 'changelog', 'sobre'].forEach(id => {
      const section = byId(id);
      if (section) observer.observe(section);
    });
  }
  const dialog = byId('galleryDialog');
  byId('closeDialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    byId('dialogImage').removeAttribute('src');
    const originalLink = byId('originalImageLink');
    if (originalLink) {
      originalLink.removeAttribute('href');
      originalLink.hidden = true;
    }
  });
  initData();
}

document.addEventListener('DOMContentLoaded', init);
