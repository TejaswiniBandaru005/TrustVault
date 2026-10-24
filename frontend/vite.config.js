import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react()],
    // Expose both VITE_ and BACKEND_ environment variables to the browser bundle
    envPrefix: ['VITE_', 'BACKEND_'],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || env.BACKEND_API_BASE_URL || env.VITE_API_BASE_URL || "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  }
})
