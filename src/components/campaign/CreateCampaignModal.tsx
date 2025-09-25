/**

 * =====================================================

 * MODAL SIMPLES PARA CRIAÇÃO DE CAMPANHA

 * =====================================================

 */

import React, { useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import { X, Plus, Loader } from 'lucide-react'

import { Button } from '../ui/button'

import { CampaignService } from '../../lib/campaignService'

import { toast } from '../../hooks/use-toast'

import type { BulkCampaign } from '../../types'

interface CreateCampaignModalProps {

  isOpen: boolean

  onClose: () => void

  onCampaignCreated: (campaign: BulkCampaign) => void

}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({

  isOpen,

  onClose,

  onCampaignCreated

}) => {

  const [campaignName, setCampaignName] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!campaignName.trim()) {

      toast({

        title: 'Erro',

        description: 'Nome da campanha é obrigatório',

        variant: 'destructive'

      })

      return

    }

    setIsLoading(true)

    try {

      const newCampaign = await CampaignService.createCampaign({

        name: campaignName.trim(),

        message: '',

        status: 'draft',

        selected_lists_count: 0,

        ignored_lists_count: 0,

        total_leads: 0,

        unique_leads: 0,

        duplicates_count: 0,

        success_count: 0,

        failed_count: 0,

        user_id: '' // Será preenchido pelo CampaignService

      })

      if (newCampaign) {

        toast({

          title: 'Sucesso',

          description: 'Campanha criada com sucesso!',

          variant: 'default'

        })

        // Limpar formulário

        setCampaignName('')

        // Notificar o componente pai

        onCampaignCreated(newCampaign)

        // Fechar modal

        onClose()

      }

    } catch (error) {

      toast({

        title: 'Erro',

        description: 'Erro ao criar campanha. Tente novamente.',

        variant: 'destructive'

      })

    } finally {

      setIsLoading(false)

    }

  }

  const handleClose = () => {

    if (!isLoading) {

      setCampaignName('')

      onClose()

    }

  }

  return (

    <AnimatePresence>

      {isOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* Backdrop */}

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="absolute inset-0 bg-black/50 backdrop-blur-sm"

            onClick={handleClose}

          />

          {/* Modal */}

          <motion.div

            initial={{ opacity: 0, scale: 0.95, y: 20 }}

            animate={{ opacity: 1, scale: 1, y: 0 }}

            exit={{ opacity: 0, scale: 0.95, y: 20 }}

            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4"

          >

            {/* Header */}

            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">

              <div className="flex items-center gap-3">

                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">

                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />

                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white">

                  Nova Campanha

                </h2>

              </div>

              <button

                onClick={handleClose}

                disabled={isLoading}

                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"

              >

                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />

              </button>

            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="p-6">

              <div className="space-y-4">

                <div>

                  <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">

                    Nome da Campanha

                  </label>

                  <input

                    id="campaignName"

                    type="text"

                    value={campaignName}

                    onChange={(e) => setCampaignName(e.target.value)}

                    placeholder="Ex: Campanha Black Friday 2024"

                    disabled={isLoading}

                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"

                    autoFocus

                  />

                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">

                  Você poderá editar a mensagem e selecionar listas após criar a campanha.

                </div>

              </div>

              {/* Actions */}

              <div className="flex gap-3 mt-6">

                <Button

                  type="button"

                  variant="outline"

                  onClick={handleClose}

                  disabled={isLoading}

                  className="flex-1"

                >

                  Cancelar

                </Button>

                <Button

                  type="submit"

                  disabled={isLoading || !campaignName.trim()}

                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"

                >

                  {isLoading ? (

                    <div className="flex items-center gap-2">

                      <Loader className="w-4 h-4 animate-spin" />

                      <span>Criando...</span>

                    </div>

                  ) : (

                    <div className="flex items-center gap-2">

                      <Plus className="w-4 h-4" />

                      <span>Criar Campanha</span>

                    </div>

                  )}

                </Button>

              </div>

            </form>

          </motion.div>

        </div>

      )}

    </AnimatePresence>

  )

}
