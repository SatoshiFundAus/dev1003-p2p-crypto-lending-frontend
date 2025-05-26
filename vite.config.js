import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    cors: true,
    proxy: {
      // Optional: You can add a proxy if needed
      // '/api': {
      //   target: 'https://dev1003-p2p-crypto-lending-backend.onrender.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  }
})
