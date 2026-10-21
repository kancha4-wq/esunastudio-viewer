(() => {
  const en = document.documentElement.lang.startsWith('en');
  const video = document.getElementById('byu-operation-guide');
  const button = document.querySelector('.video-start');
  const status = document.querySelector('.video-status');
  if (!video || !button || !status) return;
  const source = video.querySelector('source');
  const url = source && source.src;
  let prepared = false;
  let pending;
  async function prepare() {
    if (prepared) return;
    if (!pending) {
      // Load only after a user gesture. A complete Blob permits seeking even
      // when the delivery path does not honor HTTP Range requests.
      video.pause();
      if (source) source.remove();
      video.load();
      status.textContent = (en ? 'Loading video…' : '動画を読み込んでいます…');
      pending = fetch(url).then(response => {
        if (!response.ok) throw new Error('Video unavailable');
        return response.blob();
      }).then(blob => {
        video.src = URL.createObjectURL(blob);
        prepared = true;
        status.textContent = '';
      }).catch(error => {
        pending = undefined;
        throw error;
      });
    }
    await pending;
  }
  async function start() {
    button.disabled = true;
    try {
      await prepare();
      await video.play();
      video.scrollIntoView({ block: 'center', behavior: 'auto' });
    } catch (_) {
      status.textContent = (en ? 'If playback fails, try “Open video directly”.' : '再生できない場合は「動画を直接開く」をお試しください。');
    } finally {
      button.disabled = false;
    }
  }
  button.hidden = false;
  button.addEventListener('click', start);
  video.addEventListener('play', () => { if (!prepared) start(); });
  video.addEventListener('playing', () => { button.hidden = true; });
  video.addEventListener('pause', () => {
    button.hidden = false;
    button.textContent = (en ? 'Resume video ▶' : '再生を再開 ▶');
  });
  video.addEventListener('ended', () => {
    button.hidden = false;
    button.textContent = (en ? 'Play again ▶' : 'もう一度再生 ▶');
  });
})();
