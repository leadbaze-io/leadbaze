import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useEffect, memo } from 'react'
import { queryClient } from './lib/queryClient'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import { Toaster } from './components/ui/toaster'
import { ActiveCampaignManager } from './components/ActiveCampaignManager'
import { ActiveCampaignProvider } from './contexts/ActiveCampaignContext'
import MetaPixelProvider from './components/MetaPixelProvider'
import { setupExtensionErrorHandler } from './utils/extensionErrorHandler'
import './utils/analyticsErrorInterceptor'

// Lazy loading das páginas para code splitting otimizado
// Páginas principais - carregamento prioritário
const LandingPage = lazy(() => import(/* webpackChunkName: "landing" */ './pages/LandingPage'))
const LoginPage = lazy(() => import(/* webpackChunkName: "login" */ './pages/LoginPage'))
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/Dashboard'))

// Páginas de funcionalidades - carregamento sob demanda
const GeradorLeads = lazy(() => import(/* webpackChunkName: "gerador" */ './pages/GeradorLeads'))
const ListaDetalhes = lazy(() => import(/* webpackChunkName: "lista" */ './pages/ListaDetalhes'))
const NewDisparadorMassa = lazy(() => import(/* webpackChunkName: "disparador" */ './pages/NewDisparadorMassa'))

// Blog - carregamento separado
const BlogPage = lazy(() => import(/* webpackChunkName: "blog" */ './pages/BlogPage'))
const BlogPostPage = lazy(() => import(/* webpackChunkName: "blog-post" */ './pages/BlogPostPage'))
const AboutPage = lazy(() => import(/* webpackChunkName: "about" */ './pages/AboutPage'))
const BlogAutomationDashboard = lazy(() => import(/* webpackChunkName: "blog-admin" */ './components/blog/BlogAutomationDashboard'))

// Páginas de perfil e planos
const UserProfile = lazy(() => import(/* webpackChunkName: "profile" */ './pages/UserProfile'))
const PlansPage = lazy(() => import(/* webpackChunkName: "plans" */ './pages/PlansPage'))

// Páginas de pagamento - baixa prioridade
const PaymentSuccess = lazy(() => import(/* webpackChunkName: "payment" */ './pages/PaymentSuccess'))
const PaymentFailure = lazy(() => import(/* webpackChunkName: "payment" */ './pages/PaymentFailure'))
const SubscriptionSuccess = lazy(() => import(/* webpackChunkName: "subscription" */ './pages/SubscriptionSuccess'))
const SubscriptionCancel = lazy(() => import(/* webpackChunkName: "subscription" */ './pages/SubscriptionCancel'))

// Páginas de teste - mínima prioridade
const ModalTestPage = lazy(() => import(/* webpackChunkName: "test" */ './pages/ModalTestPage'))
const AuthCallback = lazy(() => import(/* webpackChunkName: "auth" */ './pages/AuthCallback'))
const SMTPTestPage = lazy(() => import(/* webpackChunkName: "test" */ './pages/SMTPTestPage'))
const ToastDemo = lazy(() => import(/* webpackChunkName: "test" */ './pages/ToastDemo'))

// Componente principal que gerencia as classes de tema - Memoizado
const AppContent = memo(function AppContent() {
  // Configurar handler de erros de extensões
  useEffect(() => {
    setupExtensionErrorHandler()
  }, [])
  
  // ThemeContext já gerencia o modo claro/escuro automaticamente baseado na rota

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
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
})

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