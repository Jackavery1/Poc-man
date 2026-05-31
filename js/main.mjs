import { audio } from './audio.mjs';
import { createRenderer } from './render.mjs';
import { createGame } from './game.mjs';
import { initInput } from './input.mjs';

const renderer = createRenderer();
const { game, getPacman, getGhosts } = createGame({ audio, renderer });
const { pollHeldKeys } = initInput({
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
    ghosts.forEach((g) => g.draw(renderer.ctx, ts));
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

game.init();
renderer.drawLives(getPacman());
requestAnimationFrame(loop);
