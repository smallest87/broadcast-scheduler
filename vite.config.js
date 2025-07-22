// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Jika Anda selalu deploy ke /siaran/, Anda bisa set ini:
  base: '/siaran/', // <-- Opsional: jika deploy selalu di /siaran/
  // Atau tetap './' jika Anda ingin lebih fleksibel untuk subfolder lain
  // base: './', // <-- Ini lebih fleksibel untuk deploy ke subfolder mana saja
  build: {
    outDir: 'dist',
  }
});