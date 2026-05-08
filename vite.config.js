import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..', 'C:/Users/Julius', 'C:/Users/Julius/AppData/Roaming/electron-pos-app']
    }
  }
})
