/**
 * =====================================================
 * COMPONENTE DE TESTE GLOBAL
 * =====================================================
 */

import { useActiveCampaignContext } from '../contexts/ActiveCampaignContext'

export function TestGlobal() {
  const { activeCampaign, isModalOpen, openModal } = useActiveCampaignContext()

  // Verificar localStorage diretamente
  const savedCampaign = localStorage.getItem('activeCampaign')

  if (!activeCampaign) {
    return (
      <div className="fixed top-4 left-4 bg-red-500 text-white p-2 rounded z-[10000]">
        <p>Nenhuma campanha ativa</p>
        <p>LocalStorage: {savedCampaign ? 'Tem dados' : 'Vazio'}</p>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-4 bg-green-500 text-white p-2 rounded z-[10000]">
      <p>Campanha ativa: {activeCampaign.campaignName}</p>
      <p>Modal aberto: {isModalOpen ? 'Sim' : 'Não'}</p>
      <button

        onClick={openModal}
        className="bg-blue-500 text-white px-2 py-1 rounded mt-1"
      >
        Abrir Modal
      </button>
    </div>
  )
}
