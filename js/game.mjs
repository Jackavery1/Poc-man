import {
  CELL, COLS, ROWS, L, SPEED_GHOST,
  DOT, PELLET, EMPTY,
  SCATTER, CHASE, FRIGHTENED, EATEN, HOUSE,
  MAZE_DEF,
  ghostEatPoints,
  speedMultiplierForLevel,
  entitiesCollide,
  shouldAwardExtraLife,
  shouldSpawnFruit,
  isElroyActive,
  fruitPointsForLevel,
  FRUIT_DURATION_MS,
  FRUIT_COL,
  FRUIT_ROW,
  ELROY_SPEED_MUL,
} from './core.mjs';
import { Pacman, Ghost } from './entities.mjs';

export function createGame({ audio, renderer, hud }) {
  let pacman;
  let ghosts;
  let maze = [];
  let fruit = null;

  renderer.setMazeGetter(() => maze);
  renderer.setFruitGetter(() => fruit);

  const game = {
    state: 'title',
    score: 0,
    hiScore: (() => {
      try {
        return Number(localStorage.getItem('pacmanHi')) || 0;
      } catch {
        return 0;
      }
    })(),
    level: 1,
    dotsLeft: 0,
    totalDots: 0,
    modeTimer: 0,
    modeIdx: 0,
    modeCycle: [7000, 20000, 7000, 20000, 5000, 20000, 5000, 1e9],
    ghostEatStreak: 0,
    readyTimer: 0,
    levelFlashTimer: 0,
    intermissionLevel: 1,
    extraLifeGiven: false,
    fruitSpawned: false,

    init() {
      pacman = new Pacman();
      ghosts = [
        new Ghost(13, 11, '#FF2222', 'blinky', 25, 0, 0),
        new Ghost(13, 14, '#FFB8FF', 'pinky', 2, 0, 2500),
        new Ghost(11, 14, '#00FFFF', 'inky', 27, 30, 5000),
        new Ghost(15, 14, '#FFB852', 'clyde', 0, 30, 8000),
      ];
      ghosts[0].mode = SCATTER;
      this.score = 0;
      this.level = 1;
      this.extraLifeGiven = false;
      this.resetLevel();
      this.state = 'title';
      this.syncHUD();
    },

    syncHUD() {
      hud.update({ score: this.score, hiScore: this.hiScore, level: this.level });
    },

    applyLevelSpeeds() {
      const mul = speedMultiplierForLevel(this.level);
      pacman.setSpeedMul(mul);
      ghosts.forEach((g) => g.setSpeedMul(mul));
      this.applyElroy();
    },

    applyElroy() {
      const blinky = ghosts.find((g) => g.name === 'blinky');
      if (!blinky || blinky.mode === EATEN || blinky.mode === HOUSE) return;
      if (isElroyActive(this.dotsLeft)) {
        blinky.speed = SPEED_GHOST * blinky.speedMul * ELROY_SPEED_MUL;
      } else {
        blinky.syncSpeed();
      }
    },

    resetLevel() {
      maze = MAZE_DEF.map((r) => [...r]);
      renderer.invalidateMaze();
      fruit = null;
      this.fruitSpawned = false;
      this.totalDots = 0;
      this.dotsLeft = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (maze[r][c] === DOT || maze[r][c] === PELLET) this.totalDots++;
        }
      }
      this.dotsLeft = this.totalDots;
      pacman.reset();
      ghosts.forEach((g) => g.reset());
      ghosts[0].mode = SCATTER;
      ghosts[0].x = 13 * CELL + CELL / 2;
      ghosts[0].y = 11 * CELL + CELL / 2;
      ghosts[0].dir = { ...L };
      this.applyLevelSpeeds();
      this.modeTimer = 0;
      this.modeIdx = 0;
      this.ghostEatStreak = 0;
      this.readyTimer = 2500;
      this.state = 'ready';
      renderer.drawLives(pacman);
      this.syncHUD();
    },

    startGame(focusGame) {
      audio.start();
      this.score = 0;
      this.level = 1;
      this.extraLifeGiven = false;
      this.resetLevel();
      if (focusGame) focusGame();
    },

    tryExtraLife() {
      if (!shouldAwardExtraLife(this.score, this.extraLifeGiven)) return;
      this.extraLifeGiven = true;
      pacman.lives++;
      renderer.drawLives(pacman);
      hud.announce(`Vie bonus ! Score ${this.score}`);
    },

    saveHiScore() {
      if (this.score <= this.hiScore) return;
      this.hiScore = this.score;
      try {
        localStorage.setItem('pacmanHi', String(this.hiScore));
      } catch {
        /* quota / mode prive */
      }
    },

    spawnFruit() {
      const points = fruitPointsForLevel(this.level);
      fruit = {
        col: FRUIT_COL,
        row: FRUIT_ROW,
        x: FRUIT_COL * CELL + CELL / 2,
        y: FRUIT_ROW * CELL + CELL / 2,
        points,
        timer: FRUIT_DURATION_MS,
        color: ['#FF4444', '#FF88CC', '#44FF88', '#FFDD44'][(this.level - 1) % 4],
      };
      this.fruitSpawned = true;
    },

    trySpawnFruit() {
      if (shouldSpawnFruit(this.totalDots, this.dotsLeft, !!fruit, this.fruitSpawned)) {
        this.spawnFruit();
      }
    },

    eatFruit() {
      if (!fruit) return;
      this.score += fruit.points;
      renderer.addPopup(fruit.x, fruit.y, `${fruit.points}`, '#FFD700');
      audio.pellet();
      fruit = null;
      this.tryExtraLife();
      this.saveHiScore();
      this.syncHUD();
    },

    eatDot(col, row) {
      const t = maze[row][col];
      if (t !== DOT && t !== PELLET) return;
      maze[row][col] = EMPTY;
      renderer.invalidateMaze();
      this.dotsLeft--;
      if (t === DOT) {
        this.score += 10;
        audio.waka();
      } else {
        this.score += 50;
        audio.pellet();
        this.ghostEatStreak = 0;
        ghosts.forEach((g) => g.frighten());
      }
      this.trySpawnFruit();
      this.applyElroy();
      this.tryExtraLife();
      this.saveHiScore();
      this.syncHUD();
      if (this.dotsLeft <= 0) {
        this.intermissionLevel = this.level;
        this.state = 'levelComplete';
        this.levelFlashTimer = 3500;
        audio.levelUp();
      }
    },

    checkFruitCollision() {
      if (!fruit || this.state !== 'playing' || !pacman.aligned) return;
      if (pacman.tileCol === fruit.col && pacman.tileRow === fruit.row) {
        this.eatFruit();
      } else if (entitiesCollide(pacman.x, pacman.y, fruit.x, fruit.y)) {
        this.eatFruit();
      }
    },

    checkCollisions() {
      if (this.state !== 'playing') return;
      for (const g of ghosts) {
        if (!entitiesCollide(pacman.x, pacman.y, g.x, g.y)) continue;
        if (g.mode === FRIGHTENED) {
          g.eatMe();
          this.ghostEatStreak++;
          const pts = ghostEatPoints(this.ghostEatStreak);
          this.score += pts;
          audio.eatGhost(this.ghostEatStreak - 1);
          renderer.addPopup(g.x, g.y, `${pts}`, pts >= 800 ? '#FFD700' : '#ffffff');
          this.tryExtraLife();
          this.saveHiScore();
          this.syncHUD();
        } else if (g.mode !== EATEN && g.mode !== HOUSE) {
          this.die();
          return;
        }
      }
    },

    die() {
      this.state = 'dying';
      pacman.dying = true;
      audio.death();
      setTimeout(() => {
        pacman.lives--;
        renderer.drawLives(pacman);
        if (pacman.lives <= 0) {
          this.state = 'gameOver';
          hud.announce(`Fin de partie. Score ${this.score}`);
        } else {
          this.resetLevel();
        }
      }, 2200);
    },

    updateFruit(dt) {
      if (!fruit) return;
      fruit.timer -= dt;
      if (fruit.timer <= 0) fruit = null;
    },

    update(dt) {
      if (this.state === 'ready') {
        this.readyTimer -= dt;
        if (this.readyTimer <= 0) this.state = 'playing';
        return;
      }
      if (this.state === 'levelComplete') {
        this.levelFlashTimer -= dt;
        if (this.levelFlashTimer <= 0) {
          this.level++;
          this.resetLevel();
        }
        return;
      }
      if (this.state !== 'playing') {
        if (this.state === 'dying') pacman.update(dt);
        return;
      }
      this.modeTimer += dt;
      const cycleDur = this.modeCycle[this.modeIdx] || 1e9;
      if (this.modeTimer >= cycleDur) {
        this.modeTimer = 0;
        this.modeIdx = Math.min(this.modeIdx + 1, this.modeCycle.length - 1);
        ghosts.forEach((g) => {
          if (g.mode === SCATTER) g.mode = CHASE;
          else if (g.mode === CHASE) g.mode = SCATTER;
        });
      }
      this.updateFruit(dt);
      pacman.update(dt);
      ghosts.forEach((g) => g.update(pacman, ghosts, dt));
      this.applyElroy();
      renderer.updatePopups(dt);
      if (pacman.aligned) {
        const tc = pacman.tileCol;
        const tr = pacman.tileRow;
        if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) this.eatDot(tc, tr);
      }
      this.checkFruitCollision();
      this.checkCollisions();
    },
  };

  return {
    game,
    getPacman: () => pacman,
    getGhosts: () => ghosts,
  };
}
