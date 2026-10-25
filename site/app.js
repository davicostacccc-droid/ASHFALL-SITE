'use strict';

const LOCAL_PREVIEW = ['file:', 'http:'].includes(window.location.protocol) &&
  (window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname));
const CATEGORIES = {arte:'ARTE 3D', gameplay:'GAMEPLAY', sistemas:'SISTEMAS', site:'SITE'};
let allUpdates = [];
let activeCategory = 'todos';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const isVisible = item => item.approved === true || LOCAL_PREVIEW;
const formatDate = date => date ? new Intl.DateTimeFormat('pt-BR', {timeZone:'UTC', day:'2-digit', month:'short', year:'numeric'}).format(new Date(date + 'T12:00:00Z')) : 'Prévia local';

function renderUpdates() {
  const target = document.getElementById('updatesList');
  const updates = allUpdates.filter(item => activeCategory === 'todos' || item.category === activeCategory);
  if (!updates.length) {
    target.innerHTML = '<p class="empty-state">Nenhuma atualização aprovada nesta categoria ainda. Novidades aparecerão aqui depois da primeira publicação.</p>';
    return;
  }
  target.innerHTML = updates.map(item => `
    <article class="update-card">
      <div class="update-meta">
        <span class="update-version">${escapeHtml(item.version)}</span>
        <span class="update-date">${escapeHtml(formatDate(item.date))}</span>
        ${item.approved ? '' : '<span class="update-badge">EXEMPLO NÃO PUBLICADO</span>'}
      </div>
      <div class="update-body">
        <div class="update-category">${escapeHtml(CATEGORIES[item.category] || 'DESENVOLVIMENTO')}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="update-details">${(item.highlights || []).map(value => `<span>${escapeHtml(value)}</span>`).join('')}</div>
      </div>
      <div class="update-arrow" aria-hidden="true">↗</div>
    </article>`).join('');
}

function renderGallery(items) {
  const target = document.getElementById('galleryGrid');
  if (!items.length) {
    target.innerHTML = '<p class="empty-state" style="grid-column:1/-1">A galeria está sendo preparada. As imagens aprovadas aparecerão aqui.</p>';
    return;
  }
  const approvedSrc = new Set(['assets/terras-das-cinzas.webp','assets/a-queda.webp','assets/ascendentes.webp','assets/cacador-gotico.webp']);
  const safeItems = items.filter(item => approvedSrc.has(item.src));
  target.innerHTML = safeItems.map(item => `<button class="gallery-item" type="button" data-gallery="${escapeHtml(item.id)}" aria-label="Ampliar: ${escapeHtml(item.title)}">
    <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" />
    <span class="gallery-type">${escapeHtml(item.type)}</span>
    ${item.approved ? '' : '<span class="gallery-demo">PRÉVIA LOCAL</span>'}
    <span class="gallery-label"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle)}</small></span>
    <span class="gallery-expand" aria-hidden="true">↗</span></button>`).join('');
  target.querySelectorAll('[data-gallery]').forEach(el => el.addEventListener('click', () => {
    const item = safeItems.find(x => x.id === el.dataset.gallery);
    if (!item) return;
    document.getElementById('dialogImage').src = item.src;
    document.getElementById('dialogImage').alt = item.alt;
    document.getElementById('dialogCaption').textContent = `${item.title} — ${item.type} — arte conceitual, não gameplay`;
    document.getElementById('galleryDialog').showModal();
  }));
}

async function initData() {
  try {
    const response = await fetch('data/content.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    allUpdates = (data.updates || []).filter(isVisible).sort((a,b) => (b.date || '').localeCompare(a.date || ''));
    renderUpdates();
    renderGallery((data.gallery || []).filter(isVisible));
    document.getElementById('previewNotice').hidden = !LOCAL_PREVIEW || ![...(data.updates||[]),...(data.gallery||[])].some(x => !x.approved);
  } catch (error) {
    console.error('Falha ao carregar as novidades:', error);
    document.getElementById('updatesList').innerHTML = '<p class="empty-state">Não foi possível carregar as novidades. Para testar localmente, use o arquivo ABRIR_SITE.bat (Windows) ou um servidor HTTP.</p>';
    document.getElementById('galleryGrid').innerHTML = '<p class="empty-state">Galeria indisponível no momento.</p>';
  }
}

function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  const menu = document.getElementById('menuButton');
  const nav = document.getElementById('mainNavigation');
  menu.addEventListener('click', () => {
    const opening = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', opening);
    menu.setAttribute('aria-expanded', String(opening));
    menu.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');
  }));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active',selected);
      item.setAttribute('aria-pressed',String(selected));
    });
    renderUpdates();
  }));
  const dialog = document.getElementById('galleryDialog');
  document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  initData();
}

document.addEventListener('DOMContentLoaded', init);
