import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../site/previa-sonora.js', import.meta.url), 'utf8');

// Testa os comandos enviados ao elemento de mídia, sem simular decodificação ou navegador.
function setup({ failure } = {}) {
  const elements = new Map();
  for (const id of ['previewAudio', 'customControls', 'playButton', 'playLabel', 'playIcon', 'trackSeek', 'playbackTime', 'muteButton', 'playerStatus', 'soundState', 'painel-sonoro']) {
    const events = new Map();
    const attrs = new Map();
    elements.set(id, {
      hidden: id === 'customControls', value: '0', textContent: '',
      addEventListener: (name, listener) => events.set(name, [...(events.get(name) || []), listener]),
      async emit(name) { for (const listener of events.get(name) || []) await listener(); },
      setAttribute: (key, value) => attrs.set(key, value),
      getAttribute: key => attrs.get(key),
      classList: { toggle() {} }
    });
  }
  const audio = elements.get('previewAudio');
  Object.assign(audio, { duration: 91.454, currentTime: 0, paused: true, ended: false, muted: false, playCalls: 0 });
  audio.play = async () => {
    audio.playCalls += 1;
    if (failure) throw failure;
    audio.paused = false;
    await audio.emit('play');
  };
  audio.pause = () => { audio.paused = true; return audio.emit('pause'); };
  runInNewContext(source, { document: { getElementById: id => elements.get(id) } });
  return { audio, element: id => elements.get(id) };
}

test('a prévia aguarda uma ação do usuário antes de tocar', () => {
  const { audio, element } = setup();
  assert.equal(audio.playCalls, 0);
  assert.equal(audio.hidden, true);
  assert.equal(element('customControls').hidden, false);
  assert.equal(element('playbackTime').textContent, '0:00 / 1:31');
});

test('reprodução e pausa acompanham o estado real da mídia', async () => {
  const { audio, element } = setup();
  await element('playButton').emit('click');
  assert.equal(audio.paused, false);
  assert.equal(element('playLabel').textContent, 'Pausar prévia');
  assert.equal(element('playButton').getAttribute('aria-pressed'), 'true');
  await element('playButton').emit('click');
  assert.equal(audio.paused, true);
  assert.equal(element('playButton').getAttribute('aria-pressed'), 'false');
});

test('avanço e relógio usam a posição e duração da faixa', async () => {
  const { audio, element } = setup();
  element('trackSeek').value = '46.5';
  await element('trackSeek').emit('input');
  assert.equal(audio.currentTime, 46.5);
  assert.equal(element('playbackTime').textContent, '0:46 / 1:31');
  audio.currentTime = 80;
  await audio.emit('timeupdate');
  assert.equal(element('trackSeek').value, '80');
  assert.equal(element('trackSeek').getAttribute('aria-valuetext'), '1 minuto e 20 segundos');
});

test('silenciar e reativar mantêm o rótulo e o estado acessível', async () => {
  const { audio, element } = setup();
  await element('muteButton').emit('click');
  await audio.emit('volumechange');
  assert.equal(audio.muted, true);
  assert.equal(element('muteButton').textContent, 'Ativar som');
  assert.equal(element('muteButton').getAttribute('aria-pressed'), 'true');
  await element('muteButton').emit('click');
  await audio.emit('volumechange');
  assert.equal(audio.muted, false);
  assert.equal(element('muteButton').textContent, 'Silenciar');
});

test('falha ao tocar exibe o controle nativo e uma saída para o usuário', async () => {
  const { audio, element } = setup({ failure: new Error('Playback blocked') });
  await element('playButton').emit('click');
  assert.equal(audio.hidden, false);
  assert.match(element('playerStatus').textContent, /arquivo direto/);
  assert.equal(element('playButton').getAttribute('aria-pressed'), 'false');
});

test('uma interrupção voluntária não aparece como erro de reprodução', async () => {
  const { audio, element } = setup({ failure: { name: 'AbortError' } });
  await element('playButton').emit('click');
  assert.equal(audio.hidden, true);
  assert.doesNotMatch(element('playerStatus').textContent, /Não foi possível/);
});
