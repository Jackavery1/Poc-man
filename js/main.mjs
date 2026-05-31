import { audio } from './audio.mjs';
import { createHUD } from './hud.mjs';
import { createRenderer } from './render.mjs';
import { createGame } from './game.mjs';
import { initInput } from './input.mjs';

const renderer = createRenderer();
const hud = createHUD();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
renderer.setReduceMotion(reduceMotion);
if (reduceMotion) {
  document.documentElement.classList.add('reduce-motion');
}

const { game, getPacman, getGhosts } = createGame({ audio, renderer, hud });
const drawOpts = () => ({ reduceMotion });

const { pollHeldKeys, togglePause } = initInput({
  game,
  getPacman,
  canvas: renderer.canvas,
  audio,
});

let lastTs = 0;
let rafId = 0;

function loop(ts) {
  const dt = Math.min(ts - lastTs || 0, 50);
  lastTs = ts;
  pollHeldKeys();
  game.update(dt);
  renderer.drawFrame(ts);
  if (game.state !== 'title' && game.state !== 'gameOver') {
    const ghosts = getGhosts();
    const pacman = getPacman();
    ghosts.forEach((g) => g.draw(renderer.ctx, ts, drawOpts()));
    pacman.draw(renderer.ctx);
    renderer.drawPopups();
  }
  renderer.drawOverlay(game.state, ts, game);
  rafId = requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(rafId);
    lastTs = 0;
  } else {
    rafId = requestAnimationFrame(loop);
  }
});

function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const notifyUpdate = () => {
      const banner = document.getElementById('sw-update');
      if (banner) banner.hidden = false;
    };
    if (reg.waiting) notifyUpdate();
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          notifyUpdate();
        }
      });
    });
  }).catch(() => {});

  const reloadBtn = document.getElementById('sw-reload');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.waiting?.postMessage('SKIP_WAITING');
      });
    });
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

setupServiceWorker();

const pauseBtn = document.getElementById('dbtn-pause');
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

const muteBtn = document.getElementById('btn-mute');
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    const muted = audio.toggleMute();
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
  });
}

game.init();
hud.drawLives(getPacman());
requestAnimationFrame(loop);
