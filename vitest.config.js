import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['js/core.mjs', 'js/entities.mjs', 'js/game.mjs'],
      thresholds: {
        lines: 35,
        functions: 35,
        branches: 30,
        perFile: true,
        'js/game.mjs': {
          lines: 25,
          functions: 25,
          branches: 20,
        },
      },
    },
  },
});
