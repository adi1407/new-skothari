import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on every interface so phones on the same Wi‑Fi can open http://<PC-LAN-IP>:5280/
    host: "0.0.0.0",
    port: 5280,
    proxy: {
      "/api": { target: "http://localhost:5050", changeOrigin: true },
      "/uploads": { target: "http://localhost:5050", changeOrigin: true },
    },
  },
})
