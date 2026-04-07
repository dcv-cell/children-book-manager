import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  // GitHub Pages 部署配置
  base: '/children-book-manager/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
