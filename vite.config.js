import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:"/",
  server: {
    historyApiFallback: true, // ✅ Ensures refresh on deep routes works in dev
  },
})
