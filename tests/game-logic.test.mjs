import { describe, it, expect } from 'vitest';
import {
  ghostEatPoints,
  speedMultiplierForLevel,
  movePixels,
  FRAME_MS,
  fruitPointsForLevel,
  shouldAwardExtraLife,
  entitiesCollide,
  dotsEaten,
  shouldSpawnFruit,
  isElroyActive,
  cellAt,
  tileRowFromY,
  CELL,
} from '../js/core.mjs';

describe('ghostEatPoints', () => {
  it('combo 200, 400, 800', () => {
    expect(ghostEatPoints(1)).toBe(200);
    expect(ghostEatPoints(2)).toBe(400);
    expect(ghostEatPoints(3)).toBe(800);
  });
});

describe('speedMultiplierForLevel', () => {
  it('augmente avec le niveau', () => {
    expect(speedMultiplierForLevel(1)).toBe(1);
    expect(speedMultiplierForLevel(2)).toBe(1.05);
    expect(speedMultiplierForLevel(10)).toBe(1.35);
  });
});

describe('movePixels', () => {
  it('a 60 fps equivaut a speed par frame', () => {
    expect(movePixels(2, FRAME_MS)).toBeCloseTo(2, 5);
  });
});

describe('fruitPointsForLevel', () => {
  it('retourne des scores croissants', () => {
    expect(fruitPointsForLevel(1)).toBe(100);
    expect(fruitPointsForLevel(8)).toBe(5000);
  });
});

describe('shouldAwardExtraLife', () => {
  it('une seule fois a 10000', () => {
    expect(shouldAwardExtraLife(10000, false)).toBe(true);
    expect(shouldAwardExtraLife(10000, true)).toBe(false);
  });
});

describe('entitiesCollide', () => {
  it('detecte la collision au centre', () => {
    expect(entitiesCollide(0, 0, 0, 0)).toBe(true);
    expect(entitiesCollide(0, 0, 100, 100)).toBe(false);
  });
});

describe('shouldSpawnFruit', () => {
  it('apres 70 pastilles mangees', () => {
    expect(shouldSpawnFruit(244, 174, false, false)).toBe(true);
    expect(shouldSpawnFruit(244, 200, false, false)).toBe(false);
    expect(shouldSpawnFruit(244, 174, true, false)).toBe(false);
  });
});

describe('isElroyActive', () => {
  it('sous 20 pastilles restantes', () => {
    expect(isElroyActive(20)).toBe(true);
    expect(isElroyActive(21)).toBe(false);
  });
});

describe('cellAt', () => {
  it('lit une case du labyrinthe', () => {
    expect(cellAt(1, 1)).toBe(0);
    expect(cellAt(0, 0)).toBe(1);
  });
});

describe('tileRowFromY', () => {
  it('calcule la ligne au centre', () => {
    expect(tileRowFromY(29 * CELL + CELL / 2)).toBe(29);
  });
});

describe('dotsEaten', () => {
  it('compte les pastilles consommees', () => {
    expect(dotsEaten(100, 30)).toBe(70);
  });
});
