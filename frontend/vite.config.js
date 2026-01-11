import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for React development
// This sets up hot module replacement and fast builds
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
