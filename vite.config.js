import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/constitution-hub/', // Замените на имя вашего репозитория
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
