import { describe, it, expect } from 'vitest';
import {
  CELL,
  SPEED_PAC,
  SPEED_GHOST,
  EATEN,
  HOUSE,
  WALL,
  DOOR,
  isAlignedAt,
  canWalkAt,
  canWalkGhostAt,
  pickMoveToward,
  tileColFromX,
  alignedXY,
} from '../js/core.mjs';

describe('isAlignedAt', () => {
  it('est vrai au centre d une case', () => {
    const { x, y } = alignedXY(13, 29);
    expect(isAlignedAt(x, y, SPEED_PAC)).toBe(true);
  });

  it('permet la progression apres un pas (pas d oscillation)', () => {
    const { x, y } = alignedXY(13, 29);
    const x1 = x - SPEED_PAC;
    expect(isAlignedAt(x1, y, SPEED_PAC)).toBe(false);
  });
});

describe('canWalkGhostAt', () => {
  it('autorise DOOR en mode HOUSE et EATEN', () => {
    expect(canWalkGhostAt(HOUSE, 13, 12)).toBe(true);
    expect(canWalkGhostAt(EATEN, 13, 12)).toBe(true);
  });

  it('interdit le tunnel lateral aux fantomes actifs', () => {
    expect(canWalkGhostAt(HOUSE, 2, 14)).toBe(false);
    expect(canWalkGhostAt('chase', 25, 14)).toBe(false);
  });

  it('autorise le tunnel pour EATEN', () => {
    expect(canWalkGhostAt(EATEN, 2, 14)).toBe(true);
  });
});

describe('pickMoveToward', () => {
  it('autorise demi-tour en cul-de-sac', () => {
    const dir = { dx: 1, dy: 0 };
    const canWalk = (c, r) => c === 12 && r === 14;
    const next = pickMoveToward(13, 14, dir, { col: 13, row: 11 }, canWalk);
    expect(next).toEqual({ dx: -1, dy: 0, angle: Math.PI });
  });
});

describe('canWalkAt', () => {
  it('bloque les murs et la porte sans option door', () => {
    expect(canWalkAt(13, 12)).toBe(false);
    expect(canWalkAt(13, 12, { door: true })).toBe(true);
  });
});

describe('tileColFromX', () => {
  it('calcule la colonne au centre', () => {
    expect(tileColFromX(13 * CELL + CELL / 2)).toBe(13);
  });
});
