/**
 * Serviço para verificar e atualizar o status das campanhas
 */

const API_BASE_URL = process.env.NODE_ENV === 'production'

  ? 'https://leadbaze.io'

  : ''; // Em desenvolvimento, usar URLs relativas (proxy do Vite)

export interface CampaignStatus {
  id: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  success_count?: number;
  failed_count?: number;
  sent_at?: string;
  completed_at?: string;
  updated_at: string;
}

export class CampaignStatusService {
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
   * Atualiza o status de uma campanha
   */
  static async updateCampaignStatus(
    campaignId: string,

    status: 'draft' | 'sending' | 'completed' | 'failed',
    successCount?: number,
    failedCount?: number
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campaign/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          status,
          successCount,
          failedCount
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
   * Inicia o polling para verificar o status de uma campanha
   */
  static startStatusPolling(
    campaignId: string,
    onStatusUpdate: (status: CampaignStatus) => void,
    onComplete: () => void,
    intervalMs: number = 10000, // 10 segundos
    maxAttempts: number = 60 // 10 minutos máximo
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
   * Simula a conclusão de uma campanha (para teste)
   */
  static async simulateCampaignCompletion(campaignId: string): Promise<boolean> {
    // Simular progresso gradual: versão acelerada para teste (1 mensagem por 10 segundos)
    const totalMessages = 2; // Assumindo 2 mensagens para teste
    const intervalMs = 10000; // 10 segundos por mensagem (para teste)

    for (let i = 1; i <= totalMessages; i++) {
      // Aguardar 10 segundos
      await new Promise(resolve => setTimeout(resolve, intervalMs));

      // Atualizar progresso parcial
      await this.updateCampaignStatus(campaignId, 'sending', i, 0);
    }

    // Aguardar mais 5 segundos e marcar como concluída
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Atualizar status para completed
    return await this.updateCampaignStatus(campaignId, 'completed', totalMessages, 0);
  }
}
