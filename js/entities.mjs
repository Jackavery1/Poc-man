import {
  CELL, COLS, W, R, D, L, U, DIRS, dir0,
  WALL, MAZE_DEF,
  SCATTER, CHASE, FRIGHTENED, EATEN, HOUSE,
  SPEED_PAC, SPEED_GHOST, SPEED_FRIGHT, SPEED_EATEN,
  FRIGHT_DURATION, FRIGHT_FLASH,
  DEATH_ANIM_PER_MS, MOUTH_ANIM_PER_MS, GHOST_FLASH_INTERVAL_MS,
  movePixels,
  isAlignedAt, canWalkAt, canWalkGhostAt, pickMoveToward, getHouseExitAction,
} from './core.mjs';

export class Entity {
  constructor(col, row) {
    this.x = col * CELL + CELL / 2;
    this.y = row * CELL + CELL / 2;
    this.dir = dir0();
    this.speed = 2;
    this.speedMul = 1;
  }
  get tileCol() { return Math.round((this.x - CELL / 2) / CELL); }
  get tileRow() { return Math.round((this.y - CELL / 2) / CELL); }
  get alignedX() { return this.tileCol * CELL + CELL / 2; }
  get alignedY() { return this.tileRow * CELL + CELL / 2; }
  get aligned() { return isAlignedAt(this.x, this.y, this.speed); }
  canWalk(col, row, door = false) {
    return canWalkAt(col, row, { door });
  }
}

export class Pacman extends Entity {
  constructor() {
    super(13, 29);
    this.dir = { ...L };
    this.nextDir = { ...L };
    this.mouth = 0;
    this.mouthSpd = 1;
    this.lives = 3;
    this.speed = SPEED_PAC;
    this.dying = false;
    this.deathProg = 0;
  }
  reset() {
    this.x = 13 * CELL + CELL / 2;
    this.y = 29 * CELL + CELL / 2;
    this.dir = { ...L };
    this.nextDir = { ...L };
    this.mouth = 0;
    this.mouthSpd = 1;
    this.dying = false;
    this.deathProg = 0;
  }
  setSpeedMul(mul) {
    this.speedMul = mul;
    this.speed = SPEED_PAC * mul;
  }
  update(dt) {
    if (this.dying) {
      this.deathProg = Math.min(1, this.deathProg + DEATH_ANIM_PER_MS * dt);
      return;
    }
    const step = movePixels(this.speed, dt);
    if (this.aligned) {
      this.x = this.alignedX;
      this.y = this.alignedY;
      const nd = this.nextDir;
      if (nd.dx !== 0 || nd.dy !== 0) {
        if (this.canWalk(this.tileCol + nd.dx, this.tileRow + nd.dy)) {
          this.dir = { ...nd };
        }
      }
    }
    const cd = this.dir;
    if (cd.dx === 0 && cd.dy === 0) return;
    if (this.aligned && !this.canWalk(this.tileCol + cd.dx, this.tileRow + cd.dy)) return;
    this.x += cd.dx * step;
    this.y += cd.dy * step;
    if (this.x < 0) this.x += W;
    if (this.x >= W) this.x -= W;
    this.mouth += this.mouthSpd * MOUTH_ANIM_PER_MS * dt;
    if (this.mouth >= 1) { this.mouth = 1; this.mouthSpd = -1; }
    if (this.mouth <= 0) { this.mouth = 0; this.mouthSpd = 1; }
  }
  draw(ctx) {
    const r = CELL * 0.46;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.dying) {
      const p = this.deathProg;
      const openAngle = Math.PI * (p < 0.5 ? p * 2 : 1);
      ctx.rotate(this.dir.angle || 0);
      ctx.shadowColor = '#FFE000';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(255,224,0,${1 - p * 0.8})`;
      const sr = r * (1 - p * 0.4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, sr, openAngle, -openAngle, true);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.rotate(this.dir.angle || 0);
      const mAngle = this.mouth * 0.35;
      ctx.shadowColor = '#FFE000';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#FFE000';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, mAngle, Math.PI * 2 - mAngle);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(r * 0.25, -r * 0.55, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class Ghost extends Entity {
  constructor(col, row, color, name, sCol, sRow, exitDelay) {
    super(col, row);
    this.startCol = col;
    this.startRow = row;
    this.color = color;
    this.name = name;
    this.scatterCol = sCol;
    this.scatterRow = sRow;
    this.exitDelay = exitDelay;
    this.mode = HOUSE;
    this.modeBeforeFright = SCATTER;
    this.frightTimer = 0;
    this.speed = SPEED_GHOST;
    this.dir = { ...U };
    this.exitTimer = exitDelay;
  }
  reset() {
    this.x = this.startCol * CELL + CELL / 2;
    this.y = this.startRow * CELL + CELL / 2;
    this.mode = HOUSE;
    this.modeBeforeFright = SCATTER;
    this.frightTimer = 0;
    this.speed = SPEED_GHOST * this.speedMul;
    this.dir = { ...U };
    this.exitTimer = this.exitDelay;
  }
  setSpeedMul(mul) {
    this.speedMul = mul;
    this.syncSpeed();
  }
  syncSpeed() {
    if (this.mode === FRIGHTENED) this.speed = SPEED_FRIGHT * this.speedMul;
    else if (this.mode === EATEN) this.speed = SPEED_EATEN * this.speedMul;
    else this.speed = SPEED_GHOST * this.speedMul;
  }
  frighten() {
    if (this.mode === EATEN) return;
    if (this.mode === SCATTER || this.mode === CHASE) {
      this.modeBeforeFright = this.mode;
    }
    this.mode = FRIGHTENED;
    this.frightTimer = FRIGHT_DURATION;
    this.syncSpeed();
    const od = DIRS.find((d) => d.dx === -this.dir.dx && d.dy === -this.dir.dy);
    if (od) this.dir = { ...od };
  }
  eatMe() {
    this.mode = EATEN;
    this.syncSpeed();
    this.frightTimer = 0;
  }
  update(pac, ghosts, dt) {
    const step = movePixels(this.speed, dt);
    if (this.mode === EATEN) {
      const homeX = 13 * CELL + CELL / 2;
      const homeY = 14 * CELL + CELL / 2;
      if (Math.abs(this.x - homeX) < CELL && Math.abs(this.y - homeY) < CELL) {
        this.x = homeX;
        this.y = homeY;
        this.mode = HOUSE;
        this.exitTimer = 1500;
        this.syncSpeed();
        this.dir = { ...U };
        return;
      }
      if (this.aligned) {
        this.x = this.alignedX;
        this.y = this.alignedY;
        this.moveToward({ col: 13, row: 14 });
      }
      const enc = this.tileCol + this.dir.dx;
      const enr = this.tileRow + this.dir.dy;
      if (this.aligned && !this.canWalkGhost(enc, enr)) {
        this.moveToward({ col: 13, row: 14 });
        return;
      }
      this.x += this.dir.dx * step;
      this.y += this.dir.dy * step;
      if (this.x < 0) this.x += W;
      if (this.x >= W) this.x -= W;
      return;
    }
    if (this.mode === FRIGHTENED) {
      this.frightTimer -= dt;
      if (this.frightTimer <= 0) {
        this.mode = this.modeBeforeFright;
        this.syncSpeed();
      }
    }
    if (this.mode === HOUSE) {
      this.updateHouse(dt);
      return;
    }
    if (this.aligned) {
      this.x = this.alignedX;
      this.y = this.alignedY;
      this.pickDir(pac, ghosts);
    }
    const nc = this.tileCol + this.dir.dx;
    const nr = this.tileRow + this.dir.dy;
    if (this.aligned && !this.canWalkGhost(nc, nr)) {
      this.pickDir(pac, ghosts);
      return;
    }
    this.x += this.dir.dx * step;
    this.y += this.dir.dy * step;
    if (this.x < 0) this.x += W;
    if (this.x >= W) this.x -= W;
  }
  updateHouse(dt) {
    this.exitTimer = Math.max(0, this.exitTimer - dt);
    const houseStep = movePixels(this.speed * 0.6, dt);
    if (this.exitTimer > 0) {
      if (this.aligned) {
        this.x = this.alignedX;
        this.y = this.alignedY;
        if (this.tileRow <= 13) this.dir = { ...D };
        if (this.tileRow >= 15) this.dir = { ...U };
      }
      this.y += this.dir.dy * houseStep;
      return;
    }
    this.x = this.alignedX;
    this.y = this.alignedY;
    const col = this.tileCol;
    const row = this.tileRow;
    const action = getHouseExitAction(col, row);
    if (action.type === 'exit') {
      this.mode = SCATTER;
      this.syncSpeed();
      this.dir = { ...L };
      return;
    }
    if (action.type === 'horizontal') {
      this.dir = action.toward === 'right' ? { ...R } : { ...L };
    } else {
      this.dir = { ...U };
    }
    const nc = this.tileCol + this.dir.dx;
    const nr = this.tileRow + this.dir.dy;
    const cell = MAZE_DEF[nr]?.[((nc % COLS) + COLS) % COLS];
    if (cell === WALL) return;
    const exitStep = movePixels(this.speed, dt);
    this.x += this.dir.dx * exitStep;
    this.y += this.dir.dy * exitStep;
  }
  canWalkGhost(col, row) {
    return canWalkGhostAt(this.mode, col, row);
  }
  pickDir(pac, ghosts) {
    if (this.mode === FRIGHTENED) {
      const avail = DIRS.filter((d) => {
        if (d.dx === -this.dir.dx && d.dy === -this.dir.dy) return false;
        return this.canWalkGhost(this.tileCol + d.dx, this.tileRow + d.dy);
      });
      if (avail.length) this.dir = { ...avail[Math.floor(Math.random() * avail.length)] };
      return;
    }
    this.moveToward(this.getTarget(pac, ghosts));
  }
  moveToward(target) {
    const next = pickMoveToward(
      this.tileCol, this.tileRow, this.dir, target,
      (c, r) => this.canWalkGhost(c, r),
    );
    if (next) this.dir = next;
  }
  getTarget(pac, ghosts) {
    if (this.mode === SCATTER) return { col: this.scatterCol, row: this.scatterRow };
    const pc = { col: pac.tileCol, row: pac.tileRow };
    const pd = pac.dir;
    switch (this.name) {
      case 'blinky': return pc;
      case 'pinky': return { col: pc.col + pd.dx * 4, row: pc.row + pd.dy * 4 };
      case 'inky': {
        const blinky = ghosts.find((g) => g.name === 'blinky');
        const piv = { col: pc.col + pd.dx * 2, row: pc.row + pd.dy * 2 };
        if (!blinky) return pc;
        return { col: piv.col * 2 - blinky.tileCol, row: piv.row * 2 - blinky.tileRow };
      }
      case 'clyde': {
        const d = Math.hypot(this.tileCol - pc.col, this.tileRow - pc.row);
        return d > 8 ? pc : { col: this.scatterCol, row: this.scatterRow };
      }
      default: return pc;
    }
  }
  get flashing() {
    return this.mode === FRIGHTENED && this.frightTimer < FRIGHT_FLASH;
  }
  draw(ctx, t, { reduceMotion = false } = {}) {
    const r = CELL * 0.44;
    const { x, y } = this;
    let bodyColor = this.color;
    const flashMs = reduceMotion ? Infinity : GHOST_FLASH_INTERVAL_MS;
    if (this.mode === FRIGHTENED) {
      bodyColor = this.flashing && Math.floor(t / flashMs) % 2 ? '#ffffff' : '#0033ff';
    } else if (this.mode === EATEN) {
      this._drawEyes(ctx, x, y, r);
      return;
    }
    ctx.save();
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = bodyColor;
    const bR = r / 3;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 0, false);
    ctx.lineTo(x + r, y + r * 0.9);
    ctx.arc(x + r - bR, y + r * 0.9, bR, 0, Math.PI, false);
    ctx.arc(x, y + r * 0.9, bR, 0, Math.PI, false);
    ctx.arc(x - r + bR, y + r * 0.9, bR, 0, Math.PI, false);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (this.mode !== FRIGHTENED) {
      this._drawEyes(ctx, x, y, r);
    } else {
      this._drawScaredFace(ctx, x, y, r, bodyColor, t, flashMs);
    }
  }
  _drawEyes(ctx, x, y, r) {
    const eR = r * 0.26;
    const pR = r * 0.16;
    const lx = x - r * 0.35;
    const rx2 = x + r * 0.35;
    const ey = y - r * 0.1;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(lx, ey, eR, eR * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(rx2, ey, eR, eR * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    const pd = this.dir;
    ctx.fillStyle = this.mode === EATEN ? '#00BFFF' : '#0022BB';
    ctx.beginPath();
    ctx.arc(lx + pd.dx * pR * 0.6, ey + pd.dy * pR * 0.6, pR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx2 + pd.dx * pR * 0.6, ey + pd.dy * pR * 0.6, pR, 0, Math.PI * 2);
    ctx.fill();
  }
  _drawScaredFace(ctx, x, y, r, col, t, flashMs) {
    const flash = this.flashing && Math.floor(t / flashMs) % 2;
    const fc = flash ? col : 'white';
    ctx.fillStyle = fc;
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.1, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.35, y - r * 0.1, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = fc;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.45, y + r * 0.35);
    ctx.lineTo(x - r * 0.22, y + r * 0.2);
    ctx.lineTo(x, y + r * 0.35);
    ctx.lineTo(x + r * 0.22, y + r * 0.2);
    ctx.lineTo(x + r * 0.45, y + r * 0.35);
    ctx.stroke();
  }
}
