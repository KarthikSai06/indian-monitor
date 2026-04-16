import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'leaflet',
      'react-leaflet',
      'prop-types',
      'react-is',
      'recharts',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('framer-motion')) return 'framer';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
          }
        }
      },
    },
  },
})
