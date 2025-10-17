/**
 * =====================================================
 * GERENCIADOR GLOBAL DE CAMPANHAS ATIVAS
 * =====================================================
 */

import { memo } from 'react'
import { CampaignProgressModal } from './CampaignProgressModal'
import { CampaignNotification } from './CampaignNotification'
import { CampaignCompletionOverlay } from './CampaignCompletionOverlay'
import { useActiveCampaignContext } from '../contexts/ActiveCampaignContext'

export const ActiveCampaignManager = memo(function ActiveCampaignManager() {
  const {
    activeCampaign,
    isModalOpen,
    showCompletionNotification,
    openModal,
    closeModal,
    clearActiveCampaign,
    closeCompletionNotification
  } = useActiveCampaignContext()

  if (!activeCampaign) return null

  return (
    <>
      {/* Modal de progresso */}
      <CampaignProgressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        campaignId={activeCampaign.campaignId}
        campaignName={activeCampaign.campaignName}
        status={activeCampaign.status}
        startTime={activeCampaign.startTime}
        successCount={activeCampaign.successCount}
        failedCount={activeCampaign.failedCount}
        progress={activeCampaign.progress}
        currentLead={activeCampaign.currentLead}
        totalLeads={activeCampaign.totalLeads}
      />

      {/* Notificação flutuante quando modal fechado */}
      {!isModalOpen && activeCampaign.status === 'sending' && (
        <CampaignNotification
          campaignId={activeCampaign.campaignId}
          campaignName={activeCampaign.campaignName}
          status={activeCampaign.status}
          progress={activeCampaign.progress}
          successCount={activeCampaign.successCount}
          failedCount={activeCampaign.failedCount}
          totalLeads={activeCampaign.totalLeads}
          onOpenModal={openModal}
          onClose={clearActiveCampaign}
        />
      )}

      {/* Overlay de conclusão robusto - tela cheia */}
      {showCompletionNotification && (activeCampaign.status === 'completed' || activeCampaign.status === 'failed') && (
        <CampaignCompletionOverlay
          isVisible={showCompletionNotification}
          onClose={closeCompletionNotification}
          campaignName={activeCampaign.campaignName}
          status={activeCampaign.status}
          successCount={activeCampaign.successCount}
          failedCount={activeCampaign.failedCount}
          totalLeads={activeCampaign.totalLeads}
          duration={activeCampaign.duration || 0}
        />
      )}
    </>
  )
})
