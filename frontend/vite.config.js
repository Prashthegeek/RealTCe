// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {   //means /api se koi bhi request aaye , then use the backend /server for that.
//         target: 'http://localhost:5000', // Your backend URL
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ''),   // Optional: remove /api prefix
//       },
//     },
//   },
// });


// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // The target for API requests
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' prefix from the request before forwarding
      },
    },
  },
})
