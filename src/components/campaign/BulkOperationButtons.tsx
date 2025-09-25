import React from 'react'
import { motion } from 'framer-motion'
import { useBulkCampaignOperations } from '../../hooks/useBulkCampaignOperations'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'

interface BulkOperationButtonsProps {
  campaignId: string
  availableLists: any[]
  selectedLists: string[]
  ignoredLists: string[]
  campaignLeads: any[]
  onOperationComplete: (result: {
    selectedLists: string[]
    leads: any[]
  }) => Promise<void>
  disabled?: boolean
  type: 'add' | 'remove' // Novo prop para determinar qual botão mostrar
}

export const BulkOperationButtons: React.FC<BulkOperationButtonsProps> = ({
  campaignId,
  availableLists,
  selectedLists,
  ignoredLists,
  campaignLeads,
  onOperationComplete,
  disabled = false,
  type
}) => {
  const { loading, addAllLists, removeAllLists } = useBulkCampaignOperations()

  const handleAddAllLists = async () => {
    // Adicionando todas as listas

    const result = await addAllLists(
      campaignId,
      availableLists,
      selectedLists,
      ignoredLists,
      campaignLeads
    )

    if (result.success && result.data) {
      await onOperationComplete(result.data)
      // Operação concluída com sucesso
    } else {

      // Aqui você pode adicionar uma notificação de erro se quiser
    }
  }

  const handleRemoveAllLists = async () => {
    // Removendo todas as listas

    const result = await removeAllLists(campaignId, ignoredLists)

    if (result.success && result.data) {
      await onOperationComplete(result.data)
      // Operação concluída com sucesso
    } else {

      // Aqui você pode adicionar uma notificação de erro se quiser
    }
  }

  const hasAvailableLists = availableLists.length > 0
  const hasSelectedLists = selectedLists.length > 0

  if (type === 'add') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAllLists}
          disabled={disabled || loading || !hasAvailableLists}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-4 py-2 h-9 min-w-[140px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs">Adicionando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-xs">Adicionar Todas</span>
            </div>
          )}
        </Button>
      </motion.div>
    )
  }

  if (type === 'remove') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemoveAllLists}
          disabled={disabled || loading || !hasSelectedLists}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-4 py-2 h-9 min-w-[140px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs">Removendo...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">Remover Todas</span>
            </div>
          )}
        </Button>
      </motion.div>
    )
  }

  return null
}
