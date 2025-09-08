import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { LeadService } from '../lib/leadService'
import { LeadGeneratorPro } from '../components/LeadGeneratorPro'
import Footer from '../components/Footer'
import type { LeadList, Lead } from '../types'
import type { User } from '@supabase/supabase-js'

export default function GeradorLeads() {
  const [user, setUser] = useState<User | null>(null)
  const [existingLists, setExistingLists] = useState<LeadList[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const initializePage = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        navigate('/login')
        // Scroll para o topo após navegação
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
        return
      }

      setUser(currentUser)

      // Carregar listas existentes
      try {
        const lists = await LeadService.getUserLeadLists()
        setExistingLists(lists)
      } catch (error) {
        console.error('Erro ao carregar listas:', error)
        setExistingLists([])
      }
    }

    initializePage()
  }, [navigate])

  const handleLeadsGenerated = (leads: Lead[]) => {
    console.log('Leads gerados:', leads.length)
    // Callback quando leads são gerados - pode ser usado para analytics, etc.
  }

  const handleLeadsSaved = () => {
    // Navegar para o dashboard após salvar leads
    navigate('/dashboard')
    // Scroll para o topo após navegação
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page min-h-screen bg-background">
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                opacity: 0.1
              }}></div>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 sm:space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Gerador de Leads Profissional</span>
                  <span className="sm:hidden">Gerador Pro</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Leads do 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent ml-1 sm:ml-2">
                    Google Maps
                  </span>
                </h1>
                <p className="text-blue-50 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                  Extraia dados precisos e selecione exatamente quais leads deseja salvar com nossa IA avançada!
                </p>
              </div>
              <div className="mt-4 sm:mt-6 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xs sm:text-sm text-blue-200 mb-1">Modo</div>
                  <div className="text-base sm:text-lg font-semibold">Extração Inteligente</div>
                  <div className="text-xs text-blue-300 mt-1">IA + Seleção Manual</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voltar para Dashboard */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Voltar para Dashboard</span>
          </Link>
        </div>

        {/* Gerador Component */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-4 sm:p-6 lg:p-8">
          <LeadGeneratorPro
            onLeadsGenerated={handleLeadsGenerated}
            onLeadsSaved={handleLeadsSaved}
            existingLists={existingLists}
          />
        </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}