import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Força recarregamento em desenvolvimento
    hmr: {
      overlay: true
    },
    // Proxy para redirecionar requisições da API para o backend
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        ecma: 2020,
        passes: 1
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Adiciona hash único para cada build
    rollupOptions: {
      output: {
        // Hash único para cada arquivo
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        // Otimização de chunks simplificada e segura
        manualChunks: {
          // React e React-DOM juntos (necessário para funcionar)
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          
          // Router separado
          'react-router': ['react-router-dom'],
          
          // UI Libraries
          'ui-libs': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          
          // Framer Motion (pesado)
          'framer': ['framer-motion'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          
          // React Query
          'query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          
          // Forms
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          
          // Slick Carousel
          'carousel': ['react-slick', 'slick-carousel'],
        }
      }
    },
    // Força rebuild completo
    emptyOutDir: true,
    // Otimizações para evitar problemas de cache
    target: 'es2020', // ES2020 para melhor tree-shaking
    cssCodeSplit: true,
    // Aumenta o limite de aviso para chunks grandes
    chunkSizeWarningLimit: 600,
    // Otimizações adicionais
    cssMinify: true,
    reportCompressedSize: false, // Mais rápido em builds grandes
    assetsInlineLimit: 4096, // Inline de assets pequenos (4KB)
  },
  preview: {
    port: 4173,
    host: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  }
})
