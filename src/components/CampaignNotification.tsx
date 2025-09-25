/**
 * =====================================================
 * NOTIFICAÇÃO DE CAMPANHA EM ANDAMENTO
 * =====================================================
 */

import { useState, useEffect } from 'react'
import { MessageSquare, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface CampaignNotificationProps {
  campaignId: string
  campaignName: string
  status: 'sending' | 'completed' | 'failed'
  progress: number
  successCount: number
  failedCount: number
  totalLeads: number
  onOpenModal: () => void
  onClose: () => void
}

export function CampaignNotification({
  campaignId,
  campaignName,
  status,
  progress,
  successCount,
  failedCount,
  totalLeads,
  onOpenModal,
  onClose: _onClose
}: CampaignNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Salvar estado no localStorage para persistir entre páginas
  useEffect(() => {
    const notificationData = {
      campaignId,
      campaignName,
      status,
      progress,
      successCount,
      failedCount,
      totalLeads,
      timestamp: Date.now()
    }

    localStorage.setItem('activeCampaign', JSON.stringify(notificationData))

    return () => {
      if (status === 'completed' || status === 'failed') {
        localStorage.removeItem('activeCampaign')
      }
    }
  }, [campaignId, campaignName, status, progress, successCount, failedCount, totalLeads])

  const getStatusIcon = () => {
    switch (status) {
      case 'sending': return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'sending': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
      case 'completed': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
      case 'failed': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
    }
  }

  if (!isVisible || status === 'completed' || status === 'failed') return null

  return (
    <div

      className="fixed bottom-4 right-4 z-[9999] max-w-sm"
      style={{ zIndex: 9999 }}
    >
      <div className={`p-4 rounded-xl border shadow-lg ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {campaignName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span className="campaign-minimized-label-escuro">Progresso</span>
            <span className="campaign-minimized-text-escuro">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span className="campaign-minimized-text-escuro">{successCount} enviados</span>
            <span className="campaign-minimized-text-escuro">{failedCount} falhas</span>
            <span className="campaign-minimized-text-escuro">{totalLeads} total</span>
          </div>
        </div>

        <Button
          onClick={onOpenModal}
          className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs py-2"
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  )
}