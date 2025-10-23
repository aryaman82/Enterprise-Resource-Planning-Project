import { defineConfig } from 'vite'
import path from 'path'

// Vite config for the public/ React app. This adds simple aliases used by the source
export default defineConfig({
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'components'),
      pages: path.resolve(__dirname, 'pages'),
      'pages/employee': path.resolve(__dirname, 'pages/employee'),
    }
  }
})
