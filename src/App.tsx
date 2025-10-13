import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useEffect } from 'react'
import { queryClient } from './lib/queryClient'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import FaviconImage from './components/FaviconImage'
import LoadingScreen from './components/LoadingScreen'
import { Toaster } from './components/ui/toaster'
import { ActiveCampaignManager } from './components/ActiveCampaignManager'
import { ActiveCampaignProvider } from './contexts/ActiveCampaignContext'
import MetaPixelProvider from './components/MetaPixelProvider'
import { setupExtensionErrorHandler } from './utils/extensionErrorHandler'
import './utils/analyticsErrorInterceptor'

// Lazy loading das páginas para code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GeradorLeads = lazy(() => import('./pages/GeradorLeads'))
const ListaDetalhes = lazy(() => import('./pages/ListaDetalhes'))
const NewDisparadorMassa = lazy(() => import('./pages/NewDisparadorMassa'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogAutomationDashboard = lazy(() => import('./components/blog/BlogAutomationDashboard'))
const ModalTestPage = lazy(() => import('./pages/ModalTestPage'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const SMTPTestPage = lazy(() => import('./pages/SMTPTestPage'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const PlansPage = lazy(() => import('./pages/PlansPage'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'))
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'))
const SubscriptionCancel = lazy(() => import('./pages/SubscriptionCancel'))
const ToastDemo = lazy(() => import('./pages/ToastDemo'))

// Componente principal que gerencia as classes de tema
function AppContent() {
  // Configurar handler de erros de extensões
  useEffect(() => {
    setupExtensionErrorHandler()
  }, [])
  
  // ThemeContext já gerencia o modo claro/escuro automaticamente baseado na rota

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
            <Route path="/disparador" element={<NewDisparadorMassa />} />
            <Route path="/disparador-novo" element={<NewDisparadorMassa />} />
            <Route path="/lista/:id" element={<ListaDetalhes />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/blog/sobre" element={<AboutPage />} />
            <Route path="/admin/blog-automation" element={<BlogAutomationDashboard />} />
            <Route path="/test-modals" element={<ModalTestPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/test-smtp" element={<SMTPTestPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentSuccess />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
            <Route path="/toast-demo" element={<ToastDemo />} />
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
        <ActiveCampaignProvider>
          <Router>
            <MetaPixelProvider>
              <AppContent />
            </MetaPixelProvider>
          </Router>
          
          {/* DevTools apenas em desenvolvimento */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          
          {/* Toaster para notificações */}
          <Toaster />
          
          {/* Gerenciador global de campanhas ativas */}
          <ActiveCampaignManager />
        </ActiveCampaignProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App