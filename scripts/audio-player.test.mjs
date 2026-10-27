import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../site/previa-sonora.js', import.meta.url), 'utf8');

// Testa os comandos enviados ao elemento de mídia, sem simular decodificação ou navegador.
function setup({ failure, library = false } = {}) {
  const elements = new Map();
  for (const id of ['previewAudio', 'customControls', 'playButton', 'playLabel', 'playIcon', 'trackSeek', 'playbackTime', 'muteButton', 'playerStatus', 'soundState', 'painel-sonoro', 'trackTitle', 'trackDescription', 'trackStudy', 'trackDuration', 'trackTempo', 'trackMood', 'currentTrackLabel', 'downloadInfo', 'downloadTrack', 'directTrack', 'track-original', 'track-combat']) {
    const events = new Map();
    const attrs = new Map();
    elements.set(id, {
      hidden: id === 'customControls', value: '0', textContent: '', dataset: {},
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
  audio.load = () => { audio.currentTime = 0; audio.duration = NaN; audio.ended = false; };
  const original = elements.get('track-original');
  const combat = elements.get('track-combat');
  original.setAttribute('aria-pressed', 'true');
  combat.setAttribute('aria-pressed', 'false');
  combat.dataset = { src: 'assets/audio/marcha-das-cinzas-estudo-01.mp3', title: 'Marcha das Cinzas', duration: '102.896327', bpm: '112', mood: 'Combate', size: '1,6 MB', summary: 'Pulso para as hordas.', study: 'ESTUDO 03 / COMBATE' };
  runInNewContext(source, { document: { getElementById: id => elements.get(id), querySelectorAll: () => library ? [original, combat] : [] } });
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

test('trocar de faixa pausa, reinicia a posição e atualiza arquivo e metadados sem autoplay', async () => {
  const { audio, element } = setup({ library: true });
  await element('playButton').emit('click');
  audio.currentTime = 30;
  await element('track-combat').emit('click');
  assert.equal(audio.paused, true);
  assert.equal(audio.playCalls, 1);
  assert.equal(audio.currentTime, 0);
  assert.equal(audio.src, 'assets/audio/marcha-das-cinzas-estudo-01.mp3');
  assert.equal(element('trackTitle').textContent, 'Marcha das Cinzas');
  assert.equal(element('trackTempo').textContent, '112 BPM');
  assert.equal(element('playbackTime').textContent, '0:00 / 1:42');
  assert.equal(element('downloadTrack').href, audio.src);
  assert.equal(element('directTrack').href, audio.src);
  assert.equal(element('track-original').getAttribute('aria-pressed'), 'false');
  assert.equal(element('track-combat').getAttribute('aria-pressed'), 'true');
});

test('erro de uma reprodução antiga não sobrescreve a faixa recém-selecionada', async () => {
  const { audio, element } = setup({ library: true });
  let rejectPlay;
  audio.play = () => new Promise((resolve, reject) => { rejectPlay = reject; });
  const pending = element('playButton').emit('click');
  await element('track-combat').emit('click');
  rejectPlay(new Error('Old source stopped'));
  await pending;
  assert.match(element('playerStatus').textContent, /Marcha das Cinzas selecionada/);
  assert.equal(audio.hidden, true);
});

test('a biblioteca recusa caminhos externos ou fora da pasta de áudio', async () => {
  const { audio, element } = setup({ library: true });
  for (const path of ['https://example.com/a.mp3', 'assets/audio/../a.mp3']) {
    element('track-combat').dataset.src = path;
    await element('track-combat').emit('click');
    assert.equal(audio.src, undefined);
    assert.equal(element('track-original').getAttribute('aria-pressed'), 'true');
  }
});
