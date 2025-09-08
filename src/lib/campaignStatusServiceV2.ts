/**
 * Serviço V2 para gerenciamento de status de campanhas
 * Usa webhooks em vez de polling para atualizações em tempo real
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://leadbaze.io' 
  : 'http://localhost:3001';

export interface CampaignStatus {
  id: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  success_count?: number;
  failed_count?: number;
  total_leads?: number;
  progress?: number;
  sent_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface CampaignProgress {
  campaignId: string;
  progress: number;
  leadIndex: number;
  totalLeads: number;
  successCount: number;
  failedCount: number;
  currentLead?: {
    phone: string;
    name: string;
    success: boolean;
  };
  error?: string;
}

export interface CampaignCompletion {
  campaignId: string;
  status: 'completed' | 'failed';
  successCount: number;
  failedCount: number;
  totalProcessed: number;
  completedAt: string;
}

export class CampaignStatusServiceV2 {
  private static eventSource: EventSource | null = null;

  /**
   * Inicia o rastreamento de uma campanha
   */
  static async startCampaignTracking(campaignId: string, totalLeads: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaign/status/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          totalLeads
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao iniciar rastreamento da campanha:', error);
      return false;
    }
  }

  /**
   * Verifica o status atual de uma campanha
   */
  static async getCampaignStatus(campaignId: string): Promise<CampaignStatus | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaign/status/${campaignId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.campaign;
      } else {
        console.error('Erro ao buscar status da campanha:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao verificar status da campanha:', error);
      return null;
    }
  }

  /**
   * Inicia Server-Sent Events para receber atualizações em tempo real
   */
  static startRealTimeUpdates(campaignId: string, onProgress: (progress: CampaignProgress) => void, onComplete: (completion: CampaignCompletion) => void): () => void {
    console.log('🔌 [CampaignStatusServiceV2] Iniciando conexão SSE...');
    
    // Parar conexão anterior se existir
    this.stopRealTimeUpdates();

    // Criar nova conexão SSE
    const sseUrl = `${API_BASE_URL}/api/campaign/status/stream/${campaignId}`;
    console.log('🌐 [CampaignStatusServiceV2] Conectando SSE em:', sseUrl);
    
    const eventSource = new EventSource(sseUrl);
    this.eventSource = eventSource;
    
    console.log('📡 [CampaignStatusServiceV2] EventSource criado:', eventSource);

    // Listener para progresso
    eventSource.addEventListener('progress', (event) => {
      console.log('📊 [CampaignStatusServiceV2] Evento progress recebido:', event);
      try {
        const progressData: CampaignProgress = JSON.parse(event.data);
        console.log('📈 [CampaignStatusServiceV2] Dados de progresso:', progressData);
        onProgress(progressData);
      } catch (error) {
        console.error('❌ [CampaignStatusServiceV2] Erro ao processar evento de progresso:', error);
      }
    });

    // Listener para mensagens genéricas (fallback)
    eventSource.addEventListener('message', (event) => {
      console.log('📨 [CampaignStatusServiceV2] Mensagem genérica recebida:', event);
      console.log('📨 [CampaignStatusServiceV2] Dados da mensagem:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          console.log('📈 [CampaignStatusServiceV2] Processando progresso via mensagem genérica:', data.data);
          console.log('🔄 [CampaignStatusServiceV2] Chamando callback onProgress...');
          onProgress(data.data);
          console.log('✅ [CampaignStatusServiceV2] Callback onProgress chamado com sucesso');
        } else if (data.type === 'complete') {
          console.log('🎉 [CampaignStatusServiceV2] Processando conclusão via mensagem genérica:', data.data);
          console.log('🔄 [CampaignStatusServiceV2] Chamando callback onComplete...');
          onComplete(data.data);
          console.log('✅ [CampaignStatusServiceV2] Callback onComplete chamado com sucesso');
        }
      } catch (error) {
        console.error('❌ [CampaignStatusServiceV2] Erro ao processar mensagem genérica:', error);
      }
    });

    // Listener para conclusão
    eventSource.addEventListener('complete', (event) => {
      console.log('✅ [CampaignStatusServiceV2] Evento complete recebido:', event);
      try {
        const completionData: CampaignCompletion = JSON.parse(event.data);
        console.log('🎉 [CampaignStatusServiceV2] Dados de conclusão:', completionData);
        onComplete(completionData);
      } catch (error) {
        console.error('❌ [CampaignStatusServiceV2] Erro ao processar evento de conclusão:', error);
      }
    });

    // Listener para erros
    eventSource.addEventListener('error', (event) => {
      console.error('❌ [CampaignStatusServiceV2] Erro na conexão SSE:', event);
      console.error('❌ [CampaignStatusServiceV2] EventSource readyState:', eventSource.readyState);
    });

    // Listener para abertura da conexão
    eventSource.addEventListener('open', () => {
      console.log('✅ [CampaignStatusServiceV2] Conexão SSE estabelecida para campanha:', campaignId);
    });

    // Retornar função para parar as atualizações
    return () => {
      this.stopRealTimeUpdates();
    };
  }

  /**
   * Para as atualizações em tempo real
   */
  static stopRealTimeUpdates(): void {
    if (this.eventSource) {
      console.log('🔌 [CampaignStatusServiceV2] Fechando conexão SSE...');
      this.eventSource.close();
      this.eventSource = null;
      console.log('✅ [CampaignStatusServiceV2] Conexão SSE fechada');
    } else {
      console.log('ℹ️ [CampaignStatusServiceV2] Nenhuma conexão SSE ativa para fechar');
    }
  }

  /**
   * Sistema de fallback com polling (para quando SSE não estiver disponível)
   */
  static startFallbackPolling(
    campaignId: string,
    onStatusUpdate: (status: CampaignStatus) => void,
    onComplete: () => void,
    intervalMs: number = 5000, // 5 segundos
    maxAttempts: number = 120 // 10 minutos máximo
  ): () => void {
    let attempts = 0;
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      attempts++;
      
      try {
        const status = await this.getCampaignStatus(campaignId);
        
        if (status) {
          onStatusUpdate(status);
          
          // Se a campanha foi concluída ou falhou, parar o polling
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(intervalId);
            onComplete();
            return;
          }
        }
        
        // Se excedeu o número máximo de tentativas, parar o polling
        if (attempts >= maxAttempts) {
          console.warn(`Polling da campanha ${campaignId} excedeu o tempo limite`);
          clearInterval(intervalId);
          onComplete();
        }
      } catch (error) {
        console.error('Erro no polling de status:', error);
        
        // Se excedeu o número máximo de tentativas, parar o polling
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          onComplete();
        }
      }
    };

    // Verificar imediatamente
    checkStatus();
    
    // Configurar intervalo
    intervalId = setInterval(checkStatus, intervalMs);

    // Retornar função para parar o polling
    return () => {
      clearInterval(intervalId);
    };
  }

  /**
   * Método híbrido: tenta SSE primeiro, fallback para polling
   */
  static startStatusTracking(
    campaignId: string,
    onProgress: (progress: CampaignProgress) => void,
    onComplete: (completion: CampaignCompletion) => void,
    onStatusUpdate?: (status: CampaignStatus) => void
  ): () => void {
    console.log('🚀 [CampaignStatusServiceV2] Iniciando rastreamento da campanha:', campaignId);
    console.log('🔗 [CampaignStatusServiceV2] URL base:', API_BASE_URL);
    
    // Tentar SSE primeiro
    try {
      console.log('📡 [CampaignStatusServiceV2] Tentando conectar via SSE...');
      const stopSSE = this.startRealTimeUpdates(campaignId, onProgress, onComplete);
      
      console.log('✅ [CampaignStatusServiceV2] SSE conectado com sucesso');
      // Se SSE funcionou, retornar função de parada
      return stopSSE;
    } catch (error) {
      console.warn('❌ [CampaignStatusServiceV2] SSE não disponível, usando polling como fallback:', error);
      
      // Fallback para polling
      return this.startFallbackPolling(
        campaignId,
        (status) => {
          // Converter status para formato de progresso
          const progress: CampaignProgress = {
            campaignId: status.id,
            progress: status.progress || 0,
            leadIndex: (status.success_count || 0) + (status.failed_count || 0),
            totalLeads: status.total_leads || 0,
            successCount: status.success_count || 0,
            failedCount: status.failed_count || 0
          };
          
          onProgress(progress);
          onStatusUpdate?.(status);
        },
        () => {
          // Converter para formato de conclusão
          const completion: CampaignCompletion = {
            campaignId,
            status: 'completed', // Assumir sucesso se chegou até aqui
            successCount: 0,
            failedCount: 0,
            totalProcessed: 0,
            completedAt: new Date().toISOString()
          };
          
          onComplete(completion);
        }
      );
    }
  }

  /**
   * Simula a conclusão de uma campanha (para teste)
   */
  static async simulateCampaignCompletion(campaignId: string, totalLeads: number = 5): Promise<boolean> {
    // Simular progresso gradual
    for (let i = 1; i <= totalLeads; i++) {
      // Aguardar 2 segundos entre cada envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular envio bem-sucedido
      await fetch(`${API_BASE_URL}/api/campaign/status/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          leadIndex: i,
          totalLeads,
          success: true,
          leadPhone: `+553199999999${i}`,
          leadName: `Lead ${i}`
        })
      });
    }
    
    // Aguardar mais 1 segundo e marcar como concluída
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Finalizar campanha
    const response = await fetch(`${API_BASE_URL}/api/campaign/status/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        successCount: totalLeads,
        failedCount: 0,
        totalProcessed: totalLeads
      })
    });

    return response.ok;
  }
}

export default CampaignStatusServiceV2;
