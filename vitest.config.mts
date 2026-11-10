import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/renderer/clock-math.ts',
        'src/renderer/event-helpers.ts',
        'src/main/window-math.ts',
        'src/main/menu.ts',
        'src/main/config.ts'
      ]
    }
  }
});
