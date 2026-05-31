import { L, R, U, D } from './core.mjs';

const KEY_DIR = {
  ArrowLeft: L, KeyA: L, KeyQ: L,
  ArrowRight: R, KeyD: R,
  ArrowUp: U, KeyW: U, KeyZ: U,
  ArrowDown: D, KeyS: D,
};

const KEY_POLL_ORDER = [
  'ArrowUp', 'KeyW', 'KeyZ', 'ArrowDown', 'KeyS',
  'ArrowLeft', 'KeyA', 'KeyQ', 'ArrowRight', 'KeyD',
];

export function initInput({ game, getPacman, canvas, audio }) {
  const keysHeld = new Set();

  function focusGame() {
    document.body.focus();
    canvas.focus();
  }

  function setDir(d) {
    const pacman = getPacman();
    audio.init();
    if (game.state === 'title' || game.state === 'gameOver') {
      game.startGame(focusGame);
      pacman.nextDir = { ...d };
      return;
    }
    if (game.state === 'paused') game.state = 'playing';
    if (game.state === 'playing' || game.state === 'ready' || game.state === 'dying') {
      pacman.nextDir = { ...d };
    }
  }

  function pollHeldKeys() {
    if (game.state === 'title' || game.state === 'gameOver' || game.state === 'paused') return;
    for (const code of KEY_POLL_ORDER) {
      if (keysHeld.has(code)) {
        setDir(KEY_DIR[code]);
        return;
      }
    }
  }

  function onKeyDown(e) {
    const d = KEY_DIR[e.code];
    if (d) {
      keysHeld.add(e.code);
      setDir(d);
      e.preventDefault();
      return;
    }
    switch (e.code) {
      case 'Space':
        audio.init();
        if (game.state === 'title' || game.state === 'gameOver') {
          game.startGame(focusGame);
          break;
        }
        if (game.state === 'playing') {
          game.state = 'paused';
          break;
        }
        if (game.state === 'paused') {
          game.state = 'playing';
          break;
        }
        e.preventDefault();
        break;
      case 'Escape':
        if (game.state === 'playing') game.state = 'paused';
        else if (game.state === 'paused') game.state = 'playing';
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  function onKeyUp(e) {
    keysHeld.delete(e.code);
  }

  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  document.body.addEventListener('click', focusGame);

  ['up', 'down', 'left', 'right'].forEach((name) => {
    const el = document.getElementById(`dbtn-${name}`);
    const d = { up: U, down: D, left: L, right: R }[name];
    const press = () => {
      el.classList.add('pressed');
      setDir(d);
    };
    const release = () => el.classList.remove('pressed');
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
  });

  let swipeStart = null;
  document.addEventListener('touchstart', (e) => {
    swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!swipeStart) return;
    const dx = e.changedTouches[0].clientX - swipeStart.x;
    const dy = e.changedTouches[0].clientY - swipeStart.y;
    swipeStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? R : L);
    else setDir(dy > 0 ? D : U);
  }, { passive: true });

  canvas.addEventListener('click', () => {
    audio.init();
    focusGame();
    if (game.state === 'title' || game.state === 'gameOver') game.startGame(focusGame);
    else if (game.state === 'paused') game.state = 'playing';
  });

  function togglePause() {
    if (game.state === 'playing') game.state = 'paused';
    else if (game.state === 'paused') game.state = 'playing';
  }

  return { pollHeldKeys, focusGame, togglePause };
}
