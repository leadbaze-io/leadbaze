/**
 * Serviço V2 para gerenciamento de status de campanhas
 * Usa webhooks em vez de polling para atualizações em tempo real
 */

const API_BASE_URL = process.env.NODE_ENV === 'production'

  ? 'https://leadbaze.io'

  : ''; // Em desenvolvimento, usar URLs relativas (proxy do Vite)

export interface CampaignStatus {
  id: string;
  campaignId?: string;
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

        return null;
      }
    } catch (error) {

      return null;
    }
  }

  /**
   * Inicia Server-Sent Events para receber atualizações em tempo real
   */
  static startRealTimeUpdates(campaignId: string, onProgress: (progress: CampaignProgress) => void, onComplete: (completion: CampaignCompletion) => void): () => void {
    // Parar conexão anterior se existir
    this.stopRealTimeUpdates();

    // Criar nova conexão SSE
    const sseUrl = `${API_BASE_URL}/api/campaign/status/stream/${campaignId}`;

    const eventSource = new EventSource(sseUrl);
    this.eventSource = eventSource;
    // Listener para progresso
    eventSource.addEventListener('progress', (event) => {

      try {
        const progressData: CampaignProgress = JSON.parse(event.data);

        onProgress(progressData);
      } catch (error) {

      }
    });

    // Listener para conexão estabelecida
    eventSource.addEventListener('open', (_event) => {

    });

    // Listener para erros
    eventSource.addEventListener('error', (_event) => {

      eventSource.close();
    });

    // Listener para mensagens genéricas (fallback)
    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          // Verificar se os dados estão no formato correto
          const progressData = data.data;
          if (progressData && typeof progressData === 'object') {

          }

          try {
            console.log('🔄 [CampaignStatusServiceV2] EXECUTANDO onProgress(data.data)...');
            onProgress(data.data);
          } catch (error) {
          }
        } else if (data.type === 'complete') {
          try {
            console.log('🔄 [CampaignStatusServiceV2] EXECUTANDO onComplete(data.data)...');
            onComplete(data.data);
          } catch (error) {
          }
        } else if (data.type === 'connected') {
        } else if (data.type === 'heartbeat') {
        } else {
          console.log('❓ [CampaignStatusServiceV2] Timestamp do evento desconhecido:', new Date().toISOString());
        }
      } catch (error) {

      }
    });

    // Listener para conclusão
    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data);

        // Se os dados estão aninhados em 'data', extrair
        const completionData = data.data || data;

        onComplete(completionData);

      } catch (error) {
      }
    });

    // Listener para erros
    eventSource.addEventListener('error', (_event) => {
      console.error('❌ [CampaignStatusServiceV2] Timestamp do erro:', new Date().toISOString());
    });

    // Listener para abertura da conexão
    eventSource.addEventListener('open', () => {

      console.log('✅ [CampaignStatusServiceV2] Timestamp da abertura:', new Date().toISOString());
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

      this.eventSource.close();
      this.eventSource = null;

    } else {

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

          clearInterval(intervalId);
          onComplete();
        }
      } catch (error) {

        // Se excedeu o número máximo de tentativas, parar o polling
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          onComplete();
        }
      }
    };

    // Iniciar o polling
    const intervalId: NodeJS.Timeout = setInterval(checkStatus, intervalMs);

    // Verificar imediatamente
    checkStatus();

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
    // Tentar SSE primeiro
    try {

      const stopSSE = this.startRealTimeUpdates(campaignId, onProgress, onComplete);
      // Se SSE funcionou, retornar função de parada
      return stopSSE;
    } catch (error) {

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
