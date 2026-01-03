import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/webview',
    rollupOptions: {
      input: 'src/webview/main.tsx',
      output: {
        entryFileNames: `main.js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `main.[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/webview"),
    },
  },
});
