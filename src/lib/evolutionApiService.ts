/**
 * Serviço para comunicação com o backend da Evolution API
 * Gerencia a criação de instâncias, QR Codes e verificação de status
 */

// Configuração do backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io';

export interface EvolutionInstance {
  instanceName: string;
  qrCodeBase64: string;
  pairingCode?: string;
  message: string;
}

export interface ConnectionState {
  instanceName: string;
  state: 'open' | 'connecting' | 'close' | 'disconnected' | 'qrcode' | 'error';
  message: string;
}

export class EvolutionApiService {
  /**
   * Dispara campanha para o backend encaminhar ao N8N
   */
  static async dispatchCampaignToWebhook(payload: unknown[]): Promise<{ success: boolean; data?: unknown; error?: string }>{
    try {
      // Enviando campanha para backend
      
      const response = await fetch(`${BACKEND_URL}/api/dispatch-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      // Resposta recebida

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [EVOLUTION-API] Erro na resposta:', errorData)
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      // Resposta do backend recebida
      return data
    } catch (error: unknown) {
      console.error('❌ [EVOLUTION-API] Erro ao enviar campanha ao backend:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, error: errorMessage || 'Erro desconhecido' }
    }
  }
  /**
   * Cria uma nova instância e retorna o QR Code
   * @param instanceName Nome único para a instância
   * @param userName Nome do usuário (opcional)
   * @returns Dados da instância criada
   */
  static async createInstanceAndQRCode(instanceName: string, userName?: string): Promise<EvolutionInstance> {
    try {
      console.log('🔄 Criando instância:', instanceName);
      console.log('🌐 BACKEND_URL:', BACKEND_URL);
      
      const url = BACKEND_URL ? `${BACKEND_URL}/api/create-instance-and-qrcode` : '/api/create-instance-and-qrcode';
      console.log('🔗 URL completa:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName, userName }),
      });

      if (!response.ok) {
        // Verificar se a resposta é JSON antes de tentar fazer parse
        const contentType = response.headers.get('content-type');
        let errorMessage = `Erro ao criar instância (HTTP ${response.status})`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do JSON de erro:', parseError);
          }
        } else {
          // Se não for JSON, provavelmente é HTML (erro 502, 503, etc)
          const text = await response.text();
          console.error('❌ Resposta não é JSON:', text.substring(0, 200));
          
          if (response.status === 502) {
            errorMessage = 'Servidor backend não está respondendo. Verifique se o servidor está online.';
          } else if (response.status === 503) {
            errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
          } else if (response.status === 504) {
            errorMessage = 'Tempo de resposta excedido. O servidor pode estar sobrecarregado.';
          } else {
            errorMessage = `Erro do servidor (${response.status}). Tente novamente mais tarde.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Instância criada com sucesso:', data);
      
      return {
        instanceName: data.instanceName,
        qrCodeBase64: data.qrCodeBase64,
        pairingCode: data.pairingCode,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Erro ao criar instância:', error);
      
      // Melhorar mensagem de erro para o usuário
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      }
      
      throw error;
    }
  }

  /**
   * Deleta uma instância da Evolution API
   * @param instanceName Nome da instância a ser deletada
   * @returns Resultado da operação
   */
  static async deleteInstance(instanceName: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ [EVOLUTION-API] Deletando instância:', instanceName);
      
      const response = await fetch(`${BACKEND_URL}/api/delete-instance/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar instância');
      }

      const data = await response.json();
      console.log('✅ [EVOLUTION-API] Instância deletada com sucesso:', data);
      
      return {
        success: true,
        message: data.message || 'Instância deletada com sucesso'
      };
    } catch (error) {
      console.error('❌ [EVOLUTION-API] Erro ao deletar instância:', error);
      throw error;
    }
  }

  /**
   * Obtém informações sobre a Evolution API
   * Baseado na documentação: https://doc.evolution-api.com/v1/api-reference/get-information
   * @returns Informações da API
   */
  static async getApiInfo(): Promise<{
    status: number;
    message: string;
    version: string;
    swagger: string;
    manager: string;
    documentation: string;
  }> {
    try {
      console.log('🔍 [EVOLUTION-API] Obtendo informações da API...');
      
      const response = await fetch(`${BACKEND_URL}/api/evolution/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao obter informações da Evolution API');
      }

      const data = await response.json();
      console.log('📊 [EVOLUTION-API] Informações obtidas:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao obter informações da Evolution API:', error);
      throw error;
    }
  }

  /**
   * Busca o QR Code de uma instância específica
   * Baseado na documentação: https://doc.evolution-api.com/v1/api-reference/instance-controller/instance-connect
   * @param instanceName Nome da instância
   * @param phoneNumber Número de telefone opcional (com código do país)
   * @returns Dados do QR Code e código de pareamento
   */
  static async getQRCode(instanceName: string, phoneNumber?: string): Promise<{
    success: boolean;
    instanceName: string;
    qrCodeBase64: string | null;
    pairingCode: string | null;
    hasQRCode: boolean;
    hasPairingCode: boolean;
    count: number;
    phoneNumber: string | null;
    message: string;
  }> {
    try {
      console.log('🔍 Buscando QR Code para instância:', instanceName);
      
      // Construir URL baseada no endpoint do backend
      // Endpoint correto do backend: /api/qrcode/{instanceName}
      let url = `${BACKEND_URL}/api/qrcode/${instanceName}`;
      if (phoneNumber) {
        url += `?number=${encodeURIComponent(phoneNumber)}`;
        console.log('📞 Conectando com número específico:', phoneNumber);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar QR Code');
      }

      const data = await response.json();
      console.log('📱 Resposta do QR Code:', data);
      
      // Estruturar resposta baseada na documentação oficial da Evolution API
      // Documentação: https://doc.evolution-api.com/v1/api-reference/instance-controller/instance-connect
      console.log('📋 [EVOLUTION-API] Resposta completa da API:', data);
      
      // Processar código de pareamento - baseado na documentação oficial
      let simplePairingCode = null;
      if (data.pairingCode) {
        console.log('🔑 [EVOLUTION-API] Código de pareamento recebido:', data.pairingCode);
        
        // Se o pairingCode é um código longo, tentar extrair um código simples
        if (data.pairingCode.length > 8) {
          // Método 1: Tentar extrair código de 8 caracteres alfanuméricos consecutivos
          const match = data.pairingCode.match(/[A-Z0-9]{8}/);
          if (match) {
            simplePairingCode = match[0];
            console.log('🔑 [EVOLUTION-API] Código extraído (método 1):', simplePairingCode);
          } else {
            // Método 2: Extrair os primeiros 8 caracteres alfanuméricos válidos
            const validChars = data.pairingCode.replace(/[^A-Z0-9]/g, '').substring(0, 8);
            if (validChars.length >= 8) {
              simplePairingCode = validChars;
              console.log('🔑 [EVOLUTION-API] Código extraído (método 2):', simplePairingCode);
            } else {
              // Método 3: Tentar extrair código de 6-8 caracteres se disponível
              const shortMatch = data.pairingCode.match(/[A-Z0-9]{6,8}/);
              if (shortMatch) {
                simplePairingCode = shortMatch[0];
                console.log('🔑 [EVOLUTION-API] Código extraído (método 3):', simplePairingCode);
              } else {
                console.log('⚠️ [EVOLUTION-API] Não foi possível extrair código válido do pairingCode');
                simplePairingCode = null;
              }
            }
          }
        } else {
          // Se já é um código curto, usar diretamente
          simplePairingCode = data.pairingCode;
          console.log('🔑 [EVOLUTION-API] Código já é válido:', simplePairingCode);
        }
      }
      
      // Log final para debug
      if (data.pairingCode && data.pairingCode !== simplePairingCode) {
        console.log('🔑 [EVOLUTION-API] Código original:', data.pairingCode);
        console.log('🔑 [EVOLUTION-API] Código processado:', simplePairingCode);
      }
      
      return {
        success: true,
        instanceName,
        qrCodeBase64: data.code || data.qrCodeBase64 || null,
        pairingCode: simplePairingCode,
        hasQRCode: !!(data.code || data.qrCodeBase64),
        hasPairingCode: !!simplePairingCode,
        count: data.count || 1,
        phoneNumber: phoneNumber || null,
        message: data.message || 'QR Code gerado com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar QR Code:', error);
      throw error;
    }
  }

  /**
   * Configura webhooks para uma instância
   * Baseado na documentação: https://doc.evolution-api.com/v1/api-reference/webhook-controller/set-webhook
   * @param instanceName Nome da instância
   * @param webhookUrl URL do webhook
   * @returns Resultado da configuração
   */
  static async setWebhook(instanceName: string, webhookUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔗 [EVOLUTION-API] Configurando webhook para instância:', instanceName);
      
      const payload = {
        url: webhookUrl,
        webhook_by_events: false,
        webhook_base64: false,
        events: [
          "QRCODE_UPDATED",
          "CONNECTION_UPDATE",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE"
        ]
      };
      
      const response = await fetch(`${BACKEND_URL}/api/webhook/instance/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao configurar webhook');
      }

      const data = await response.json();
      console.log('✅ [EVOLUTION-API] Webhook configurado com sucesso:', data);
      
      return {
        success: true,
        message: data.message || 'Webhook configurado com sucesso'
      };
    } catch (error) {
      console.error('❌ [EVOLUTION-API] Erro ao configurar webhook:', error);
      throw error;
    }
  }

  /**
   * Verifica se a Evolution API está funcionando
   * Baseado na documentação: https://doc.evolution-api.com/v1/api-reference/get-information
   * @returns Status da API
   */
  static async checkApiHealth(): Promise<{
    isHealthy: boolean;
    version?: string;
    message?: string;
    error?: string;
  }> {
    try {
      console.log('🏥 [EVOLUTION-API] Verificando saúde da API...');
      
      const response = await fetch(`${BACKEND_URL}/api/evolution/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API não está respondendo: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [EVOLUTION-API] API está funcionando:', data);
      
      return {
        isHealthy: true,
        version: data.version,
        message: data.message
      };
    } catch (error) {
      console.error('❌ [EVOLUTION-API] API não está funcionando:', error);
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verifica o estado da conexão de uma instância
   * @param instanceName Nome da instância
   * @returns Estado atual da conexão
   */
  static async getConnectionState(instanceName: string): Promise<ConnectionState> {
    try {
      console.log('🔄 Verificando estado da instância:', instanceName);
      
      const response = await fetch(`${BACKEND_URL}/api/connection-state/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar estado da conexão');
      }

      const data = await response.json();
      console.log('✅ Estado da conexão:', data);
      
      return {
        instanceName: data.instanceName,
        state: data.state,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Erro ao verificar estado da conexão:', error);
      throw error;
    }
  }


  /**
   * Verifica se o backend está funcionando
   * @returns Status de saúde do backend
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      console.log('✅ Backend saudável:', data);
      return data.success;
    } catch (error) {
      console.error('❌ Backend não está respondendo:', error);
      return false;
    }
  }

  /**
   * Gera um nome único para a instância
   * @param userId ID do usuário (opcional)
   * @param userName Nome do usuário (opcional)
   * @returns Nome único da instância
   */
  static generateInstanceName(userId?: string, userName?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    // Usar o nome do usuário se disponível, senão usar o ID
    let userPrefix = 'user';
    if (userName) {
      // Limpar o nome do usuário para usar apenas caracteres válidos
      userPrefix = userName
        .replace(/[^a-zA-Z0-9]/g, '') // Remove caracteres especiais
        .toLowerCase() // Converte para minúsculas
        .substring(0, 20); // Limita a 20 caracteres
    } else if (userId) {
      userPrefix = userId.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    return `${userPrefix}_${timestamp}_${random}`;
  }

  /**
   * Inicia polling para verificar o estado da conexão
   * @param instanceName Nome da instância
   * @param onStateChange Callback chamado quando o estado muda
   * @param interval Intervalo em milissegundos (padrão: 5000ms)
   * @returns Função para parar o polling
   */
  static startConnectionPolling(
    instanceName: string,
    onStateChange: (state: ConnectionState) => void,
    interval: number = 5000
  ): () => void {
    let isPolling = true;
    let currentState: string | null = null;
    let stateChangeCount = 0;
    let lastStateChangeTime = Date.now();
    const maxStateChanges = 10; // Máximo de mudanças de estado
    const maxTimeInLoop = 60000; // 1 minuto máximo em loop

    const poll = async () => {
      if (!isPolling) {
        console.log('🛑 [POLLING] Polling parado, não continuando...');
        return;
      }

      try {
        console.log('🔄 [POLLING] Verificando estado da instância:', instanceName);
        const state = await this.getConnectionState(instanceName);
        console.log('📊 [POLLING] Estado atual:', state);
        
        // Só chama o callback se o estado mudou
        if (state.state !== currentState) {
          console.log('🔄 [POLLING] Estado mudou de', currentState, 'para', state.state);
          currentState = state.state;
          stateChangeCount++;
          lastStateChangeTime = Date.now();
          
          // Detectar loop infinito
          if (stateChangeCount >= maxStateChanges) {
            console.log('⚠️ [POLLING] Muitas mudanças de estado detectadas, possível loop infinito');
            const timeInLoop = Date.now() - lastStateChangeTime;
            if (timeInLoop > maxTimeInLoop) {
              console.log('❌ [POLLING] Loop infinito detectado, parando polling');
              isPolling = false;
              onStateChange({
                instanceName,
                state: 'error',
                message: 'Loop infinito detectado. Tente recriar a instância.'
              });
              return;
            }
          }
          
          onStateChange(state);
        } else {
          console.log('⏸️ [POLLING] Estado não mudou, continuando...');
        }

        // Para o polling se a conexão foi estabelecida
        if (state.state === 'open') {
          console.log('✅ [POLLING] Conexão estabelecida, parando polling...');
          isPolling = false;
          return;
        }

        // Continua o polling
        if (isPolling) {
          console.log('⏰ [POLLING] Agendando próxima verificação em', interval, 'ms...');
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.error('❌ [POLLING] Erro no polling:', error);
        
        // Continua o polling mesmo com erro
        if (isPolling) {
          console.log('🔄 [POLLING] Continuando polling mesmo com erro...');
          setTimeout(poll, interval);
        }
      }
    };

    // Inicia o polling
    poll();

    // Retorna função para parar o polling
    return () => {
      isPolling = false;
    };
  }
}

export default EvolutionApiService; 