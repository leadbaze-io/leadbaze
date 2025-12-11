import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Smartphone, CheckCircle, AlertTriangle, Loader2, RefreshCw, X, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { StatusBadge } from './ui/StatusBadge'
import { toast } from '../hooks/use-toast'
import EvolutionApiService from '../lib/evolutionApiService'
import { WhatsAppInstanceService } from '../lib/whatsappInstanceService'
import type { ConnectionState } from '../lib/evolutionApiService'
import './WhatsAppConnection.css'

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
  const [pairingCode, setPairingCode] = useState<string>('')
  const [instanceName, setInstanceName] = useState<string>('')
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const stopPollingRef = useRef<(() => void) | null>(null)

  // Verificar se já existe uma instância conectada
  useEffect(() => {
    const checkExistingInstance = async () => {
      if (userId) {
        try {
          const instance = await WhatsAppInstanceService.getUserInstance(userId)

          if (instance) {

            // Se tem instância com QR Code há mais de 1 hora, limpar
            if (instance.status === 'qrcode') {
              const createdTime = new Date(instance.created_at)
              const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

              if (createdTime < oneHourAgo) {
                await WhatsAppInstanceService.deleteInstance(instance.instance_name)
                return
              }
            }

            // Se tem instância conectada, verificar se ainda está ativa na Evolution
            if (instance.status === 'connected') {

              try {
                const evolutionState = await EvolutionApiService.getConnectionState(instance.instance_name)

                if (evolutionState.state === 'open' || evolutionState.state === 'connecting') {
                  // Instância ainda está ativa na Evolution

                  setInstanceName(instance.instance_name)
                  setConnectionState({
                    instanceName: instance.instance_name,
                    state: evolutionState.state,
                    message: evolutionState.state === 'open' ? 'WhatsApp já conectado!' : 'Sincronizando WhatsApp...'
                  })
                } else {
                  // Instância não está mais ativa na Evolution

                  await WhatsAppInstanceService.updateInstanceStatus(instance.instance_name, 'disconnected')
                  setConnectionState(null)
                  setInstanceName('')
                }
              } catch (evolutionError) {

                // Se não conseguir verificar na Evolution, marcar como desconectada
                await WhatsAppInstanceService.updateInstanceStatus(instance.instance_name, 'disconnected')
                setConnectionState(null)
                setInstanceName('')
              }
            } else if (instance.status === 'disconnected') {
              // Instância marcada como disconnected no banco, mas verificar se ainda está ativa na Evolution

              try {
                const evolutionState = await EvolutionApiService.getConnectionState(instance.instance_name)

                if (evolutionState.state === 'open' || evolutionState.state === 'connecting') {
                  // Instância ainda está ativa na Evolution - corrigir banco

                  await WhatsAppInstanceService.updateInstanceStatus(instance.instance_name, 'connected')
                  setInstanceName(instance.instance_name)
                  setConnectionState({
                    instanceName: instance.instance_name,
                    state: evolutionState.state,
                    message: evolutionState.state === 'open' ? 'WhatsApp já conectado!' : 'Sincronizando WhatsApp...'
                  })
                } else {
                  // Instância realmente está desconectada

                }
              } catch (evolutionError) {

              }
            } else if (instance.status === 'qrcode') {
              // Reutilizar instância QR Code existente

              setInstanceName(instance.instance_name)
              setConnectionState({
                instanceName: instance.instance_name,
                state: 'qrcode',
                message: 'Aguardando QR Code...'
              })

              // Buscar QR Code da instância existente
              startQRCodePolling(instance.instance_name)
            }
          } else {

          }
        } catch (error) {

        }
      }
    }

    checkExistingInstance()
  }, [userId])

  // Verificar periodicamente se a instância ainda está ativa
  useEffect(() => {
    if (connectionState && connectionState.state === 'open' && instanceName && !isPolling) {

      const interval = setInterval(async () => {
        try {

          const evolutionState = await EvolutionApiService.getConnectionState(instanceName)
          if (evolutionState.state !== 'open' && evolutionState.state !== 'connecting') {

            // Atualizar banco e estado local
            if (userId) {
              await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')
            }
            setConnectionState(null)
            setInstanceName('')
            setQrCode('')

            toast({
              title: '🔄 WhatsApp Desconectado',
              description: 'Sua instância foi desconectada da Evolution API.',
              variant: 'warning',
            })
          } else {

          }
        } catch (error) {

          // Se não conseguir verificar, marcar como desconectada
          if (userId) {
            await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')
          }
          setConnectionState(null)
          setInstanceName('')
          setQrCode('')
        }
      }, 30000) // Verificar a cada 30 segundos

      return () => {

        clearInterval(interval)
      }
    }
  }, [connectionState, instanceName, userId, isPolling])

  // Limpar polling quando componente for desmontado
  useEffect(() => {
    return () => {

      if (stopPollingRef.current) {
        stopPollingRef.current()
        stopPollingRef.current = null
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

      // 1. Deletar instância na Evolution API
      try {
        await EvolutionApiService.deleteInstance(instanceName)

      } catch (evolutionError) {
        console.log('⚠️ Erro ao deletar na Evolution API (pode já ter sido deletada):', evolutionError)
        // Continua mesmo se der erro na Evolution (pode já ter sido deletada)
      }

      // 2. Atualizar status no banco de dados
      if (userId) {
        try {
          await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')

        } catch (dbError) {

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
        title: '🔄 WhatsApp Desconectado!',
        description: 'Sua conta WhatsApp foi desconectada com sucesso.',
        variant: 'warning',
      })

      // 5. Chamar callback de desconexão
      onDisconnect?.()

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

      toast({
        title: '❌ Erro na Desconexão',
        description: errorMessage,
        variant: 'destructive',
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
      setPairingCode('')
      setConnectionState(null)
      setInstanceName('')

      // Parar qualquer polling anterior
      if (stopPollingRef.current) {

        stopPollingRef.current()
        stopPollingRef.current = null
      }

      // Aguardar um pouco para garantir que o polling anterior foi parado
      await new Promise(resolve => setTimeout(resolve, 100))
      // 1. Verificar se já existe uma instância desconectada para reutilizar
      let instanceNameToUse = ''

      if (userId) {
        try {
          const existingInstance = await WhatsAppInstanceService.getUserInstance(userId)

          if (existingInstance) {
            // Sempre deletar instância existente e criar nova para evitar problemas

            try {
              await WhatsAppInstanceService.deleteInstance(existingInstance.instance_name)

            } catch (deleteError) {

            }
          }

          // Sempre criar nova instância
          instanceNameToUse = EvolutionApiService.generateInstanceName(userId, userName)

          await WhatsAppInstanceService.createInstance(userId, instanceNameToUse)
        } catch (error) {

          instanceNameToUse = EvolutionApiService.generateInstanceName(userId, userName)
          await WhatsAppInstanceService.createInstance(userId, instanceNameToUse)
        }
      } else {
        instanceNameToUse = EvolutionApiService.generateInstanceName(userId, userName)
      }

      setInstanceName(instanceNameToUse)

      // 2. Verificar se a instância já existe na Evolution API
      let instance
      try {
        // Tentar criar instância na Evolution API
        instance = await EvolutionApiService.createInstanceAndQRCode(instanceNameToUse, userName)

      } catch (error) {
        // Se der erro 403 (instância já existe), tentar deletar e recriar
        if (error instanceof Error && (error.message.includes('already in use') || error.message.includes('already exists'))) {

          try {
            // Tentar deletar a instância existente
            await EvolutionApiService.deleteInstance(instanceNameToUse)

            // Criar nova instância
            instance = await EvolutionApiService.createInstanceAndQRCode(instanceNameToUse, userName)

          } catch (deleteError) {

            // Se não conseguir deletar, tentar reutilizar
            instance = {
              instanceName: instanceNameToUse,
              qrCodeBase64: '',
              pairingCode: '',
              message: 'Reutilizando instância existente'
            }
          }
        } else {
          throw error // Re-throw se for outro tipo de erro
        }
      }

      setConnectionState({
        instanceName: instance.instanceName,
        state: 'qrcode',
        message: 'Aguardando QR Code...'
      })

      // 3. Aguardar um pouco antes de buscar QR Code

      await new Promise(resolve => setTimeout(resolve, 2000))

      // 4. Buscar QR Code com polling
      startQRCodePolling(instance.instanceName)

      toast({
        title: '🚀 Instância Criada!',
        description: 'Aguardando QR Code...',
        variant: 'info',
      })

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

      toast({
        title: '❌ Erro na Conexão',
        description: errorMessage,
        variant: 'destructive',
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
    const maxAttempts = 30 // Aumentar tentativas
    const interval = 8000 // 8 segundos (mais tempo para Evolution API gerar QR Code)
    let isPolling = true

    const pollQRCode = async () => {
      if (!isPolling || attempts >= maxAttempts) {
        if (attempts >= maxAttempts) {

          setConnectionState({
            instanceName,
            state: 'disconnected',
            message: 'QR Code não disponível. Tente novamente.'
          })
        }
        return
      }

      try {

        const qrData = await EvolutionApiService.getQRCode(instanceName)

        if (qrData.hasQRCode && qrData.qrCodeBase64) {

          console.log('📱 [WHATSAPP] QR Code data:', qrData.qrCodeBase64.substring(0, 50) + '...')
          setQrCode(qrData.qrCodeBase64)

          // Verificar se também tem código de pareamento
          if (qrData.hasPairingCode && qrData.pairingCode) {

            setPairingCode(qrData.pairingCode)
            setConnectionState({
              instanceName,
              state: 'qrcode',
              message: 'Escaneie o QR Code ou use o código de pareamento'
            })
          } else {
            setPairingCode('')
            setConnectionState({
              instanceName,
              state: 'qrcode',
              message: 'Escaneie o QR Code com seu WhatsApp'
            })
          }

          // Iniciar polling para verificar status da conexão

          startConnectionPolling(instanceName)

          toast({
            title: '📱 QR Code Gerado!',
            description: qrData.hasPairingCode

              ? `Escaneie o QR Code ou use o código: ${qrData.pairingCode}`
              : 'Escaneie o código com seu WhatsApp para conectar.',
            variant: 'success',
          })
          return
        }

        // Se não encontrou QR Code, tentar novamente
        attempts++
        if (isPolling) {
          setTimeout(pollQRCode, interval)
        }

      } catch (error) {

        attempts++
        if (isPolling) {
          setTimeout(pollQRCode, interval)
        }
      }
    }

    // Função para parar o polling
    const stopPolling = () => {

      isPolling = false
    }

    // Armazenar referência para limpar depois
    stopPollingRef.current = stopPolling

    // Iniciar polling
    pollQRCode()

    return stopPolling
  }

  /**
   * Inicia o polling para verificar o estado da conexão
   */
  const startConnectionPolling = (instanceName: string) => {

    // Parar qualquer polling anterior
    if (stopPollingRef.current) {

      stopPollingRef.current()
    }

    setIsPolling(true)

    const stopPolling = EvolutionApiService.startConnectionPolling(
      instanceName,
      async (state: ConnectionState) => {
        setConnectionState(state)

        // Se conectou com sucesso
        if (state.state === 'open') {
          setIsPolling(false)

          // Persistir o status de conectado
          if (userId) {
            try {

              // Marcar como connected com timestamp (whatsapp_number será preenchido depois)
              await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'connected')

            } catch (error) {

            }
          }

          toast({
            title: '🎉 WhatsApp Conectado!',
            description: 'Sua conta WhatsApp foi conectada com sucesso.',
            variant: 'success',
          })
          onConnectionSuccess?.(instanceName)
        }

        // Se desconectou
        if (state.state === 'close' || state.state === 'disconnected') {
          setIsPolling(false)

          // Persistir o status de desconectado
          if (userId) {
            try {

              await WhatsAppInstanceService.updateInstanceStatus(instanceName, 'disconnected')

            } catch (error) {

            }
          }

          toast({
            title: '🔄 WhatsApp Desconectado',
            description: 'Sua conta WhatsApp foi desconectada.',
            variant: 'warning',
          })
        }
      },
      2000 // Verificar a cada 2 segundos (mais responsivo)
    )

    // Armazenar referência para limpar depois
    stopPollingRef.current = stopPolling
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
    setPairingCode('')
    setConnectionState(null)
    setInstanceName('')

    toast({
      title: '⏹️ Conexão Cancelada',
      description: 'O processo de conexão foi cancelado.',
      variant: 'warning',
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
        title: '🔄 QR Code Atualizado!',
        description: 'Novo QR Code gerado. Tente escanear novamente.',
        variant: 'info',
      })
    } catch (error) {

      toast({
        title: '❌ Erro',
        description: 'Não foi possível atualizar o QR Code.',
        variant: 'destructive',
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
    <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-foreground">
          <Smartphone className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
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

          <p className="text-sm text-muted-foreground mt-3">
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
            <p className="text-foreground font-medium">Criando instância...</p>
            <p className="text-sm text-muted-foreground mt-2">Aguarde um momento</p>
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
            <div className="bg-muted rounded-xl p-6 inline-block">
              <img
                src={qrCode}
                alt="QR Code para conectar WhatsApp"
                className="w-64 h-64 mx-auto border-4 border-white rounded-lg shadow-lg"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {isPolling && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                <span className="text-sm text-muted-foreground">
                  {isPolling ? 'Verificando conexão...' : 'QR Code gerado'}
                </span>
              </div>

              {/* Código de Pareamento */}
              {pairingCode && (
                <div className="pairing-code-container">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="pairing-code-icon"></div>
                    <h3 className="pairing-code-title">Código de Pareamento</h3>
                  </div>
                  <div className="pairing-code-box">
                    <p className="pairing-code-text">
                      {pairingCode}
                    </p>
                  </div>
                  <p className="pairing-code-instruction">
                    {pairingCode.length === 8

                      ? 'Digite este código no WhatsApp em vez de escanear o QR Code'
                      : 'Código de pareamento disponível - use o QR Code se este código não funcionar'
                    }
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
                  onClick={async () => {
                    if (instanceName) {
                      try {
                        const state = await EvolutionApiService.getConnectionState(instanceName);
                        setConnectionState(state);
                      } catch (error) {

                      }
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-600 dark:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verificar Status
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      // Parar polling atual
                      if (stopPollingRef.current) {
                        stopPollingRef.current();
                      }

                      // Limpar estados
                      setQrCode('');
                      setPairingCode('');
                      setConnectionState(null);
                      setIsPolling(false);

                      // Recriar instância
                      await handleConnectWhatsApp();

                      toast({
                        title: '🔄 Instância Recriada!',
                        description: 'Nova instância criada. Tente conectar novamente.',
                        variant: 'info',
                      });
                    } catch (error) {

                      toast({
                        title: '❌ Erro',
                        description: 'Não foi possível recriar a instância.',
                        variant: 'destructive',
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-600 dark:border-orange-200 dark:hover:bg-orange-950 dark:hover:text-orange-400"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recriar Instância
                </Button>

                <Button
                  onClick={handleStopConnection}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-600 dark:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Como conectar:</h3>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
                  <li>1. Abra o WhatsApp no seu celular</li>
                  <li>2. Vá em Configurações → Aparelhos conectados</li>
                  <li>3. Toque em "Conectar um aparelho"</li>
                  {pairingCode ? (
                    <>
                      <li>4. Escaneie o QR Code acima OU</li>
                      <li>5. Digite o código de pareamento mostrado acima</li>
                      {pairingCode.length !== 8 && (
                        <li className="text-orange-600 dark:text-orange-400">
                          ⚠️ Se o código não funcionar, use o QR Code
                        </li>
                      )}
                    </>
                  ) : (
                    <li>4. Escaneie o QR Code acima</li>
                  )}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status da Conexão */}
      <AnimatePresence>
        {(connectionState || instanceName) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center justify-between"
          >
            <StatusBadge

              status={connectionState?.state === 'close' ? 'disconnected' : (connectionState?.state === 'open' ? 'connected' : (connectionState?.state || 'disconnected'))}

              instanceName={connectionState?.instanceName || instanceName}
            />

            {(connectionState?.state === 'open' || instanceName) && (
              <Button
                onClick={handleDisconnectWhatsApp}
                variant="outline"
                size="sm"
                disabled={isDisconnecting}
                className="text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800 dark:text-red-600 dark:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                {isDisconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <LogOut className="w-4 h-4 mr-1" />
                )}
                {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
