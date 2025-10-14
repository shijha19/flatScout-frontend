import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    // Optimize for Vercel
    chunkSizeWarningLimit: 1000,
    target: 'esnext'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
    },
  },
  preview: {
    port: 4173,
    host: true
  },
  define: {
    // Ensure environment variables are available at build time
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL)
  }
}));
