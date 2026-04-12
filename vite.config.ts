/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
  server: {
    proxy: {
      // Rewrite /api/v1/* as same-origin in dev — no CORS headers needed
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // If `VITE_GRAPHQL_URL` is `/graphql` (root-mounted GraphQL server)
      '/graphql': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
