import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['js/core.mjs', 'js/entities.mjs'],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 35,
      },
    },
  },
});
