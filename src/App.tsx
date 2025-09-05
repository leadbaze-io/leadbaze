import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useEffect } from 'react'
import { queryClient } from './lib/queryClient'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import FaviconImage from './components/FaviconImage'
import LoadingScreen from './components/LoadingScreen'
import { Toaster } from './components/ui/toaster'

// Lazy loading das páginas para code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GeradorLeads = lazy(() => import('./pages/GeradorLeads'))
const ListaDetalhes = lazy(() => import('./pages/ListaDetalhes'))
const DisparadorMassa = lazy(() => import('./pages/DisparadorMassa'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogAutomationDashboard = lazy(() => import('./components/blog/BlogAutomationDashboard'))

// Componente principal que gerencia as classes de tema
function AppContent() {
  const location = useLocation()
  const { theme, isDark } = useTheme()
  
  useEffect(() => {
    const isLandingPage = location.pathname === '/'
    const isBlogPage = location.pathname.startsWith('/blog')
    
    console.log('🔄 Mudando rota:', location.pathname, 'isLandingPage:', isLandingPage, 'isBlogPage:', isBlogPage)
    
    if (isLandingPage || isBlogPage) {
      // Landing Page e Blog - sempre claros, forçar remoção da classe dark
      document.documentElement.classList.remove('dark')
      console.log('✅ Landing Page/Blog - classe dark forçadamente removida')
    } else {
      // Para outras páginas, restaurar o tema escolhido pelo usuário
      if (isDark) {
        document.documentElement.classList.add('dark')
        console.log('✅ Restaurando tema escuro escolhido pelo usuário')
      } else {
        document.documentElement.classList.remove('dark')
        console.log('✅ Restaurando tema claro escolhido pelo usuário')
      }
    }
  }, [location.pathname, theme, isDark])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <FaviconImage />
      <Navbar />
      
      <main className="flex-1">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gerador" element={<GeradorLeads />} />
            <Route path="/disparador" element={<DisparadorMassa />} />
            <Route path="/lista/:id" element={<ListaDetalhes />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/blog/sobre" element={<AboutPage />} />
            <Route path="/admin/blog-automation" element={<BlogAutomationDashboard />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
        
        {/* DevTools apenas em desenvolvimento */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        
        {/* Toaster para notificações */}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App