import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://akashtherapies.com/adminportal
const BASE_PATH = '/adminportal/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: `dist${BASE_PATH}`,
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
