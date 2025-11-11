import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Исправление для локальной разработки: проксируем запросы к бэкенду
  server: {
    proxy: {
      // Прокси для API запросов (HTTP)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Прокси для WebSocket соединений
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    }
  },
  // Исправление для Vercel Build: помогаем Vite найти 'simple-peer'
  optimizeDeps: {
    include: ['simple-peer'],
  },
})
