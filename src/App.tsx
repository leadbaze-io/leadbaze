import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense } from 'react'
import { queryClient } from './lib/queryClient'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FaviconImage from './components/FaviconImage'
import LoadingScreen from './components/LoadingScreen'

// Lazy loading das páginas para code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GeradorLeads = lazy(() => import('./pages/GeradorLeads'))
const ListaDetalhes = lazy(() => import('./pages/ListaDetalhes'))
const DisparadorMassa = lazy(() => import('./pages/DisparadorMassa'))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
                  <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
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
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
          </div>
        </Router>
        
        {/* DevTools apenas em desenvolvimento */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App