import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3200',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://127.0.0.1:3200',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../client/dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000
  }
})
