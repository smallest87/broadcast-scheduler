// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Tambahkan opsi base di sini:
  base: './', // Ini akan membuat semua path aset menjadi relatif
  build: {
    outDir: 'dist', // Pastikan output directory adalah 'dist'
  }
});