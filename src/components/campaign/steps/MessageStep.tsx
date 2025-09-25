/**
 * =====================================================
 * COMPONENTE MESSAGE STEP - CONFIGURAÇÃO DE MENSAGEM
 * =====================================================
 */

import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Lightbulb } from 'lucide-react'

import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface MessageStepProps {
  message: string
  onMessageChange: (message: string) => void
  whatsappConfig: any
  connectedInstance: string | null
}

export const MessageStep: React.FC<MessageStepProps> = ({
  message,
  onMessageChange,
  whatsappConfig: _whatsappConfig,
  connectedInstance: _connectedInstance
}) => {
  // Templates de mensagem
  const messageTemplates = [
    {
      name: 'Saudação Inicial (Para clientes novos)',
      template: 'Olá, {nome}! Tudo bem? Vi seu contato e gostaria de me apresentar. Meu nome é [Seu Nome] e sou da [Sua Empresa]. Fico à disposição para qualquer dúvida.'
    },
    {
      name: 'Mensagem de Follow-up (Após um contato inicial)',
      template: 'Olá, {nome}! Espero que esteja tudo bem. Estou entrando em contato para saber se teve a oportunidade de ver a nossa proposta que te enviei. Alguma dúvida?'
    },
    {
      name: 'Oferta ou Promoção',
      template: 'Oi, {nome}! Temos uma oferta especial que acredito que irá te interessar. [Breve descrição da oferta]. Que tal conversarmos para te explicar melhor?'
    },
    {
      name: 'Agendamento de Reunião',
      template: 'Olá, {nome}! Gostaria de agendar uma reunião para conversarmos sobre [Assunto]. Você tem disponibilidade na [Data] às [Hora]? Se não, por favor, me informe qual o melhor dia e horário para você.'
    }
  ]

  const insertTemplate = (template: string) => {
    onMessageChange(template)
  }

  const insertVariable = (variable: string) => {
    const cursorPos = (document.getElementById('message-input') as HTMLTextAreaElement)?.selectionStart || 0
    const newMessage = message.slice(0, cursorPos) + `{${variable}}` + message.slice(cursorPos)
    onMessageChange(newMessage)
  }

  return (
    <div className="space-y-8">
      {/* Header da Área de Mensagem */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 px-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold message-header-claro message-header-escuro">
              Escreva Sua Mensagem!
            </h1>
          </div>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 text-center">
          Crie uma mensagem personalizada para sua campanha usando variáveis e templates
        </p>
      </motion.div>
      <div className="max-w-4xl mx-auto">
        {/* Editor de Mensagem */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden shadow-xl">
              <CardHeader>
                <CardTitle

                  className="flex items-center gap-3 text-xl message-card-title-claro message-card-title-escuro"
                  style={{ color: 'var(--title-color)' }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span

                    className="message-card-title-claro message-card-title-escuro"
                    style={{ color: 'var(--title-color)' }}
                  >
                    Editor de Mensagem
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Área de texto */}
                <div className="space-y-4">
                  <textarea
                    id="message-input"
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    placeholder="Digite sua mensagem aqui... Use {nome}, {empresa}, etc. para personalizar"
                    className="w-full h-48 px-4 py-3 border-2 rounded-xl message-textarea-claro message-textarea-escuro resize-none text-base leading-relaxed shadow-sm focus:shadow-lg transition-all duration-300"
                  />

                </div>

                {/* Dica sobre Personalização */}
                <div className="space-y-4">
                  <div className="message-tip-card-claro message-tip-card-escuro rounded-xl p-3 sm:p-4 border">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">💡</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm message-tip-text-forced-claro message-tip-text-forced-escuro">
                          <div className="flex flex-wrap items-center gap-1">
                            <strong>Dica:</strong>

                            <span className="whitespace-nowrap">Use</span>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-shrink-0"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => insertVariable('nome')}
                                className="variable-button-claro variable-button-escuro px-2 py-1 font-mono text-xs shadow-sm hover:shadow-md transition-all duration-300 h-6"
                              >
                                {`{nome}`}
                              </Button>
                            </motion.div>
                          </div>
                          <div className="mt-1 text-sm message-tip-text-forced-claro message-tip-text-forced-escuro">
                            <span className="hidden sm:inline">na sua mensagem e ele será automaticamente substituído pelo nome de cada lead selecionado!</span>
                            <span className="sm:hidden">será substituído pelo nome de cada lead!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Templates */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="overflow-hidden shadow-xl">
              <CardHeader>
                <CardTitle

                  className="flex items-center gap-3 text-xl message-card-title-claro message-card-title-escuro"
                  style={{ color: 'var(--title-color)' }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <span

                    className="message-card-title-claro message-card-title-escuro"
                    style={{ color: 'var(--title-color)' }}
                  >
                    Templates de Mensagem
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {messageTemplates.map((template, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-32 p-4 text-left justify-start template-button-claro template-button-escuro shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => insertTemplate(template.template)}
                      >
                        <div className="space-y-2 w-full">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{template.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {template.template}
                          </p>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}