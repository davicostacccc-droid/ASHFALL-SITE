import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { publicItems, publicUpdates, escapeHtml, formatDate, safeMediaPath, ACCENTS } from '../site/content-model.mjs';

const content = JSON.parse(await readFile(new URL('../site/data/content.json', import.meta.url), 'utf8'));

test('só conteúdo aprovado aparece, independentemente do endereço da página', () => {
  const approved = { id:'a', approved:true };
  assert.deepEqual(publicItems([approved, {approved:false}, {approved:1}, {}, null]), [approved]);
  assert.deepEqual(publicItems(undefined), []);
});
test('filtros mantêm a data mais recente primeiro sem alterar a fonte', () => {
  const source = [{approved:true, category:'site', date:'2026-10-25'}, {approved:true, category:'gameplay', date:'2026-10-26'}, {approved:false, category:'gameplay', date:'2026-10-27'}];
  assert.deepEqual(publicUpdates(source).map(item => item.date), ['2026-10-26','2026-10-25']);
  assert.equal(publicUpdates(source,'gameplay').length, 1);
  assert.equal(publicUpdates(source,'arte').length, 0);
  assert.equal(source[0].date, '2026-10-25');
});
test('texto não pode virar HTML ativo', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">&\''), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;');
});
test('datas não mudam entre fusos horários', () => {
  assert.match(formatDate('2026-10-26'), /26.*out.*2026/);
});
test('a galeria aceita somente imagens locais válidas', () => {
  for (const image of content.gallery) assert.equal(safeMediaPath(image.src), true);
  for (const path of ['https://example.com/a.png','assets/../a.png','assets/a.svg','assets/a.webp?x','assets/%2e.png','/assets/a.png',null]) assert.equal(safeMediaPath(path), false);
});
test('as cinco origens têm cores reconhecidas e notícias em avaliação não somem', () => {
  assert.equal(content.origins.length,5);
  assert.ok(content.origins.every(item => ACCENTS.has(item.accent)));
  assert.ok(publicUpdates(content.updates).some(item => item.status === 'avaliacao'));
  assert.ok(publicUpdates(content.updates).every(item => item.approved === true));
});
