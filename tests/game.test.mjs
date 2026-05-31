import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGame } from '../js/game.mjs';
import { EXTRA_LIFE_SCORE, FRUIT_SPAWN_DOTS } from '../js/core.mjs';

function mockDeps() {
  const hud = { update: vi.fn(), announce: vi.fn(), drawLives: vi.fn() };
  let fruitGetter = () => null;
  const renderer = {
    setMazeGetter: vi.fn(),
    setFruitGetter: vi.fn((fn) => { fruitGetter = fn; }),
    invalidateMaze: vi.fn(),
    addPopup: vi.fn(),
    updatePopups: vi.fn(),
    getFruit: () => fruitGetter(),
  };
  const audio = {
    start: vi.fn(),
    waka: vi.fn(),
    pellet: vi.fn(),
    eatGhost: vi.fn(),
    death: vi.fn(),
    levelUp: vi.fn(),
  };
  return { hud, renderer, audio };
}

describe('createGame', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: vi.fn(),
    });
  });

  it('initialise en title', () => {
    const { game } = createGame(mockDeps());
    game.init();
    expect(game.state).toBe('title');
    expect(game.level).toBe(1);
  });

  it('passe en ready apres startGame', () => {
    const { game } = createGame(mockDeps());
    game.init();
    game.startGame();
    expect(game.state).toBe('ready');
    expect(game.score).toBe(0);
  });

  it('levelComplete apres toutes les pastilles', () => {
    const deps = mockDeps();
    const { game } = createGame(deps);
    game.init();
    game.startGame();
    game.state = 'playing';
    game.dotsLeft = 1;
    game.eatDot(1, 1);
    expect(game.state).toBe('levelComplete');
  });

  it('accorde une vie bonus a 10000 points', () => {
    const deps = mockDeps();
    const { game, getPacman } = createGame(deps);
    game.init();
    game.startGame();
    game.state = 'playing';
    game.score = EXTRA_LIFE_SCORE;
    game.extraLifeGiven = false;
    const before = getPacman().lives;
    game.tryExtraLife();
    expect(getPacman().lives).toBe(before + 1);
    expect(deps.hud.drawLives).toHaveBeenCalled();
  });

  it('spawn un fruit apres 70 pastilles', () => {
    const deps = mockDeps();
    const { game } = createGame(deps);
    game.init();
    game.startGame();
    game.state = 'playing';
    game.totalDots = 244;
    game.dotsLeft = 244 - FRUIT_SPAWN_DOTS;
    game.fruitSpawned = false;
    game.trySpawnFruit();
    expect(deps.renderer.getFruit()).not.toBeNull();
    expect(deps.renderer.getFruit().points).toBeGreaterThan(0);
  });

  it('applique elroy quand peu de pastilles restent', () => {
    const deps = mockDeps();
    const { game, getGhosts } = createGame(deps);
    game.init();
    game.startGame();
    game.state = 'playing';
    game.dotsLeft = 15;
    game.applyElroy();
    const blinky = getGhosts().find((g) => g.name === 'blinky');
    expect(blinky.speed).toBeGreaterThan(1.8);
  });

  it('sync le HUD apres eatDot', () => {
    const deps = mockDeps();
    const { game } = createGame(deps);
    game.init();
    game.startGame();
    game.state = 'playing';
    game.eatDot(1, 1);
    expect(deps.hud.update).toHaveBeenCalled();
    expect(game.score).toBe(10);
  });
});
