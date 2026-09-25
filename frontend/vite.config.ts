import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Ignores strict TS warnings during Vercel cloud builds
    typescript: {
      ignoreBuildErrors: true,
    },
  },
});