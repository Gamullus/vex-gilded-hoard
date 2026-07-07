import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/vex-gilded-hoard/',
  plugins: [react()],
});
