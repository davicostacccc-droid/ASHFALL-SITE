// Conteúdo público e formatação compartilhados pela página e pelas verificações.
export const CATEGORIES = Object.freeze({arte:'Arte', gameplay:'Jogabilidade', sistemas:'Sistemas', site:'Site'});
export const UPDATE_FILTERS = Object.freeze({jogo:'Jogo', avaliacao:'Em avaliação', site:'Site', todos:'Tudo'});
export const STATUS = Object.freeze({integrado:'NA ALPHA', avaliacao:'EM AVALIAÇÃO', planejado:'PLANEJADO'});
export const ACCENTS = new Set(['ember', 'steel', 'plague', 'electric', 'sacred']);

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
export const publicItems = items => Array.isArray(items) ? items.filter(item => item?.approved === true) : [];
export const publicUpdates = (items, category = 'todos') => publicItems(items)
  .filter(item => category === 'todos' || (category === 'jogo' ? item.category !== 'site' : category === 'avaliacao' ? item.status === 'avaliacao' : item.category === category))
  .sort((a, b) => b.date.localeCompare(a.date));
export const formatDate = value => new Intl.DateTimeFormat('pt-BR', {
  timeZone:'UTC', day:'2-digit', month:'short', year:'numeric'
}).format(new Date(`${value}T12:00:00Z`));
export const safeMediaPath = value => typeof value === 'string' && /^assets\/[a-z0-9][a-z0-9_-]*\.(webp|png|jpe?g|avif)$/i.test(value);
export const updateMedia = item => Array.isArray(item?.media) ? item.media.filter(media =>
  media.type === 'image' && safeMediaPath(media.src) && typeof media.alt === 'string' && media.alt.trim() && typeof media.caption === 'string' && media.caption.trim()
) : [];
