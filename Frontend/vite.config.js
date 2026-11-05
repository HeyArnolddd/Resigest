import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En desarrollo el API se sirve por el mismo origen: no hace falta CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
