import {
  CELL, COLS, ROWS, L,
  DOT, PELLET, EMPTY,
  SCATTER, CHASE, FRIGHTENED, EATEN, HOUSE,
  MAZE_DEF,
} from './core.mjs';
import { Pacman, Ghost } from './entities.mjs';

export function createGame({ audio, renderer }) {
  let pacman;
  let ghosts;
  let maze = [];

  renderer.setMazeGetter(() => maze);

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
    lastTime: 0,

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
      this.resetLevel();
      this.state = 'title';
      this.updateHUD();
    },

    resetLevel() {
      maze = MAZE_DEF.map((r) => [...r]);
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
      this.modeTimer = 0;
      this.modeIdx = 0;
      this.ghostEatStreak = 0;
      this.readyTimer = 2500;
      this.state = 'ready';
      renderer.drawLives(pacman);
      this.updateHUD();
    },

    startGame(focusGame) {
      audio.start();
      this.score = 0;
      this.level = 1;
      this.resetLevel();
      if (focusGame) focusGame();
    },

    eatDot(col, row) {
      const t = maze[row][col];
      if (t !== DOT && t !== PELLET) return;
      maze[row][col] = EMPTY;
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
      if (this.score > this.hiScore) {
        this.hiScore = this.score;
        localStorage.setItem('pacmanHi', this.hiScore);
      }
      this.updateHUD();
      if (this.dotsLeft <= 0) {
        this.state = 'levelComplete';
        this.levelFlashTimer = 3500;
        audio.levelUp();
      }
    },

    checkCollisions() {
      if (this.state !== 'playing') return;
      for (const g of ghosts) {
        const dx = g.x - pacman.x;
        const dy = g.y - pacman.y;
        if (dx * dx + dy * dy < (CELL * 0.72) ** 2) {
          if (g.mode === FRIGHTENED) {
            g.eatMe();
            this.ghostEatStreak++;
            const pts = 200 * 2 ** (this.ghostEatStreak - 1);
            this.score += pts;
            audio.eatGhost(this.ghostEatStreak - 1);
            renderer.addPopup(g.x, g.y, `${pts}`, pts >= 800 ? '#FFD700' : '#ffffff');
            this.updateHUD();
          } else if (g.mode !== EATEN && g.mode !== HOUSE) {
            this.die();
            return;
          }
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
          const ann = document.getElementById('announcer');
          if (ann) ann.textContent = `Game Over. Score ${this.score}`;
        } else {
          this.resetLevel();
        }
      }, 2200);
    },

    updateHUD() {
      document.getElementById('hud-score').textContent = this.score;
      document.getElementById('hud-hi').textContent = this.hiScore;
      document.getElementById('hud-level').textContent = this.level;
      const ann = document.getElementById('announcer');
      if (ann) ann.textContent = `Score ${this.score}, niveau ${this.level}`;
    },

    update(dt) {
      if (this.state === 'ready') {
        this.readyTimer -= dt;
        if (this.readyTimer <= 0) this.state = 'playing';
        pacman.update();
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
        if (this.state === 'dying') pacman.update();
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
      pacman.update();
      ghosts.forEach((g) => g.update(pacman, ghosts, dt));
      renderer.updatePopups(dt);
      if (pacman.aligned) {
        const tc = pacman.tileCol;
        const tr = pacman.tileRow;
        if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) this.eatDot(tc, tr);
      }
      this.checkCollisions();
    },
  };

  return {
    game,
    getPacman: () => pacman,
    getGhosts: () => ghosts,
  };
}
