/**
 * =====================================================
 * COMPONENTE REVIEW STEP - REVISÃO FINAL
 * =====================================================
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, Users, MessageSquare, Clock, Eye, Rocket, X, ChevronDown, ChevronUp } from 'lucide-react'

import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { AnimatedSubscribeButton } from '../../ui/animated-subscribe-button'
import { CampaignStats } from '../StatsCard'
import type { CampaignLead, CampaignStats as Stats } from '../../../types/campaign'

interface ReviewStepProps {
  campaignName: string
  campaignMessage: string
  stats: Stats
  campaignLeads: CampaignLead[]
  onSendCampaign: () => void
  onRemoveLead?: (leadId: string) => void
  onStatsUpdate?: (newStats: Stats) => void
  loading: boolean
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  campaignName,
  campaignMessage,
  stats,
  campaignLeads,
  onSendCampaign,
  onRemoveLead,
  loading
}) => {
  const [showLeadsPreview, setShowLeadsPreview] = useState(false)
  const [showMessagePreview, setShowMessagePreview] = useState(false)
  const [showAllLeads, setShowAllLeads] = useState(false)

  // Verificar se está pronto para enviar
  const isReadyToSend = stats.uniqueLeads > 0 && campaignMessage.trim().length > 0

  // Calcular tempo estimado de envio
  const estimatedSendTime = Math.ceil(stats.uniqueLeads / 10) // 10 mensagens por minuto

  // Amostra de leads para preview
  const sampleLeads = campaignLeads.slice(0, 5)

  // Leads para exibir (todos ou amostra)
  const displayLeads = showAllLeads ? campaignLeads : sampleLeads

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 px-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold review-header-claro review-header-escuro">
              Revisão Final e Envio
            </h1>
          </div>
        </div>
        <p className="text-base sm:text-lg review-subtitle-claro review-subtitle-escuro max-w-2xl mx-auto px-4 text-center">
          Revise os detalhes da sua campanha antes de enviar para seus leads
        </p>
      </motion.div>

      {/* Estatísticas */}
      <CampaignStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Campanha */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="review-card-claro review-card-escuro">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl review-card-title-claro review-card-title-escuro">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="review-card-title-claro review-card-title-escuro">
                    Informações da Campanha
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm review-label-claro review-label-escuro">Nome da Campanha</p>
                  <p className="font-semibold review-value-claro review-value-escuro">{campaignName}</p>
                </div>

                <div>
                  <p className="text-sm review-label-claro review-label-escuro">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm review-status-claro review-status-escuro">Pronta para envio</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm review-label-claro review-label-escuro">Tempo estimado</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 review-icon-claro review-icon-escuro" />
                    <span className="text-sm review-value-claro review-value-escuro">
                      {estimatedSendTime} minuto{estimatedSendTime !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview da Mensagem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="review-card-claro review-card-escuro">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl review-card-title-claro review-card-title-escuro">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="review-card-title-claro review-card-title-escuro">
                      Mensagem da Campanha
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMessagePreview(!showMessagePreview)}
                    className="review-button-claro review-button-escuro"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showMessagePreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="review-message-preview-claro review-message-preview-escuro p-4 rounded-lg border">
                        <p className="text-sm review-message-text-claro review-message-text-escuro whitespace-pre-wrap">
                          {campaignMessage}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showMessagePreview && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm review-label-claro review-label-escuro">
                      {campaignMessage.length} caracteres
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMessagePreview(true)}
                      className="review-button-claro review-button-escuro"
                    >
                      Ver mensagem
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Preview dos Leads */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="review-card-claro review-card-escuro">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl review-card-title-claro review-card-title-escuro">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="review-card-title-claro review-card-title-escuro">
                      Leads Selecionados ({stats.uniqueLeads})
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeadsPreview(!showLeadsPreview)}
                    className="review-button-claro review-button-escuro"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showLeadsPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {/* Container com scroll para todos os leads */}
                      <div className={`space-y-3 ${showAllLeads ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                        {displayLeads.map((lead, index) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 review-lead-item-claro review-lead-item-escuro rounded-lg border group hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold review-lead-name-claro review-lead-name-escuro">{lead.name}</p>
                              <p className="text-xs review-lead-phone-claro review-lead-phone-escuro">{lead.phone}</p>
                              {lead.company && (
                                <span className="text-xs review-lead-company-claro review-lead-company-escuro px-2 py-1 rounded mt-1 inline-block">
                                  {lead.company}
                                </span>
                              )}
                            </div>

                            {/* Botão de remover lead */}
                            {onRemoveLead && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onRemoveLead(lead.id)}
                                className="ml-3 p-1.5 rounded-full review-remove-button-always-visible hover:shadow-md"
                                title="Remover lead da campanha"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {/* Botão para mostrar todos os leads */}
                      {stats.uniqueLeads > 5 && !showAllLeads && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-center pt-2"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllLeads(true)}
                            className="review-button-claro review-button-escuro"
                          >
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Ver todos os {stats.uniqueLeads} leads
                          </Button>
                        </motion.div>
                      )}

                      {/* Botão para mostrar apenas amostra */}
                      {showAllLeads && stats.uniqueLeads > 5 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-center pt-2"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllLeads(false)}
                            className="review-button-claro review-button-escuro"
                          >
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Mostrar apenas amostra
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showLeadsPreview && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm review-label-claro review-label-escuro">
                      {stats.uniqueLeads} leads únicos selecionados
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLeadsPreview(true)}
                      className="review-button-claro review-button-escuro"
                    >
                      Ver leads
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Avisos */}
          {!isReadyToSend && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="review-warning-card-claro review-warning-card-escuro">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 review-warning-icon-claro review-warning-icon-escuro" />
                    <div>
                      <p className="font-semibold review-warning-title-claro review-warning-title-escuro">
                        Campanha não está pronta
                      </p>
                      <p className="text-sm review-warning-text-claro review-warning-text-escuro">
                        Verifique se há leads selecionados e uma mensagem configurada
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Confirmação de Envio */}
          {isReadyToSend && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="review-success-card-claro review-success-card-escuro">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 review-success-icon-claro review-success-icon-escuro" />
                    <div>
                      <p className="font-semibold review-success-title-claro review-success-title-escuro">
                        Pronto para enviar!
                      </p>
                      <p className="text-sm review-success-text-claro review-success-text-escuro">
                        Sua campanha será enviada para {stats.uniqueLeads} leads
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Botão de Envio Animado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center pt-8"
      >
        <AnimatedSubscribeButton
          subscribeStatus={false}
          onClick={onSendCampaign}
          disabled={!isReadyToSend || loading}
          loading={loading}
          className="min-w-56 py-4 text-lg font-bold"
        />
      </motion.div>

      {/* Informações Adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="review-info-card-claro review-info-card-escuro">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ℹ️</span>
                </div>
                <h3 className="text-lg font-semibold review-info-title-claro review-info-title-escuro">
                  Informação Importante
                </h3>
              </div>
              <p className="text-sm review-info-text-claro review-info-text-escuro leading-relaxed">
                <strong>O envio das mensagens será processado em segundo plano.</strong>

                Você pode acompanhar o progresso em tempo real através do modal de progresso que aparecerá após o envio.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}