import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { LeadService } from '../lib/leadService'
import { LeadGeneratorPro } from '../components/LeadGeneratorPro'
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
    <div className="app-page min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                opacity: 0.1
              }}></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  <Zap className="w-4 h-4" />
                  <span>Gerador de Leads Profissional</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Leads do 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent ml-2">
                    Google Maps
                  </span>
                </h1>
                <p className="text-blue-50 text-lg max-w-2xl">
                  Extraia dados precisos e selecione exatamente quais leads deseja salvar com nossa IA avançada!
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-blue-200 mb-1">Modo</div>
                  <div className="text-lg font-semibold">Extração Inteligente</div>
                  <div className="text-xs text-blue-300 mt-1">IA + Seleção Manual</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voltar para Dashboard */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Dashboard</span>
          </Link>
        </div>

        {/* Gerador Component */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <LeadGeneratorPro
            onLeadsGenerated={handleLeadsGenerated}
            onLeadsSaved={handleLeadsSaved}
            existingLists={existingLists}
          />
        </div>
      </div>
    </div>
  )
}