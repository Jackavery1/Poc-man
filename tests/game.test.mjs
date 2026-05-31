import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGame } from '../js/game.mjs';

function mockDeps() {
  const hud = { update: vi.fn(), announce: vi.fn() };
  const renderer = {
    setMazeGetter: vi.fn(),
    setFruitGetter: vi.fn(),
    invalidateMaze: vi.fn(),
    drawLives: vi.fn(),
    addPopup: vi.fn(),
    updatePopups: vi.fn(),
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
});
