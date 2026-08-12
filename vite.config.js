import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from admin-staging.akashtherapies.com and admin.akashtherapies.com.
// App.jsx reads its router basename from import.meta.env.BASE_URL, so it follows this.
const BASE_PATH = '/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // The API listens on 4500.
    proxy: {
      '/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4500',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
