import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    rolldownOptions: {
      output: {
        // keep the lazy 3D scenes on their own; split the always-needed vendors so they cache well
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils|gsap|animejs)[\\/]/ },
            { name: 'ui', test: /node_modules[\\/](@radix-ui|lucide-react)[\\/]/ },
          ],
        },
      },
    },
  },
})
