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

        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      // Resposta do backend recebida
      return data
    } catch (error: unknown) {

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
      const url = BACKEND_URL ? `${BACKEND_URL}/api/create-instance-and-qrcode` : '/api/create-instance-and-qrcode';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName, userName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar instância');
      }

      const data = await response.json();

      return {
        instanceName: data.instanceName,
        qrCodeBase64: data.qrCodeBase64,
        pairingCode: data.pairingCode,
        message: data.message
      };
    } catch (error) {

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

      return {
        success: true,
        message: data.message || 'Instância deletada com sucesso'
      };
    } catch (error) {

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

      return data;
    } catch (error) {

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

      // Construir URL baseada no endpoint do backend
      // Endpoint correto do backend: /api/qrcode/{instanceName}
      let url = `${BACKEND_URL}/api/qrcode/${instanceName}`;
      if (phoneNumber) {
        url += `?number=${encodeURIComponent(phoneNumber)}`;

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

      // Estruturar resposta baseada na documentação oficial da Evolution API
      // Documentação: https://doc.evolution-api.com/v1/api-reference/instance-controller/instance-connect

      // Processar código de pareamento - baseado na documentação oficial
      let simplePairingCode = null;
      if (data.pairingCode) {

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

                simplePairingCode = null;
              }
            }
          }
        } else {
          // Se já é um código curto, usar diretamente
          simplePairingCode = data.pairingCode;

        }
      }

      // Log final para debug
      if (data.pairingCode && data.pairingCode !== simplePairingCode) {
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

      return {
        success: true,
        message: data.message || 'Webhook configurado com sucesso'
      };
    } catch (error) {
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

      return {
        isHealthy: true,
        version: data.version,
        message: data.message
      };
    } catch (error) {

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

      return {
        instanceName: data.instanceName,
        state: data.state,
        message: data.message
      };
    } catch (error) {

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

      return data.success;
    } catch (error) {

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

        return;
      }

      try {

        const state = await this.getConnectionState(instanceName);

        // Só chama o callback se o estado mudou
        if (state.state !== currentState) {

          currentState = state.state;
          stateChangeCount++;
          lastStateChangeTime = Date.now();

          // Detectar loop infinito
          if (stateChangeCount >= maxStateChanges) {

            const timeInLoop = Date.now() - lastStateChangeTime;
            if (timeInLoop > maxTimeInLoop) {

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

        }

        // Para o polling se a conexão foi estabelecida
        if (state.state === 'open') {

          isPolling = false;
          return;
        }

        // Continua o polling
        if (isPolling) {

          setTimeout(poll, interval);
        }
      } catch (error) {

        // Continua o polling mesmo com erro
        if (isPolling) {

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
