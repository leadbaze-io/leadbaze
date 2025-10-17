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
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 2, // Duas passadas de minificação para melhor compressão
        ecma: 2020,
        toplevel: true,
        unused: true,
        dead_code: true
      },
      mangle: {
        safari10: true, // Compatibilidade com Safari 10+
        toplevel: true
      },
      format: {
        comments: false, // Remove todos os comentários
        ecma: 2020
      }
    },
    // Adiciona hash único para cada build
    rollupOptions: {
      output: {
        // Hash único para cada arquivo
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        // Otimização avançada de chunks
        manualChunks: (id) => {
          // React core separado
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core'
          }
          
          // React Router separado
          if (id.includes('node_modules/react-router-dom/')) {
            return 'react-router'
          }
          
          // Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-ui'
          }
          
          // Tanstack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'tanstack-query'
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase'
          }
          
          // Framer Motion (pesado)
          if (id.includes('node_modules/framer-motion/')) {
            return 'framer-motion'
          }
          
          // Lucide Icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'lucide-icons'
          }
          
          // Swiper/Slick
          if (id.includes('node_modules/swiper/') || id.includes('node_modules/react-slick/') || id.includes('node_modules/slick-carousel/')) {
            return 'carousel'
          }
          
          // React Hook Form + validação
          if (id.includes('node_modules/react-hook-form/') || id.includes('node_modules/zod/') || id.includes('node_modules/@hookform/')) {
            return 'forms'
          }
          
          // Outras deps node_modules
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
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
