import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import CampaignProgressModalSimple from '../components/CampaignProgressModalSimple'
import { useTheme } from '../contexts/ThemeContext'
import { getCurrentUser } from '../lib/supabaseClient'
import { Sun, Moon } from 'lucide-react'

export default function ModalTestPage() {
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  // Verificar autorização do usuário
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const currentUser = await getCurrentUser()

        if (!currentUser) {
          // Usuário não logado - redirecionar para login
          navigate('/login')
          return
        }

        // Verificar se é o e-mail autorizado
        if (currentUser.email === 'creaty12345@gmail.com') {
          setIsAuthorized(true)
        } else {
          // Usuário não autorizado - redirecionar para dashboard
          navigate('/dashboard')
          return
        }
      } catch (error) {

        navigate('/login')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [navigate])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Dados de teste
  const testCampaignData = {
    campaignName: 'Teste de Campanha',
    totalLeads: 20,
    successCount: 18,
    failedCount: 2,
    startTime: new Date(Date.now() - 120000), // 2 minutos atrás
    status: 'sending' as const
  }

  const testSuccessData = {
    campaignName: 'Deus o Melhor',
    totalLeads: 2,
    successCount: 2,
    failedCount: 0,
    startTime: new Date(Date.now() - 44000), // 44 segundos atrás
    status: 'completed' as const
  }

  // Mostrar loading enquanto verifica autorização
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autorização...</p>
        </div>
      </div>
    )
  }

  // Se não autorizado, não renderizar nada (já foi redirecionado)
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Teste dos Modais de Campanha
          </h1>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Modo Escuro</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modal de Progresso */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Modal de Progresso (Enviando)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modal que aparece durante o envio das mensagens
            </p>
            <Button

              onClick={() => setShowProgressModal(true)}
              className="w-full"
            >
              Abrir Modal de Progresso
            </Button>
          </div>

          {/* Modal de Sucesso */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Modal de Sucesso (Concluído)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modal que aparece quando a campanha é finalizada
            </p>
            <Button

              onClick={() => setShowSuccessModal(true)}
              className="w-full"
            >
              Abrir Modal de Sucesso
            </Button>
          </div>
        </div>

        {/* Informações dos Dados de Teste */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dados de Teste
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Modal de Progresso:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Campanha: {testCampaignData.campaignName}</li>
                <li>• Total: {testCampaignData.totalLeads} leads</li>
                <li>• Enviados: {testCampaignData.successCount}</li>
                <li>• Falhas: {testCampaignData.failedCount}</li>
                <li>• Status: {testCampaignData.status}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Modal de Sucesso:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Campanha: {testSuccessData.campaignName}</li>
                <li>• Total: {testSuccessData.totalLeads} leads</li>
                <li>• Enviados: {testSuccessData.successCount}</li>
                <li>• Falhas: {testSuccessData.failedCount}</li>
                <li>• Status: {testSuccessData.status}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Progresso */}
      <CampaignProgressModalSimple
        isVisible={showProgressModal}
        campaignName={testCampaignData.campaignName}
        totalLeads={testCampaignData.totalLeads}
        status={testCampaignData.status}
        successCount={testCampaignData.successCount}
        failedCount={testCampaignData.failedCount}
        startTime={testCampaignData.startTime}
        onCancel={() => setShowProgressModal(false)}
        onClose={() => setShowProgressModal(false)}
      />

      {/* Modal de Sucesso */}
      <CampaignProgressModalSimple
        isVisible={showSuccessModal}
        campaignName={testSuccessData.campaignName}
        totalLeads={testSuccessData.totalLeads}
        status={testSuccessData.status}
        successCount={testSuccessData.successCount}
        failedCount={testSuccessData.failedCount}
        startTime={testSuccessData.startTime}
        onCancel={() => setShowSuccessModal(false)}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  )
}
