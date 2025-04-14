import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '651643b5-f36c-47c5-9ca2-2cb73fc89668-00-2rx7x4odjgivs.riker.replit.dev'
    ]
  }
});