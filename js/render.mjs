import {
  CELL, COLS, ROWS, W, H,
  WALL, DOT, PELLET, DOOR,
  MAZE_DEF,
} from './core.mjs';

export function createRenderer() {
  const canvas = document.getElementById('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = W;
  wallCanvas.height = H;
  const wctx = wallCanvas.getContext('2d');

  const dotsCanvas = document.createElement('canvas');
  dotsCanvas.width = W;
  dotsCanvas.height = H;
  const dctx = dotsCanvas.getContext('2d');

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
  let getFruit = () => null;
  let mazeDirty = true;
  const popups = [];
  let reduceMotion = false;

  function rebuildDotsCache() {
    const maze = getMaze();
    dctx.clearRect(0, 0, W, H);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = maze[r]?.[c];
        if (t !== DOT && t !== DOOR) continue;
        const px = c * CELL + CELL / 2;
        const py = r * CELL + CELL / 2;
        if (t === DOT) {
          dctx.fillStyle = '#DDCCAA';
          dctx.beginPath();
          dctx.arc(px, py, 2, 0, Math.PI * 2);
          dctx.fill();
        } else if (t === DOOR) {
          dctx.fillStyle = '#FF88FF';
          dctx.fillRect(c * CELL + 1, r * CELL + CELL / 2 - 1.5, CELL - 2, 3);
        }
      }
    }
    mazeDirty = false;
  }

  function drawFruit() {
    const fruit = getFruit();
    if (!fruit) return;
    const { x, y, color } = fruit;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - 4, y - 2, 5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 2, 5, 0, Math.PI * 2);
    ctx.arc(x, y + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a8010';
    ctx.fillRect(x - 1, y - 8, 3, 5);
    ctx.restore();
  }

  function drawFrame(ts) {
    const maze = getMaze();
    if (mazeDirty) rebuildDotsCache();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(wallCanvas, 0, 0);
    ctx.drawImage(dotsCanvas, 0, 0);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (maze[r][c] !== PELLET) continue;
        const px = c * CELL + CELL / 2;
        const py = r * CELL + CELL / 2;
        const sz = reduceMotion ? 4.5 : 4.5 + Math.sin(ts * 0.006) * 1.5;
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    drawFruit();
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
    let n = 0;
    for (let i = 0; i < popups.length; i++) {
      const p = popups[i];
      p.life -= dt / 800;
      p.y -= 0.5;
      if (p.life > 0) popups[n++] = p;
    }
    popups.length = n;
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
      ctx.fillText('ESPACE / TOUCHER', tx, ty + 10);
      ctx.fillText('POUR JOUER', tx, ty + 30);
      ctx.fillStyle = '#0ff';
      ctx.fillText('FLECHES / WASD / ZQSD', tx, ty + 60);
      ctx.fillStyle = '#888';
      ctx.font = '6px monospace';
      ctx.fillText('CLIQUEZ LE JEU PUIS JOUEZ', tx, ty + 78);
      ctx.fillStyle = 'rgba(255,100,100,0.8)';
      ctx.font = '6px monospace';
      ctx.fillText('--- REGLES ---', tx, ty + 90);
      const g = [
        '* Fantomes = danger',
        '* Pastilles = invincible',
        '* Fruit apres 70 pastilles',
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
      ctx.fillText('PRET !', W / 2, H / 2 + 30);
      ctx.shadowBlur = 0;
    }
    if (state === 'levelComplete') {
      const flash = reduceMotion ? 1 : Math.floor(ts / 300) % 2;
      ctx.fillStyle = 'rgba(0,8,32,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.fillStyle = flash ? '#00ff88' : '#ffffff';
      ctx.fillText('NIVEAU TERMINE !', W / 2, H / 2 - 12);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#aaffcc';
      ctx.fillText(`INTERMISSION ${game.intermissionLevel}`, W / 2, H / 2 + 14);
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
      ctx.fillText('FIN DE PARTIE', W / 2, H / 2 - 50);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.fillText(`SCORE : ${game.score}`, W / 2, H / 2 - 10);
      ctx.fillStyle = '#0ff';
      ctx.fillText(`RECORD : ${game.hiScore}`, W / 2, H / 2 + 12);
      ctx.fillStyle = '#aaa';
      ctx.font = '7px monospace';
      ctx.fillText('ESPACE / TOUCHER POUR REJOUER', W / 2, H / 2 + 50);
    }
    if (state === 'paused') {
      ctx.fillStyle = 'rgba(0,8,32,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fff';
      ctx.fillText('PAUSE', W / 2, H / 2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaa';
      ctx.font = '7px monospace';
      ctx.fillText('ESPACE POUR REPRENDRE', W / 2, H / 2 + 25);
    }
  }

  return {
    canvas,
    ctx,
    setMazeGetter(fn) {
      getMaze = fn;
    },
    setFruitGetter(fn) {
      getFruit = fn;
    },
    setReduceMotion(value) {
      reduceMotion = value;
    },
    invalidateMaze() {
      mazeDirty = true;
    },
    drawFrame,
    drawLives,
    drawOverlay,
    addPopup,
    updatePopups,
    drawPopups,
  };
}
