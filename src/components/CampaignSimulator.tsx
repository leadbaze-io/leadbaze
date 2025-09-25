/**
 * =====================================================
 * SIMULADOR DE CAMPANHA PARA TESTES
 * =====================================================
 */

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { useActiveCampaignContext } from '../contexts/ActiveCampaignContext'
import { MessageSquare, Play, Pause, Square, Eye } from 'lucide-react'

export function CampaignSimulator() {
  const { startCampaign, updateCampaign, finishCampaign, activeCampaign, openModal } = useActiveCampaignContext()
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationSpeed] = useState(1000) // 1 segundo

  // Simular progresso da campanha
  useEffect(() => {
    if (!isSimulating || !activeCampaign) return

    const interval = setInterval(() => {
      const currentProgress = activeCampaign.progress
      const currentSuccess = activeCampaign.successCount
      const currentFailed = activeCampaign.failedCount
      const total = activeCampaign.totalLeads

      if (currentProgress >= 100) {
        setIsSimulating(false)
        finishCampaign('completed')
        return
      }

      // Simular envio de mensagem
      const newProgress = Math.min(currentProgress + (100 / total), 100)
      const newSuccess = Math.min(currentSuccess + 1, total)
      const newFailed = Math.random() < 0.1 ? currentFailed + 1 : currentFailed

      // Simular lead atual
      const currentLead = {
        name: `Lead ${newSuccess + 1}`,
        phone: `(11) 99999-${String(newSuccess + 1).padStart(4, '0')}`
      }

      updateCampaign({
        progress: Math.round(newProgress),
        successCount: newSuccess,
        failedCount: newFailed,
        currentLead: newProgress < 100 ? currentLead : null
      })
    }, simulationSpeed)

    return () => clearInterval(interval)
  }, [isSimulating, activeCampaign, simulationSpeed, updateCampaign, finishCampaign])

  // Auto-iniciar simulação quando campanha é criada
  useEffect(() => {
    if (activeCampaign && activeCampaign.status === 'sending' && !isSimulating) {
      setIsSimulating(true)
    }
  }, [activeCampaign, isSimulating])

  const handleStartSimulation = () => {
    if (activeCampaign) {
      setIsSimulating(true)
    } else {
      const campaignData = {
        campaignId: 'simulation-' + Date.now(),
        campaignName: 'Simulação de Campanha',
        status: 'sending' as const,
        progress: 0,
        successCount: 0,
        failedCount: 0,
        totalLeads: 20,
        startTime: new Date(),
        currentLead: null
      }
      startCampaign(campaignData)
      setIsSimulating(true)
    }
  }

  const handlePauseSimulation = () => {
    setIsSimulating(false)
  }

  const handleStopSimulation = () => {
    setIsSimulating(false)
    if (activeCampaign) {
      finishCampaign('completed')
    }
  }

  if (activeCampaign) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">Simulação Ativa</span>
          </div>
          <div className="text-xs text-white/80">
            {activeCampaign.progress}% concluído
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-white/80">
            <span>{activeCampaign.successCount} enviados</span>
            <span>{activeCampaign.failedCount} falhas</span>
            <span>{activeCampaign.totalLeads} total</span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2">
            <div

              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${activeCampaign.progress}%` }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {!isSimulating ? (
              <Button
                onClick={handleStartSimulation}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Play className="w-3 h-3 mr-1" />
                Continuar
              </Button>
            ) : (
              <Button
                onClick={handlePauseSimulation}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Pause className="w-3 h-3 mr-1" />
                Pausar
              </Button>
            )}

            <Button
              onClick={openModal}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-300 hover:bg-blue-500/10"
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver Global
            </Button>

            <Button
              onClick={handleStopSimulation}
              size="sm"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Square className="w-3 h-3 mr-1" />
              Parar
            </Button>

            <Button
              onClick={() => {
                localStorage.removeItem('activeCampaign')
                window.location.reload()
              }}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-300 hover:bg-red-500/10"
            >
              Limpar Tudo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold text-white">Simulador de Campanha</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-white/80">
          Teste o sistema de campanhas com uma simulação realista
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleStartSimulation}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Play className="w-3 h-3 mr-1" />
            Iniciar Simulação
          </Button>
        </div>
      </div>
    </div>
  )
}
