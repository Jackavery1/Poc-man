import {
  CELL, COLS, ROWS, W, H,
  WALL, DOT, PELLET, DOOR,
  MAZE_DEF,
} from './core.mjs';

export function createRenderer() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = W;
  wallCanvas.height = H;
  const wctx = wallCanvas.getContext('2d');

  function buildWallCache() {
    wctx.fillStyle = '#000820';
    wctx.fillRect(0, 0, W, H);
    wctx.fillStyle = '#00112a';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE_DEF[r][c] === WALL) wctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }
    const isWall = (r, c) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      return MAZE_DEF[r][c] === WALL;
    };
    const isCorridor = (r, c) => !isWall(r, c);
    wctx.shadowColor = '#55AAFF';
    wctx.shadowBlur = 7;
    wctx.fillStyle = '#3399FF';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!isWall(r, c)) continue;
        const x = c * CELL;
        const y = r * CELL;
        const t = 2;
        if (isCorridor(r - 1, c)) wctx.fillRect(x, y, CELL, t);
        if (isCorridor(r + 1, c)) wctx.fillRect(x, y + CELL - t, CELL, t);
        if (isCorridor(r, c - 1)) wctx.fillRect(x, y, t, CELL);
        if (isCorridor(r, c + 1)) wctx.fillRect(x + CELL - t, y, t, CELL);
      }
    }
    wctx.shadowBlur = 0;
  }
  buildWallCache();

  let getMaze = () => [];
  const popups = [];

  function drawFrame(ts) {
    const maze = getMaze();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(wallCanvas, 0, 0);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = maze[r][c];
        if (t !== DOT && t !== PELLET && t !== DOOR) continue;
        const px = c * CELL + CELL / 2;
        const py = r * CELL + CELL / 2;
        if (t === DOT) {
          ctx.fillStyle = '#DDCCAA';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (t === PELLET) {
          const sz = 4.5 + Math.sin(ts * 0.006) * 1.5;
          ctx.save();
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (t === DOOR) {
          ctx.fillStyle = '#FF88FF';
          ctx.fillRect(c * CELL + 1, r * CELL + CELL / 2 - 1.5, CELL - 2, 3);
        }
      }
    }
  }

  function drawLives(pacman) {
    const row = document.getElementById('lives-row');
    row.replaceChildren();
    for (let i = 0; i < pacman.lives; i++) {
      const c = document.createElement('canvas');
      c.width = 18;
      c.height = 18;
      const cx = c.getContext('2d');
      cx.save();
      cx.translate(9, 9);
      cx.shadowColor = '#FFE000';
      cx.shadowBlur = 8;
      cx.fillStyle = '#FFE000';
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.arc(0, 0, 7, 0.4, Math.PI * 2 - 0.4);
      cx.closePath();
      cx.fill();
      cx.restore();
      row.appendChild(c);
    }
  }

  function addPopup(x, y, text, color = '#ffffff') {
    popups.push({ x, y, text, color, life: 1 });
  }

  function updatePopups(dt) {
    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].life -= dt / 800;
      popups[i].y -= 0.5;
      if (popups[i].life <= 0) popups.splice(i, 1);
    }
  }

  function drawPopups() {
    for (const p of popups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  function drawOverlay(state, ts, game) {
    if (state === 'title') {
      ctx.fillStyle = 'rgba(0,8,32,0.82)';
      ctx.fillRect(0, 0, W, H);
      const tx = W / 2;
      const ty = H / 2;
      ctx.textAlign = 'center';
      ctx.font = '22px monospace';
      ctx.shadowColor = '#FFE000';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#FFE000';
      ctx.fillText('PAC-MAN', tx, ty - 50);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaa';
      ctx.font = '8px monospace';
      ctx.fillText('PRESS SPACE / TAP', tx, ty + 10);
      ctx.fillText('TO START', tx, ty + 30);
      ctx.fillStyle = '#0ff';
      ctx.fillText('ZQSD / FLECHES / D-PAD', tx, ty + 60);
      ctx.fillStyle = '#888';
      ctx.font = '6px monospace';
      ctx.fillText('CLIQUEZ LE JEU PUIS JOUEZ', tx, ty + 78);
      ctx.fillStyle = 'rgba(255,100,100,0.8)';
      ctx.font = '6px monospace';
      ctx.fillText('--- GHOST RULES ---', tx, ty + 90);
      const g = [
        '* Fantomes = danger',
        '* Pastilles = invincible!',
        '* Fantomes bleus = +200pts',
      ];
      g.forEach((t, i) => {
        ctx.fillStyle = '#ccc';
        ctx.fillText(t, tx, ty + 108 + i * 14);
      });
    }
    if (state === 'ready') {
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffff00';
      ctx.fillText('READY!', W / 2, H / 2 + 30);
      ctx.shadowBlur = 0;
    }
    if (state === 'levelComplete') {
      const flash = Math.floor(ts / 300) % 2;
      ctx.fillStyle = 'rgba(0,8,32,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.fillStyle = flash ? '#00ff88' : '#ffffff';
      ctx.fillText('LEVEL CLEAR!', W / 2, H / 2);
      ctx.shadowBlur = 0;
    }
    if (state === 'gameOver') {
      ctx.fillStyle = 'rgba(0,8,32,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = '18px monospace';
      ctx.shadowColor = '#ff2244';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#ff2244';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 50);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.fillText(`SCORE: ${game.score}`, W / 2, H / 2 - 10);
      ctx.fillStyle = '#0ff';
      ctx.fillText(`BEST:  ${game.hiScore}`, W / 2, H / 2 + 12);
      ctx.fillStyle = '#aaa';
      ctx.font = '7px monospace';
      ctx.fillText('SPACE / TAP TO RETRY', W / 2, H / 2 + 50);
    }
    if (state === 'paused') {
      ctx.fillStyle = 'rgba(0,8,32,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fff';
      ctx.fillText('PAUSED', W / 2, H / 2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaa';
      ctx.font = '7px monospace';
      ctx.fillText('SPACE TO RESUME', W / 2, H / 2 + 25);
    }
  }

  return {
    canvas,
    ctx,
    setMazeGetter(fn) {
      getMaze = fn;
    },
    drawFrame,
    drawLives,
    drawOverlay,
    addPopup,
    updatePopups,
    drawPopups,
  };
}
