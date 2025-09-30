/**
 * =====================================================
 * CONTEXTO GLOBAL PARA CAMPANHAS ATIVAS
 * =====================================================
 */

import { createContext, useContext, type ReactNode } from 'react'
import { useActiveCampaign } from '../hooks/useActiveCampaign'

interface ActiveCampaignContextType {
  activeCampaign: ReturnType<typeof useActiveCampaign>['activeCampaign']
  isModalOpen: ReturnType<typeof useActiveCampaign>['isModalOpen']
  isModalMinimized: ReturnType<typeof useActiveCampaign>['isModalMinimized']
  showCompletionNotification: ReturnType<typeof useActiveCampaign>['showCompletionNotification']
  startCampaign: ReturnType<typeof useActiveCampaign>['startCampaign']
  updateCampaign: ReturnType<typeof useActiveCampaign>['updateCampaign']
  finishCampaign: ReturnType<typeof useActiveCampaign>['finishCampaign']
  openModal: ReturnType<typeof useActiveCampaign>['openModal']
  closeModal: ReturnType<typeof useActiveCampaign>['closeModal']
  minimizeModal: ReturnType<typeof useActiveCampaign>['minimizeModal']
  expandModal: ReturnType<typeof useActiveCampaign>['expandModal']
  clearActiveCampaign: ReturnType<typeof useActiveCampaign>['clearActiveCampaign']
  closeCompletionNotification: ReturnType<typeof useActiveCampaign>['closeCompletionNotification']
}

const ActiveCampaignContext = createContext<ActiveCampaignContextType | undefined>(undefined)

interface ActiveCampaignProviderProps {
  children: ReactNode
}

export function ActiveCampaignProvider({ children }: ActiveCampaignProviderProps) {
  const campaignHook = useActiveCampaign()

  return (
    <ActiveCampaignContext.Provider value={campaignHook}>
      {children}
    </ActiveCampaignContext.Provider>
  )
}

export function useActiveCampaignContext() {
  const context = useContext(ActiveCampaignContext)
  if (context === undefined) {
    throw new Error('useActiveCampaignContext must be used within an ActiveCampaignProvider')
  }
  return context
}
