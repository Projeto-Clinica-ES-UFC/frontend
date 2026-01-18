import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxying separate resource endpoints to backend
      '/users': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/patients': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/appointments': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
      '/professionals': { target: 'http://localhost:3000', changeOrigin: true, secure: false },
    },
  },
})
