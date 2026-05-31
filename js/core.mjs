export const CELL = 18;
export const COLS = 28;
export const ROWS = 31;
export const W = COLS * CELL;
export const H = ROWS * CELL;

export const R = { dx: 1, dy: 0, angle: 0 };
export const D = { dx: 0, dy: 1, angle: Math.PI / 2 };
export const L = { dx: -1, dy: 0, angle: Math.PI };
export const U = { dx: 0, dy: -1, angle: -Math.PI / 2 };
export const DIRS = [R, D, L, U];
export const dir0 = () => ({ dx: 0, dy: 0, angle: 0 });

export const WALL = 1;
export const DOT = 0;
export const PELLET = 2;
export const EMPTY = 3;
export const DOOR = 4;
export const SCATTER = 'scatter';
export const CHASE = 'chase';
export const FRIGHTENED = 'frightened';
export const EATEN = 'eaten';
export const HOUSE = 'house';

export const SPEED_PAC = 2.0;
export const SPEED_GHOST = 1.8;
export const SPEED_FRIGHT = 1.1;
export const SPEED_EATEN = 4.0;
export const FRIGHT_DURATION = 8000;
export const FRIGHT_FLASH = 2500;

export const MAZE_DEF = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,2,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,2,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,3,1,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,3,1,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,1,1,1,4,4,1,1,1,3,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,1,3,3,3,3,3,3,1,3,1,1,0,1,1,1,1,1,1],
  [3,3,3,3,3,3,0,3,3,3,1,3,3,3,3,3,3,1,3,3,3,0,3,3,3,3,3,3],
  [1,1,1,1,1,1,0,1,1,3,1,3,3,3,3,3,3,1,3,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,1,1,1,1,1,1,1,1,3,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,1,1,1,1,1,1,1,1,3,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,3,1,1,1,1,1,1,1,1,3,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,2,0,0,1,1,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,1,1,0,0,2,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export function wrapCol(col) {
  return ((col % COLS) + COLS) % COLS;
}

export function tileColFromX(x) {
  return Math.round((x - CELL / 2) / CELL);
}

export function tileRowFromY(y) {
  return Math.round((y - CELL / 2) / CELL);
}

export function alignedXY(col, row) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

/**
 * Indique si une position pixel est alignee sur le centre d'une case.
 * @param {number} x
 * @param {number} y
 * @param {number} speed
 */
export function isAlignedAt(x, y, speed) {
  const col = tileColFromX(x);
  const row = tileRowFromY(y);
  const { x: ax, y: ay } = alignedXY(col, row);
  return Math.abs(x - ax) < speed - 0.5 && Math.abs(y - ay) < speed - 0.5;
}

export function cellAt(row, col, maze = MAZE_DEF) {
  const c = wrapCol(col);
  if (row < 0 || row >= ROWS) return null;
  return maze[row]?.[c] ?? WALL;
}

export function canWalkAt(col, row, { door = false, maze = MAZE_DEF } = {}) {
  const t = cellAt(row, col, maze);
  if (t === null || t === WALL) return false;
  if (t === DOOR && !door) return false;
  return true;
}

/**
 * Deplacement fantome autorise (tunnel, porte, murs).
 * @param {string} mode HOUSE|EATEN|SCATTER|CHASE|...
 */
export function canWalkGhostAt(mode, col, row, maze = MAZE_DEF) {
  const c = wrapCol(col);
  if (row < 0 || row >= ROWS) return false;
  const t = maze[row]?.[c];
  if (t === WALL) return false;
  if (t === DOOR) return mode === HOUSE || mode === EATEN;
  if (mode !== EATEN && row === 14 && (c <= 5 || c >= 22)) return false;
  return true;
}

/**
 * Direction optimale vers la cible; demi-tour si cul-de-sac.
 */
export function pickMoveToward(tileCol, tileRow, dir, target, canWalk) {
  let avail = DIRS.filter((d) => {
    if (d.dx === -dir.dx && d.dy === -dir.dy) return false;
    return canWalk(tileCol + d.dx, tileRow + d.dy);
  });
  if (!avail.length) {
    avail = DIRS.filter((d) => canWalk(tileCol + d.dx, tileRow + d.dy));
  }
  if (!avail.length) return null;
  let best = avail[0];
  let bestD = Infinity;
  for (const d of avail) {
    const dx = tileCol + d.dx - target.col;
    const dy = tileRow + d.dy - target.row;
    const dist = dx * dx + dy * dy;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return { ...best };
}

/** Phase B sortie maison : action apres snap grille. */
export function getHouseExitAction(col, row) {
  if (col === 13 && row === 11) return { type: 'exit' };
  if (col !== 13) return { type: 'horizontal', toward: col < 13 ? 'right' : 'left' };
  return { type: 'up' };
}
