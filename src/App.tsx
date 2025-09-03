import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, Suspense, useEffect } from 'react'
import { queryClient } from './lib/queryClient'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
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

// Componente de teste temporário
function ThemeTest() {
  const { theme, setTheme, isDark } = useTheme()
  
  const testTheme = () => {
    const html = document.documentElement
    console.log('🧪 Teste de tema:')
    console.log('- HTML classes:', html.classList.toString())
    console.log('- Contém dark:', html.classList.contains('dark'))
    console.log('- Tema atual:', theme)
    console.log('- isDark:', isDark)
    
    // Teste manual de classes
    const testDiv = document.getElementById('theme-test')
    if (testDiv) {
      testDiv.className = 'p-4 border rounded bg-white dark:bg-gray-800 text-black dark:text-white'
      console.log('- Classes aplicadas ao teste:', testDiv.className)
    }
  }
  
  const forceLightMode = () => {
    document.documentElement.classList.remove('dark')
    console.log('🔧 Forçando modo claro')
    testTheme()
  }
  
  const forceDarkMode = () => {
    document.documentElement.classList.add('dark')
    console.log('🔧 Forçando modo escuro')
    testTheme()
  }
  
  const testTailwindClasses = () => {
    console.log('🧪 Testando classes Tailwind:')
    
    // Criar um elemento de teste
    const testElement = document.createElement('div')
    testElement.className = 'bg-white dark:bg-gray-800 text-black dark:text-white p-4 border rounded'
    testElement.textContent = 'Teste Tailwind - Deve mudar de cor'
    testElement.style.position = 'fixed'
    testElement.style.top = '200px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    
    document.body.appendChild(testElement)
    
    // Remover após 5 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 5000)
    
    console.log('- Elemento de teste criado com classes:', testElement.className)
  }
  
  const testTailwindV4 = () => {
    console.log('🧪 Testando Tailwind v4:')
    
    // Teste com classes básicas do Tailwind v4
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 bg-blue-500 text-white rounded shadow-lg'
    testElement.textContent = 'Teste Tailwind v4 - Deve ser azul com texto branco'
    testElement.style.position = 'fixed'
    testElement.style.top = '250px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    
    document.body.appendChild(testElement)
    
    // Remover após 5 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 5000)
    
    console.log('- Elemento de teste v4 criado com classes:', testElement.className)
  }
  
  const testDarkModeCSS = () => {
    console.log('🧪 Testando Dark Mode CSS:')
    
    // Teste específico para dark mode
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 border rounded bg-white dark:bg-gray-800 text-black dark:text-white'
    testElement.textContent = 'Teste Dark Mode - Deve mudar de cor quando alternar tema'
    testElement.style.position = 'fixed'
    testElement.style.top = '300px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    testElement.style.minWidth = '300px'
    
    document.body.appendChild(testElement)
    
    // Remover após 10 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 10000)
    
    console.log('- Elemento de teste dark mode criado com classes:', testElement.className)
  }
  
  const testCustomCSSVariables = () => {
    console.log('🧪 Testando Variáveis CSS Customizadas:')
    
    // Teste específico para as variáveis CSS customizadas
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 border rounded bg-card text-foreground'
    testElement.innerHTML = `
      <div class="mb-2">
        <strong>Teste Variáveis CSS:</strong>
      </div>
      <div class="bg-background p-2 rounded mb-2">bg-background</div>
      <div class="bg-card p-2 rounded mb-2">bg-card</div>
      <div class="text-foreground p-2 rounded mb-2">text-foreground</div>
      <div class="text-muted-foreground p-2 rounded mb-2">text-muted-foreground</div>
      <div class="border-border p-2 rounded">border-border</div>
    `
    testElement.style.position = 'fixed'
    testElement.style.top = '350px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    testElement.style.minWidth = '300px'
    
    document.body.appendChild(testElement)
    
    // Remover após 15 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 15000)
    
    console.log('- Elemento de teste variáveis CSS criado com classes:', testElement.className)
  }
  
  const testGradients = () => {
    console.log('🧪 Testando Gradientes:')
    
    // Teste específico para os gradientes problemáticos
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 border rounded'
    testElement.innerHTML = `
      <div class="mb-2">
        <strong>Teste Gradientes:</strong>
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded mb-2">
        from-blue-50 to-purple-50
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3 rounded mb-2">
        from-blue-50 to-indigo-50
      </div>
      <div class="bg-blue-50 dark:bg-blue-950 p-3 rounded mb-2">
        bg-blue-50
      </div>
      <div class="border border-blue-200 dark:border-blue-800 p-3 rounded">
        border-blue-200
      </div>
    `
    testElement.style.position = 'fixed'
    testElement.style.top = '400px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    testElement.style.minWidth = '300px'
    
    document.body.appendChild(testElement)
    
    // Remover após 20 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 20000)
    
    console.log('- Elemento de teste gradientes criado com classes:', testElement.className)
  }
  
  const testNewGradientColors = () => {
    console.log('🧪 Testando Novas Cores dos Gradientes:')
    
    // Teste específico para as novas cores dos gradientes
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 border rounded'
    testElement.innerHTML = `
      <div class="mb-2">
        <strong>Teste Novas Cores dos Gradientes:</strong>
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded mb-2 text-white">
        from-blue-50 to-purple-50 (NOVO)
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3 rounded mb-2 text-white">
        from-blue-50 to-indigo-50 (NOVO)
      </div>
      <div class="bg-blue-50 dark:bg-blue-950 p-3 rounded mb-2 text-white">
        bg-blue-50 (NOVO)
      </div>
      <div class="border border-blue-200 dark:border-blue-800 p-3 rounded text-white">
        border-blue-200 (NOVO)
      </div>
    `
    testElement.style.position = 'fixed'
    testElement.style.top = '450px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    testElement.style.minWidth = '300px'
    
    document.body.appendChild(testElement)
    
    // Remover após 25 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 25000)
    
    console.log('- Elemento de teste novas cores dos gradientes criado com classes:', testElement.className)
  }
  
  const testNeutralGradientColors = () => {
    console.log('🧪 Testando Cores Neutras dos Gradientes:')
    
    // Teste específico para as novas cores neutras dos gradientes
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 border rounded'
    testElement.innerHTML = `
      <div class="mb-2">
        <strong>Teste Cores Neutras dos Gradientes:</strong>
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded mb-2 text-white">
        from-blue-50 to-purple-50 (NEUTRO)
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3 rounded mb-2 text-white">
        from-blue-50 to-indigo-50 (NEUTRO)
      </div>
      <div class="bg-blue-50 dark:bg-blue-950 p-3 rounded mb-2 text-white">
        bg-blue-50 (NEUTRO)
      </div>
      <div class="border border-blue-200 dark:border-blue-800 p-3 rounded text-white">
        border-blue-200 (NEUTRO)
      </div>
      <div class="text-blue-600 dark:text-blue-600 p-3 rounded bg-gray-800 mt-2">
        text-blue-600 (CORRIGIDO)
      </div>
    `
    testElement.style.position = 'fixed'
    testElement.style.top = '500px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    testElement.style.minWidth = '300px'
    
    document.body.appendChild(testElement)
    
    // Remover após 30 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 30000)
    
    console.log('- Elemento de teste cores neutras dos gradientes criado com classes:', testElement.className)
  }
  
  const testNewElegantColors = () => {
    console.log('🧪 Testando Novas Cores Elegantes dos Gradientes:')
    
    // Teste específico para as novas cores elegantes dos gradientes
    const testElement = document.createElement('div')
    testElement.className = 'p-4 m-4 border rounded'
    testElement.innerHTML = `
      <div class="mb-2">
        <strong>Teste Novas Cores Elegantes dos Gradientes:</strong>
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded mb-2 text-white">
        from-blue-50 to-purple-50 (ELEGANTE)
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3 rounded mb-2 text-white">
        from-blue-50 to-indigo-50 (ELEGANTE)
      </div>
      <div class="bg-blue-50 dark:bg-blue-950 p-3 rounded mb-2 text-white">
        bg-blue-50 (ELEGANTE)
      </div>
      <div class="border border-blue-200 dark:border-blue-800 p-3 rounded text-white">
        border-blue-200 (ELEGANTE)
      </div>
      <div class="text-blue-600 dark:text-blue-600 p-3 rounded bg-gray-800 mt-2">
        text-blue-600 (CORRIGIDO)
      </div>
      <div class="text-blue-700 dark:text-blue-700 p-3 rounded bg-gray-800 mt-2 border border-blue-300 dark:border-blue-300">
        Botão Selecionar Todos (TEXTO BRANCO)
      </div>
      <div class="border border-border dark:border-border p-3 rounded text-white mt-2">
        Contorno dos Cards (MAIS BRANCO)
      </div>
    `
    testElement.style.position = 'fixed'
    testElement.style.top = '550px'
    testElement.style.right = '20px'
    testElement.style.zIndex = '9999'
    testElement.style.minWidth = '300px'
    
    document.body.appendChild(testElement)
    
    // Remover após 35 segundos
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 35000)
    
    console.log('- Elemento de teste novas cores elegantes dos gradientes criado com classes:', testElement.className)
  }
  
  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Teste de Tema
      </div>
      <div className="space-y-2">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Tema atual: {theme}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Modo escuro: {isDark ? 'Sim' : 'Não'}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Classe dark: {document.documentElement.classList.contains('dark') ? 'Sim' : 'Não'}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          HTML classes: {document.documentElement.classList.toString()}
        </div>
        
        {/* Teste visual */}
        <div className="p-2 border rounded">
          <div className="text-xs mb-1">Teste Visual:</div>
          <div id="theme-test" className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded text-xs">
            Este texto deve mudar de cor
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTheme('light')
              setTimeout(testTheme, 100)
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Claro
          </button>
          <button
            onClick={() => {
              setTheme('dark')
              setTimeout(testTheme, 100)
            }}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Escuro
          </button>
          <button
            onClick={() => {
              setTheme('system')
              setTimeout(testTheme, 100)
            }}
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Sistema
          </button>
          <button
            onClick={testTheme}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Debug
          </button>
          <button
            onClick={forceLightMode}
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Forçar Claro
          </button>
          <button
            onClick={forceDarkMode}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Forçar Escuro
          </button>
          <button
            onClick={testTailwindClasses}
            className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Teste Tailwind
          </button>
          <button
            onClick={testTailwindV4}
            className="px-2 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Teste v4
          </button>
          <button
            onClick={testDarkModeCSS}
            className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Teste Dark CSS
          </button>
          <button
            onClick={testCustomCSSVariables}
            className="px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Teste CSS Vars
          </button>
          <button
            onClick={testGradients}
            className="px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            Teste Gradientes
          </button>
          <button
            onClick={testNewGradientColors}
            className="px-2 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600"
          >
            Teste Novas Cores
          </button>
          <button
            onClick={testNeutralGradientColors}
            className="px-2 py-1 text-xs bg-violet-500 text-white rounded hover:bg-violet-600"
          >
            Teste Cores Neutras
          </button>
          <button
            onClick={testNewElegantColors}
            className="px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            Teste Cores Elegantes
          </button>
          <button
            onClick={() => {
              console.log('🧪 Testando Persistência do Tema:')
              console.log('- Tema atual:', theme)
              console.log('- isDark:', isDark)
              console.log('- localStorage:', localStorage.getItem('leadbaze-theme'))
              console.log('- HTML classes:', document.documentElement.classList.toString())
              console.log('- Contém dark:', document.documentElement.classList.contains('dark'))
              
              // Teste de navegação simulada
              console.log('🔄 Simulando navegação para Landing Page...')
              document.documentElement.classList.remove('dark')
              console.log('- Classe dark removida para Landing Page')
              
              setTimeout(() => {
                console.log('🔄 Simulando retorno para Dashboard...')
                if (isDark) {
                  document.documentElement.classList.add('dark')
                  console.log('- Tema escuro restaurado')
                } else {
                  document.documentElement.classList.remove('dark')
                  console.log('- Tema claro restaurado')
                }
              }, 2000)
            }}
            className="px-2 py-1 text-xs bg-rose-500 text-white rounded hover:bg-rose-600"
          >
            Teste Persistência
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente principal que gerencia as classes de tema
function AppContent() {
  const location = useLocation()
  const { theme, isDark } = useTheme()
  
  useEffect(() => {
    const isLandingPage = location.pathname === '/'
    
    console.log('🔄 Mudando rota:', location.pathname, 'isLandingPage:', isLandingPage)
    
    if (isLandingPage) {
      // Landing Page - sempre clara, forçar remoção da classe dark
      document.documentElement.classList.remove('dark')
      console.log('✅ Landing Page - classe dark forçadamente removida')
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
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
      
      {/* Componente de teste temporário */}
      <ThemeTest />
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
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App