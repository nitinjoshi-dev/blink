import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.jsx'),
        dashboard: resolve(__dirname, 'src/dashboard/index.jsx'),
        search: resolve(__dirname, 'src/search/index.jsx'),
        'search-overlay': resolve(__dirname, 'src/search-overlay/search-overlay.js'),
        background: resolve(__dirname, 'src/background/background.js'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },

  server: {
    port: 5173,
    strictPort: false,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
