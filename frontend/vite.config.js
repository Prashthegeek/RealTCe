
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://rtct.onrender.com',        //'http://localhost:5000', // The target for API requests
        target: 'http://13.61.241.125:5000', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' prefix from the request before forwarding
      },
    },
  },
})
