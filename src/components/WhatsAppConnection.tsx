import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Smartphone, CheckCircle, AlertTriangle, Loader2, RefreshCw, X, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from '../hooks/use-toast'
import EvolutionApiService from '../lib/evolutionApiService'
import { WhatsAppInstanceService } from '../lib/whatsappInstanceService'
import type { ConnectionState } from '../lib/evolutionApiService'

interface WhatsAppConnectionProps {
  userId?: string
  userName?: string
  onConnectionSuccess?: (instanceName: string) => void
  onConnectionError?: (error: string) => void
  onDisconnect?: () => void
}

export default function WhatsAppConnection({ 
  userId, 
  userName, 
  onConnectionSuccess, 
  onConnectionError,
  onDisconnect
}: WhatsAppConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [instanceName, setInstanceName] = useState<string>('')
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const stopPollingRef = useRef<(() => void) | null>(null)

  // Verificar se já existe uma instância conectada
  useEffect(() => {
    const checkExistingInstance = async () => {
      if (userId) {
        try {
          console.log('🔍 Verificando instância existente no banco...')
          const instance = await WhatsAppInstanceService.getUserInstance(userId)
          if (instance && instance.status === 'connected') {
            console.log('✅ Instância conectada encontrada no banco:', instance.instance_name)
            
            // Verificar se a instância ainda existe na Evolution API
            try {
              const evolutionState = await EvolutionApiService.getConnectionState(instance.instance_name)
              console.log('🔍 Estado na Evolution API:', evolutionState)
              
              if (evolutionState.state === 'open') {
                // Instância ainda está ativa na Evolution
                setInstanceName(instance.instance_name)
                setConnectionState({
                  instanceName: instance.instance_name,
                  state: 'open',
                  message: 'WhatsApp já conectado!'
                })
              } else {
                // Instância não está mais ativa na Evolution
                console.log('⚠️ Instância não está mais ativa na Evolution, atualizando banco...')
                await WhatsAppInstanceService.updateInstanceStatus(instance.instance_name, 'disconnected')
                setConnectionState(null)
                setInstanceName('')
              }
            } catch (evolutionError) {
              console.log('⚠️ Erro ao verificar Evolution API, instância pode ter sido deletada:', evolutionError)
              // Se não conseguir verificar na Evolution, marcar como desconectada
              await WhatsAppInstanceService.updateInstanceStatus(instance.instance_name, 'disconnected')
              setConnectionState(null)
              setInstanceName('')
            }
          } else {
            console.log('ℹ️ Nenhuma instância conectada encontrada')
          }
        } catch (error) {
          console.error('❌ Erro ao verificar instância existente:', error)
        }
      }
    }

    checkExistingInstance()
  }, [userId])

  // Verificar periodicamente se a instância ainda está ativa
  useEffect(() => {
    if (connectionState && connectionState.state === 'open' && instanceName) {
      const interval = setInterval(async () => {
        try {
          const evolutionState = await EvolutionApiService.getConnectionState(instanceName)
          if (evolutionState.state !== 'open') {
            console.log('⚠️ Instância não está mais ativa na Evolution, atualizando...')
            // Atualizar banco e estado local
            if (userId) {
              await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')
            }
            setConnectionState(null)
            setInstanceName('')
            setQrCode('')
            
            toast({
              title: 'WhatsApp Desconectado',
              description: 'Sua instância foi desconectada da Evolution API.',
              variant: 'destructive'
            })
          }
        } catch (error) {
          console.log('⚠️ Erro ao verificar status da instância:', error)
          // Se não conseguir verificar, marcar como desconectada
          if (userId) {
            await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')
          }
          setConnectionState(null)
          setInstanceName('')
          setQrCode('')
        }
      }, 30000) // Verificar a cada 30 segundos

      return () => clearInterval(interval)
    }
  }, [connectionState, instanceName, userId])

  // Limpar polling quando componente for desmontado
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current()
      }
    }
  }, [])

  /**
   * Desconecta o WhatsApp da instância atual
   */
  const handleDisconnectWhatsApp = async () => {
    if (!instanceName) return

    try {
      setIsDisconnecting(true)
      console.log('🔄 Desconectando WhatsApp...')

      // 1. Deletar instância na Evolution API
      try {
        await EvolutionApiService.deleteInstance(instanceName)
        console.log('✅ Instância deletada na Evolution API')
      } catch (evolutionError) {
        console.log('⚠️ Erro ao deletar na Evolution API (pode já ter sido deletada):', evolutionError)
        // Continua mesmo se der erro na Evolution (pode já ter sido deletada)
      }

      // 2. Atualizar status no banco de dados
      if (userId) {
        try {
          await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')
          console.log('✅ Status atualizado no banco')
        } catch (dbError) {
          console.error('❌ Erro ao atualizar banco:', dbError)
        }
      }

      // 3. Limpar estado local
      setConnectionState(null)
      setInstanceName('')
      setQrCode('')

      // 4. Parar polling se estiver ativo
      if (stopPollingRef.current) {
        stopPollingRef.current()
        stopPollingRef.current = null
      }
      setIsPolling(false)

      toast({
        title: 'WhatsApp Desconectado!',
        description: 'Sua conta WhatsApp foi desconectada com sucesso.',
      })

      // 5. Chamar callback de desconexão
      onDisconnect?.()

    } catch (error) {
      console.error('❌ Erro ao desconectar WhatsApp:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      toast({
        title: 'Erro na Desconexão',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  /**
   * Inicia o processo de conexão WhatsApp
   */
  const handleConnectWhatsApp = async () => {
    try {
      setIsConnecting(true)
      setQrCode('')
      setConnectionState(null)

      // Gerar nome único para a instância usando o nome do usuário
      const newInstanceName = EvolutionApiService.generateInstanceName(userId, userName)
      setInstanceName(newInstanceName)

      console.log('🔄 Iniciando conexão WhatsApp...')

      // 1. Criar instância no banco de dados
      if (userId) {
        await WhatsAppInstanceService.createInstance(userId, newInstanceName)
      }

      // 2. Criar instância na Evolution API
      const instance = await EvolutionApiService.createInstanceAndQRCode(newInstanceName, userName)
      
      setConnectionState({
        instanceName: instance.instanceName,
        state: 'qrcode',
        message: 'Aguardando QR Code...'
      })

      // 2. Buscar QR Code com polling
      startQRCodePolling(instance.instanceName)

      toast({
        title: 'Instância Criada!',
        description: 'Aguardando QR Code...',
      })

    } catch (error) {
      console.error('❌ Erro ao conectar WhatsApp:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      toast({
        title: 'Erro na Conexão',
        description: errorMessage,
        variant: 'destructive'
      })

      onConnectionError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Inicia o polling para buscar o QR Code
   */
  const startQRCodePolling = (instanceName: string) => {
    let attempts = 0
    const maxAttempts = 20
    const interval = 2000 // 2 segundos

    const pollQRCode = async () => {
      if (attempts >= maxAttempts) {
        console.log('❌ Máximo de tentativas atingido para QR Code')
        setConnectionState({
          instanceName,
          state: 'disconnected',
          message: 'QR Code não disponível. Tente novamente.'
        })
        return
      }

      try {
        console.log(`🔍 Tentativa ${attempts + 1} de buscar QR Code...`)
        const qrData = await EvolutionApiService.getQRCode(instanceName)
        
        if (qrData.hasQRCode && qrData.qrCodeBase64) {
          console.log('✅ QR Code encontrado!')
          setQrCode(qrData.qrCodeBase64)
          setConnectionState({
            instanceName,
            state: 'qrcode',
            message: 'Escaneie o QR Code com seu WhatsApp'
          })

          // Iniciar polling para verificar status da conexão
          startConnectionPolling(instanceName)

          toast({
            title: 'QR Code Gerado!',
            description: 'Escaneie o código com seu WhatsApp para conectar.',
          })
          return
        }

        // Se não encontrou QR Code, tentar novamente
        attempts++
        setTimeout(pollQRCode, interval)

      } catch (error) {
        console.error('❌ Erro ao buscar QR Code:', error)
        attempts++
        setTimeout(pollQRCode, interval)
      }
    }

    // Iniciar polling
    pollQRCode()
  }

  /**
   * Inicia o polling para verificar o estado da conexão
   */
  const startConnectionPolling = (instanceName: string) => {
    setIsPolling(true)

    stopPollingRef.current = EvolutionApiService.startConnectionPolling(
      instanceName,
      async (state: ConnectionState) => {
        setConnectionState(state)
        
        // Se conectou com sucesso
        if (state.state === 'open') {
          setIsPolling(false)
          
          // Persistir o status de conectado
          if (userId) {
            try {
              console.log('💾 Salvando status conectado no banco...')
              await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'connected')
              console.log('✅ Status salvo com sucesso!')
            } catch (error) {
              console.error('❌ Erro ao persistir status:', error)
            }
          }
          
          toast({
            title: 'WhatsApp Conectado!',
            description: 'Sua conta WhatsApp foi conectada com sucesso.',
          })
          onConnectionSuccess?.(instanceName)
        }
        
        // Se desconectou
        if (state.state === 'close' || state.state === 'disconnected') {
          setIsPolling(false)
          
          // Persistir o status de desconectado
          if (userId) {
            try {
              console.log('💾 Salvando status desconectado no banco...')
              await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')
              console.log('✅ Status salvo com sucesso!')
            } catch (error) {
              console.error('❌ Erro ao persistir status:', error)
            }
          }
          
          toast({
            title: 'WhatsApp Desconectado',
            description: 'Sua conta WhatsApp foi desconectada.',
            variant: 'destructive'
          })
        }
      },
      5000 // Verificar a cada 5 segundos
    )
  }

  /**
   * Para o processo de conexão
   */
  const handleStopConnection = () => {
    if (stopPollingRef.current) {
      stopPollingRef.current()
      stopPollingRef.current = null
    }
    
    setIsPolling(false)
    setQrCode('')
    setConnectionState(null)
    setInstanceName('')
    
    toast({
      title: 'Conexão Cancelada',
      description: 'O processo de conexão foi cancelado.',
    })
  }

  /**
   * Recarrega o QR Code
   */
  const handleRefreshQR = async () => {
    if (!instanceName) return
    
    try {
      setIsConnecting(true)
      
      const instance = await EvolutionApiService.createInstanceAndQRCode(instanceName, userName)
      setQrCode(instance.qrCodeBase64)
      
      toast({
        title: 'QR Code Atualizado!',
        description: 'Novo QR Code gerado. Tente escanear novamente.',
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar QR Code:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o QR Code.',
        variant: 'destructive'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Renderiza o ícone de status baseado no estado da conexão
   */
  const renderStatusIcon = () => {
    if (!connectionState) return null

    switch (connectionState.state) {
      case 'open':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'connecting':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'qrcode':
        return <QrCode className="w-5 h-5 text-orange-600" />
      case 'close':
      case 'disconnected':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Smartphone className="w-5 h-5 text-gray-600" />
    }
  }

  /**
   * Renderiza a cor do status baseado no estado da conexão
   */
  const getStatusColor = () => {
    if (!connectionState) return 'text-gray-600'

    switch (connectionState.state) {
      case 'open':
        return 'text-green-600'
      case 'connecting':
        return 'text-blue-600'
      case 'qrcode':
        return 'text-orange-600'
      case 'close':
      case 'disconnected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-green-600" />
          Conectar WhatsApp
        </h2>
        
        {connectionState && (
          <div className="flex items-center space-x-2">
            {renderStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {connectionState.message}
            </span>
          </div>
        )}
      </div>

      {/* Botão de Conectar */}
      {!qrCode && !isConnecting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button
            onClick={handleConnectWhatsApp}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Conectar meu WhatsApp
          </Button>
          
          <p className="text-sm text-gray-500 mt-3">
            Clique para gerar um QR Code e conectar sua conta WhatsApp
          </p>
        </motion.div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {isConnecting && !qrCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Criando instância...</p>
            <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code */}
      <AnimatePresence>
        {qrCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-6"
          >
            <div className="bg-gray-50 rounded-xl p-6 inline-block">
              <img
                src={qrCode}
                alt="QR Code para conectar WhatsApp"
                className="w-64 h-64 mx-auto border-4 border-white rounded-lg shadow-lg"
              />
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {isPolling && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                <span className="text-sm text-gray-600">
                  {isPolling ? 'Verificando conexão...' : 'QR Code gerado'}
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={handleRefreshQR}
                  variant="outline"
                  size="sm"
                  disabled={isConnecting}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Atualizar QR
                </Button>
                
                <Button
                  onClick={handleStopConnection}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-medium text-blue-800 mb-2">Como conectar:</h3>
                <ol className="text-sm text-blue-700 space-y-1 text-left">
                  <li>1. Abra o WhatsApp no seu celular</li>
                  <li>2. Vá em Configurações → Aparelhos conectados</li>
                  <li>3. Toque em "Conectar um aparelho"</li>
                  <li>4. Escaneie o QR Code acima</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status da Conexão */}
      <AnimatePresence>
        {connectionState && connectionState.state === 'open' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-800">
                    WhatsApp Conectado com Sucesso!
                  </h3>
                  <p className="text-sm text-green-700">
                    Sua conta está pronta para enviar mensagens.
                  </p>
                  {instanceName && (
                    <p className="text-xs text-green-600 mt-1">
                      Instância: {instanceName}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handleDisconnectWhatsApp}
                variant="outline"
                size="sm"
                disabled={isDisconnecting}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                {isDisconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <LogOut className="w-4 h-4 mr-1" />
                )}
                {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 