import { CATEGORIES, STATUS, ACCENTS, escapeHtml as esc, publicItems, publicUpdates, formatDate, safeMediaPath, updateMedia } from './content-model.mjs';

let allUpdates = [];
let activeCategory = 'todos';
const byId = id => document.getElementById(id);

function renderUpdates() {
  const updates = publicUpdates(allUpdates, activeCategory);
  byId('updatesList').innerHTML = updates.length ? updates.map(item => `
    <article class="update-card" id="atualizacao-${esc(item.id)}">
      <div class="update-meta">
        <span class="update-version">${esc(item.version)}</span>
        <time class="update-date" datetime="${esc(item.date)}">${esc(formatDate(item.date))}</time>
        <span class="status-pill ${item.status === 'avaliacao' ? 'status-review' : 'status-live'}">${item.category === 'site' ? 'PUBLICADO' : esc(STATUS[item.status] || STATUS.integrado)}</span>
      </div>
      <div class="update-body">
        <div class="update-category">${esc(CATEGORIES[item.category])}</div>
        <h3><a href="#atualizacao-${esc(item.id)}">${esc(item.title)}</a></h3>
        <p>${esc(item.summary)}</p>
        <ul class="update-details">${(item.highlights || []).map(value => `<li>${esc(value)}</li>`).join('')}</ul>
        <div class="update-media-list">${updateMedia(item).map((media, index) => `<figure class="update-media"><button class="update-media-trigger" type="button" data-update-media="${esc(item.id)}" data-media-index="${index}" aria-label="Ampliar captura: ${esc(media.alt)}"><img src="${esc(media.src)}" alt="${esc(media.alt)}" loading="lazy" decoding="async" width="1920" height="1080" /><span class="capture-tag">${item.status === 'avaliacao' ? 'EM AVALIAÇÃO' : 'CAPTURA REAL DA ALPHA'}</span><span class="capture-expand" aria-hidden="true">↗</span></button><figcaption>${esc(media.caption)} <span>Toque ou clique para ampliar.</span></figcaption></figure>`).join('')}</div>
      </div>
      <span class="update-arrow" aria-hidden="true">↗</span>
    </article>`).join('') : '<p class="empty-state">Ainda não há novidades nesta categoria. Escolha outro filtro para continuar explorando.</p>';
  const count = updates.length;
  byId('filterResult').textContent = `${count} ${count === 1 ? 'atualização' : 'atualizações'} · ${activeCategory === 'todos' ? 'todas as categorias' : CATEGORIES[activeCategory].toLocaleLowerCase('pt-BR')}`;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const count = publicUpdates(allUpdates, button.dataset.filter).length;
    button.innerHTML = `${esc(button.dataset.filter === 'todos' ? 'TODOS' : CATEGORIES[button.dataset.filter])} <span class="filter-count">${count}</span>`;
  });
}

function renderGame(game) {
  byId('currentSummary').textContent = game.summary;
  byId('snapshotDate').textContent = formatDate(game.asOf);
  byId('snapshotDate').dateTime = game.asOf;
  const cards = [
    {label:'NA ALPHA', title:'A fundação está de pé.', cls:'status-live', items:game.available},
    {label:'EM AVALIAÇÃO', title:'Mais peso em cada escolha.', cls:'status-review', items:game.review, note:game.focus},
    {label:'PRÓXIMOS PASSOS', title:'A praga ainda vai crescer.', cls:'status-next', items:game.next}
  ];
  byId('gameState').innerHTML = cards.map((card, i) => `<article class="state-card"><div class="state-card-top"><span class="status-pill ${card.cls}">${card.label}</span><span class="state-index" aria-hidden="true">0${i + 1}</span></div><h3>${card.title}</h3><ul>${card.items.map(text => `<li>${esc(text)}</li>`).join('')}</ul>${card.note ? `<p class="state-note">${esc(card.note)}</p>` : ''}</article>`).join('');
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
  byId('roadmapList').innerHTML = items.map((item, i) => `<li><span class="milestone-index">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div><span class="milestone-status ${item.state === 'planejado' ? 'muted' : item.state === 'avaliacao' ? 'status-review' : 'status-live'}">${esc(item.label)}</span></li>`).join('');
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
    if (window.location.hash.startsWith('#atualizacao-')) {
      const target = byId(window.location.hash.slice(1));
      if (target) target.scrollIntoView({block:'start'});
    }
  } catch (error) {
    console.error('Não foi possível carregar o conteúdo:', error);
    const message = '<p class="empty-state">Não foi possível carregar esta seção. Recarregue a página para tentar novamente.</p>';
    ['updatesList', 'galleryGrid', 'gameState', 'originPanel'].forEach(id => { byId(id).innerHTML = message; });
    byId('filterResult').textContent = 'Conteúdo indisponível no momento.';
  }
}

function init() {
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
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderUpdates();
  }));
  byId('updatesList').addEventListener('click', event => {
    const button = event.target.closest('[data-update-media]');
    if (!button) return;
    const update = allUpdates.find(item => item.id === button.dataset.updateMedia);
    const media = updateMedia(update)[Number(button.dataset.mediaIndex)];
    if (media) openMedia(media, media.caption);
  });
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
