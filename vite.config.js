import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,        // Recommended for most backends
        secure: false,
      },
      '/images': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir: './Ecommerce-backend-ai-main',   // Fixed typo + removed trailing slash
    emptyOutDir: true                        // Safely clear the folder before build
  }
})