import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // <-- Ubah menjadi '/' atau hapus baris ini (defaultnya '/')
  build: {
    outDir: 'dist',
  },
});