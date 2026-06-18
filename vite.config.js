import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Keep relative paths active
  build: {
    // Highlight-start
    outDir: 'dist', // Changes output from 'dist' to 'release/dist'
    emptyOutDir: true       // Safely clears release/dist before building
    // Highlight-end
  },
  plugins: [
    // your plugins...
  ]
});