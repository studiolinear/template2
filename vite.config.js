import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    // Run `npm run dev:server` in a second terminal to test the API locally.
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: { outDir: 'dist' },
});
