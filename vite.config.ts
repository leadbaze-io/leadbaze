import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Plugin para fazer CSS não bloquear renderização
function cssAsyncPlugin() {
  return {
    name: 'css-async',
    transformIndexHtml(html: string) {
      // Modificar links CSS para não bloquear
      return html.replace(
        /<link([^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*index-[^"']*\.css["'][^>]*)>/gi,
        (match, attrs) => {
          // Se já tem media ou onload, não modificar
          if (attrs.includes('media=') || attrs.includes('onload=')) {
            return match
          }
          // Adicionar media="print" e onload para carregar assíncrono
          return `<link${attrs} media="print" onload="this.media='all'" onerror="this.media='all'">`
        }
      )
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cssAsyncPlugin()],
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
        drop_console: true, // Remover console em produção para reduzir tamanho
        drop_debugger: true,
        ecma: 2020,
        passes: 3, // Mais passes para melhor compressão e tree-shaking
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'], // Remover logs
        unused: true, // Remover código não utilizado
        unsafe: false, // Desabilitar otimizações unsafe para evitar quebras
        unsafe_comps: false,
        unsafe_math: false,
        dead_code: true // Remover código morto
      },
      mangle: {
        safari10: true,
        toplevel: false // Não mangle variáveis de topo para evitar quebras
      },
      format: {
        comments: false
      }
    },
    // Força rebuild completo
    emptyOutDir: true,
    // Otimizações para evitar problemas de cache
    target: 'es2020', // ES2020 para melhor tree-shaking
    cssCodeSplit: true,
    // Aumenta o limite de aviso para chunks grandes
    chunkSizeWarningLimit: 500,
    // Otimizações adicionais
    cssMinify: true,
    reportCompressedSize: false, // Mais rápido em builds grandes
    assetsInlineLimit: 4096, // Inline de assets pequenos (4KB)
    // Otimização de chunks para reduzir tamanho
           rollupOptions: {
             output: {
               // Hash único para cada arquivo
               entryFileNames: `assets/[name]-[hash].js`,
               chunkFileNames: `assets/[name]-[hash].js`,
               assetFileNames: `assets/[name]-[hash].[ext]`,
               // Inline CSS crítico quando possível
               inlineDynamicImports: false,
               // Otimização de chunks - React e React-DOM devem estar juntos
               manualChunks: {
                 // React e React-DOM JUNTOS (essencial para funcionar)
                 'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
                 
                 // Router separado
                 'react-router': ['react-router-dom'],
                 
                 // Framer Motion separado (pesado)
                 'framer': ['framer-motion'],
                 
                 // Supabase separado
                 'supabase': ['@supabase/supabase-js'],
                 
                 // React Query
                 'query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
                 
                 // UI Libraries (Radix UI)
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
                 
                 // Forms
                 'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
                 
                 // Carousel
                 'carousel': ['react-slick', 'slick-carousel'],
               }
      }
    },
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    cors: true,
    // Compressão gzip para melhorar performance
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  }
})
