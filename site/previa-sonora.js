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

  const formatTime = seconds => {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  const updateTime = () => {
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 91.454;
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
    if (!audio.paused) {
      audio.pause();
      return;
    }
    status.textContent = 'Preparando a prévia…';
    try {
      await audio.play();
      status.textContent = 'Você está ouvindo o estudo 01.';
    } catch (error) {
      if (error?.name === 'AbortError' && audio.paused) return;
      showError();
    }
  });
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
