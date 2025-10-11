import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,               // your frontend runs at 3000
    proxy: {
      '/api': 'http://localhost:8080', // proxy API to Spring Boot
    },
  },
});