import { defineConfig } from 'vite'

export default defineConfig({
  base: '/teachers/',
  build: {
    outDir: '../dist/teachers',
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
})
