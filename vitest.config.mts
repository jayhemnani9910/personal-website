
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The "@/..." alias that tsconfig maps to ./src. Without it any test that
  // imports a component fails to resolve, which is why the suite could only
  // ever cover leaf modules using relative imports.
  resolve: {
    alias: { '@': new URL('./src/', import.meta.url).pathname },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
