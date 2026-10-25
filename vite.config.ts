import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from the root of the custom domain investo.madebyfavor.com.
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2020',
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
