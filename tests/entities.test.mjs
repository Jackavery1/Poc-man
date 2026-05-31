import { describe, it, expect } from 'vitest';
import { Ghost } from '../js/entities.mjs';
import { SCATTER, CHASE, FRIGHTENED } from '../js/core.mjs';

describe('Ghost', () => {
  const pac = { tileCol: 13, tileRow: 29, dir: { dx: -1, dy: 0 } };

  it('blinky cible la position de Pac-Man en mode chase', () => {
    const g = new Ghost(13, 11, '#f00', 'blinky', 25, 0, 0);
    g.mode = CHASE;
    const t = g.getTarget(pac, [g]);
    expect(t.col).toBe(13);
    expect(t.row).toBe(29);
  });

  it('restaure le mode avant FRIGHTENED', () => {
    const g = new Ghost(13, 14, '#f00', 'pinky', 2, 0, 0);
    g.mode = CHASE;
    g.frighten();
    expect(g.mode).toBe(FRIGHTENED);
    expect(g.modeBeforeFright).toBe(CHASE);
    g.frightTimer = 0;
    g.update(pac, [g], 1);
    expect(g.mode).toBe(CHASE);
  });

  it('applique le multiplicateur de vitesse par niveau', () => {
    const g = new Ghost(13, 14, '#f00', 'pinky', 2, 0, 0);
    g.mode = SCATTER;
    g.setSpeedMul(1.1);
    expect(g.speed).toBeCloseTo(1.8 * 1.1, 5);
  });
});
