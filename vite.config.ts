import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Força NODE_ENV=development
process.env.NODE_ENV = 'development'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    // Força recarregamento em desenvolvimento
    hmr: false, // Desabilita HMR para evitar muitas requisições via ngrok
    // Proxy para redirecionar requisições da API para o backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (_, options) => {
          console.log('🔧 Proxy configurado para:', options.target);
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // Adiciona hash único para cada build
    rollupOptions: {
      output: {
        // Hash único para cada arquivo
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
          utils: ['framer-motion', 'lucide-react']
        }
      }
    },
    // Força rebuild completo
    emptyOutDir: true,
    // Otimizações para evitar problemas de cache
    target: 'es2015',
    cssCodeSplit: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // Configurações para desenvolvimento
  define: {
    __DEV__: true
  }
})
