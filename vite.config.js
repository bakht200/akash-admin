import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from its own hostname: admin-staging.akashtherapies.com and, later,
// admin.akashtherapies.com — both on Firebase Hosting.
//
// This was previously '/adminportal/', targeting a subpath of the marketing domain on
// Cloudflare Pages. That is not reachable: akashtherapies.com resolves to the Lovable
// marketing site, so serving a path under it would require Lovable to host or proxy
// these files. Subdomains need nothing from that site — DNS records are keyed by name
// plus type, so `admin-staging` cannot affect the apex.
//
// App.jsx derives the router basename from import.meta.env.BASE_URL, so it follows this
// value automatically.
const BASE_PATH = '/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // The API listens on 4500 locally. This was 3000, which silently proxies to
      // nothing.
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
