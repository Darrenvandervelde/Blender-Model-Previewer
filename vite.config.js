import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: process.env.VITE_BUILD_WEB ? [] : [
    // Electron plugins for desktop builds
  ]
});
