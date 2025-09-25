import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose additional env prefixes to client so existing .env.local keys work
  envPrefix: ['VITE_', 'LOOBITES_APP_', 'LOOBTITES_APP_'],
})
