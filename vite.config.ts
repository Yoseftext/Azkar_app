import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('firebase')) return 'firebase-auth';
          if (id.includes('react-router') || id.includes('@remix-run/router')) return 'router-vendor';
          if (id.includes('react-dom') || id.includes('react/jsx-runtime') || /node_modules\/react\//.test(id)) return 'react-vendor';
          if (id.includes('zustand')) return 'state-vendor';
          return 'vendor';
        },
      },
    },
  },
});
