import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@` -> /src, enabling FSD-style public-API imports (e.g. @/shared/lib).
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
