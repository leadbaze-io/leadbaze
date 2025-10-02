import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Brain } from 'lucide-react'
import { getCurrentUser } from '../lib/supabaseClient'
import { LeadService } from '../lib/leadService'
import { LeadGeneratorPro } from '../components/LeadGeneratorPro'
import Footer from '../components/Footer'
import ScrollToTopButton from '../components/ScrollToTopButton'
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

        setExistingLists([])
      }
    }

    initializePage()
  }, [navigate])

  const handleLeadsGenerated = (_leads: Lead[]) => {

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
        <motion.div

          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                opacity: 0.1
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Search className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Gerador de Leads Inteligente
                      </h1>
                      <p className="text-blue-100 text-sm sm:text-base">
                        {user?.user_metadata?.name || user?.email}
                      </p>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-blue-50 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed"
                  >
                    Encontre estabelecimentos específicos em qualquer localidade. Simplesmente digite o que procura e onde, nossa tecnologia fará o resto!
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 sm:mt-6 lg:mt-0"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-yellow-300" />
                      <div className="text-xs sm:text-sm text-blue-200">Modo</div>
                    </div>
                    <div className="text-base sm:text-lg font-semibold">Busca Direcionada</div>
                    <div className="text-xs text-blue-300 mt-1">IA + Geolocalização</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voltar para Dashboard */}
        <motion.div

          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 sm:mb-6"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Voltar para Dashboard</span>
          </Link>
        </motion.div>

        {/* Gerador Component */}
        <motion.div

          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-4 sm:p-6 lg:p-8"
        >
          <LeadGeneratorPro
            onLeadsGenerated={handleLeadsGenerated}
            onLeadsSaved={handleLeadsSaved}
            existingLists={existingLists}
          />
        </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  )
}