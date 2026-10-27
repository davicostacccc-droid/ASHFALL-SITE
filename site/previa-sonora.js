(() => {
  'use strict';
  const audio = document.getElementById('previewAudio');
  const controls = document.getElementById('customControls');
  const button = document.getElementById('playButton');
  const label = document.getElementById('playLabel');
  const icon = document.getElementById('playIcon');
  const seek = document.getElementById('trackSeek');
  const clock = document.getElementById('playbackTime');
  const mute = document.getElementById('muteButton');
  const status = document.getElementById('playerStatus');
  const state = document.getElementById('soundState');
  const panel = document.getElementById('painel-sonoro');
  if (!audio || !controls || !button || !label || !icon || !seek || !clock || !mute || !status || !state || !panel) return;
  let fallbackDuration = Number(audio.dataset?.duration) || 91.454;
  let playRequest = 0;
  const choices = Array.from(document.querySelectorAll?.('[data-audio-track]') || []);

  const formatTime = seconds => {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  const updateTime = () => {
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDuration;
    seek.max = String(duration);
    seek.value = String(audio.currentTime);
    const elapsed = Math.floor(audio.currentTime);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    seek.setAttribute('aria-valuetext', `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} e ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`);
    clock.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
  };
  const updateState = () => {
    const playing = !audio.paused && !audio.ended;
    label.textContent = playing ? 'Pausar prévia' : audio.ended ? 'Ouvir de novo' : 'Ouvir prévia';
    icon.textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-pressed', String(playing));
    panel.classList.toggle('is-playing', playing);
    state.textContent = playing ? 'REPRODUZINDO' : audio.ended ? 'PRÉVIA CONCLUÍDA' : 'PRONTO PARA OUVIR';
  };
  const showError = () => {
    status.textContent = 'Não foi possível tocar aqui. Use “Ouça o arquivo direto” abaixo.';
    audio.hidden = false;
    updateState();
  };
  button.addEventListener('click', async () => {
    const request = ++playRequest;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    status.textContent = 'Preparando a prévia…';
    try {
      await audio.play();
      if (request === playRequest) status.textContent = 'Você está ouvindo a prévia selecionada.';
    } catch (error) {
      if (request !== playRequest) return;
      if (error?.name === 'AbortError' && audio.paused) return;
      showError();
    }
  });
  choices.forEach(choice => choice.addEventListener('click', () => {
    if (choice.getAttribute('aria-pressed') === 'true') return;
    const data = choice.dataset;
    const duration = Number(data.duration);
    if (!/^assets\/audio\/[a-z0-9-]+\.mp3$/.test(data.src) || !Number.isFinite(duration) || duration <= 0) return;
    ++playRequest;
    audio.pause();
    fallbackDuration = duration;
    audio.src = data.src;
    audio.load();
    const values = {
      trackTitle: data.title, trackDescription: data.summary, trackStudy: data.study,
      trackDuration: formatTime(duration), trackTempo: `${data.bpm} BPM`, trackMood: data.mood,
      currentTrackLabel: data.title, downloadInfo: `MP3 · ${data.size} ↓`
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    ['downloadTrack', 'directTrack'].forEach(id => {
      const link = document.getElementById(id);
      if (link) link.href = data.src;
    });
    audio.setAttribute('aria-label', `Ouvir ${data.title}`);
    choices.forEach(item => item.setAttribute('aria-pressed', String(item === choice)));
    updateTime();
    updateState();
    status.textContent = `${data.title} selecionada. Aperte “Ouvir prévia” para começar.`;
  }));
  seek.addEventListener('input', () => {
    try {
      audio.currentTime = Number(seek.value);
      updateTime();
    } catch {
      status.textContent = 'Aguarde o áudio carregar para avançar.';
    }
  });
  mute.addEventListener('click', () => { audio.muted = !audio.muted; });
  audio.addEventListener('volumechange', () => {
    mute.textContent = audio.muted ? 'Ativar som' : 'Silenciar';
    mute.setAttribute('aria-pressed', String(audio.muted));
  });
  audio.addEventListener('timeupdate', updateTime);
  audio.addEventListener('loadedmetadata', updateTime);
  audio.addEventListener('play', updateState);
  audio.addEventListener('pause', () => { updateState(); status.textContent = 'Prévia pausada. Continue quando quiser.'; });
  audio.addEventListener('ended', () => { updateState(); status.textContent = 'Fim da prévia. Você pode ouvir de novo ou baixar a faixa.'; });
  audio.addEventListener('error', showError);
  audio.hidden = true;
  controls.hidden = false;
  updateTime();
  updateState();
})();
