/**
 * =====================================================
 * COMPONENTE LIST SELECTION STEP - SELEÇÃO DE LISTAS
 * =====================================================
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Eye, EyeOff, Plus, AlertTriangle } from 'lucide-react'

import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import { ListCard } from '../components/ListCard'
import { LeadPreview } from '../components/LeadPreview'
import { BulkOperationButtons } from '../BulkOperationButtons'
import type { LeadList } from '../../../types'
import type { CampaignLead } from '../../../types/campaign'

interface ListSelectionStepProps {
  lists: LeadList[]
  selectedLists: string[]
  ignoredLists: string[]
  campaignLeads: CampaignLead[]
  uniqueLeadsCount: number
  onListToggle: (listId: string) => void
  onIgnoreList: (listId: string) => void
  onUnignoreList: (listId: string) => void
  onAddAllLists: () => void
  onRemoveAllLists: () => void
  onBulkOperationComplete: (result: { selectedLists: string[], leads: any[] }) => Promise<void>
  campaignId: string
  loading: boolean
  disabled?: boolean
}

export const ListSelectionStep: React.FC<ListSelectionStepProps> = ({
  lists,
  selectedLists,
  ignoredLists,
  campaignLeads,
  onListToggle,
  onIgnoreList,
  onUnignoreList,
  onBulkOperationComplete,
  campaignId,
  loading,
  disabled = false
}) => {
  const [selectedLead, setSelectedLead] = useState<CampaignLead | null>(null)
  const [showIgnored, setShowIgnored] = useState(false)

  // Filtrar listas
  const availableLists = lists.filter(list =>

    !selectedLists.includes(list.id) && !ignoredLists.includes(list.id)
  )
  const selectedListsData = lists.filter(list => selectedLists.includes(list.id))
  const ignoredListsData = lists.filter(list => ignoredLists.includes(list.id))

  // Calcular leads por lista
  const getLeadsCountForList = (listId: string) => {
    return campaignLeads.filter(lead => lead.listId === listId).length
  }

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold list-section-title">Seleção de Listas de Leads</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha as listas que deseja incluir na sua campanha
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listas Disponíveis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <h3 className="text-lg font-bold list-section-title">Listas Disponíveis</h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full list-count-badge">
                {availableLists.length}
              </span>
            </div>
            {availableLists.length > 0 && (
              <div className="flex justify-start">
                <BulkOperationButtons
                  campaignId={campaignId}
                  availableLists={availableLists}
                  selectedLists={selectedLists}
                  ignoredLists={ignoredLists}
                  campaignLeads={campaignLeads}
                  onOperationComplete={onBulkOperationComplete}
                  disabled={disabled || loading}
                  type="add"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <AnimatePresence>
              {availableLists.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ListCard
                    list={list}
                    isSelected={false}
                    isIgnored={false}
                    leadsCount={list.leads.length}
                    onToggle={() => onListToggle(list.id)}
                    onIgnore={() => onIgnoreList(list.id)}
                    loading={loading}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {availableLists.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center py-8 empty-state-improved h-[200px] flex items-center justify-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      Todas as listas foram selecionadas
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Excelente! Você já selecionou todas as listas disponíveis
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Listas Selecionadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <h3 className="text-lg font-bold list-section-title">Listas Selecionadas</h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full list-count-badge">
                {selectedLists.length}
              </span>
            </div>
            {selectedLists.length > 0 && (
              <div className="flex justify-start">
                <BulkOperationButtons
                  campaignId={campaignId}
                  availableLists={availableLists}
                  selectedLists={selectedLists}
                  ignoredLists={ignoredLists}
                  campaignLeads={campaignLeads}
                  onOperationComplete={onBulkOperationComplete}
                  disabled={disabled || loading}
                  type="remove"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <AnimatePresence>
              {selectedListsData.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ListCard
                    list={list}
                    isSelected={true}
                    isIgnored={false}
                    leadsCount={getLeadsCountForList(list.id)}
                    onToggle={() => onListToggle(list.id)}
                    onIgnore={() => onIgnoreList(list.id)}
                    loading={loading}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedLists.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center py-8 empty-state-improved h-[200px] flex items-center justify-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      Nenhuma lista selecionada
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Selecione listas da coluna ao lado
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Use os botões + para adicionar listas à campanha
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Listas Ignoradas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <h3 className="text-lg font-bold list-section-title">Listas Ignoradas</h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full list-count-badge">
                {ignoredLists.length}
              </span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIgnored(!showIgnored)}
                  className="h-8 w-8 p-0 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {showIgnored ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {showIgnored && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 max-h-96 overflow-y-auto pr-2"
              >
                {ignoredListsData.map((list, index) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <ListCard
                      list={list}
                      isSelected={false}
                      isIgnored={true}
                      leadsCount={getLeadsCountForList(list.id)}
                      onToggle={() => onUnignoreList(list.id)}
                      onIgnore={() => onUnignoreList(list.id)}
                      loading={loading}
                    />
                  </motion.div>
                ))}

                {ignoredLists.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="text-center py-8 empty-state-improved h-[200px] flex items-center justify-center">
                      <CardContent>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <EyeOff className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                          Nenhuma lista ignorada
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Todas as listas estão disponíveis para seleção
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!showIgnored && ignoredLists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="text-center py-6 empty-state-improved">
                <CardContent>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIgnored(true)}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver {ignoredLists.length} lista{ignoredLists.length !== 1 ? 's' : ''} ignorada{ignoredLists.length !== 1 ? 's' : ''}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Preview de Leads */}
      {selectedLead && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <LeadPreview
            leads={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        </motion.div>
      )}

      {/* Aviso se não há leads */}
      {selectedLists.length > 0 && campaignLeads.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Nenhum lead encontrado
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    As listas selecionadas não possuem leads válidos ou com telefone.

                    Verifique se as listas contêm dados de contato válidos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}