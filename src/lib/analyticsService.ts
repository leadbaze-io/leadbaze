import axios from 'axios';
import { getCurrentUser } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io';

export interface AnalyticsOverview {
  totalLeads: number;
  totalLists: number;
  totalCampaigns: number;
  messagesSent: number;
  conversionRate: number;
  successRate: number;
  failureRate: number;
  growthRate: number;
  averageRating: number;
  timeRange: string;
  // MELHORIA: Dados adicionais
  campaignStats: {
    total: number;
    completed: number;
    sending: number;
    draft: number;
    successCount: number;
    failedCount: number;
  };
  performance: {
    totalMessages: number;
    successMessages: number;
    failedMessages: number;
    successRate: number;
    failureRate: number;
    conversionRate: number;
  };
}

export interface LeadsOverTime {
  date: string;
  count: number;
}

export interface CategoryData {
  name: string;
  count: number;
  percentage: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  color: string;
}

export interface CampaignData {
  date: string;
  count: number;
  success: number;
  failed: number;
  // MELHORIA: Dados adicionais
  totalLeads: number;
  completedCampaigns: number;
  sendingCampaigns: number;
  successRate: number;
  totalMessages: number;
}

export interface RecentActivity {
  id: string;
  type: 'lead_generated' | 'list_created' | 'campaign_sent' | 'campaign_completed' | 'campaign_created';
  description: string;
  timestamp: string;
  count?: number;
  // MELHORIA: Dados adicionais
  successCount?: number;
  failedCount?: number;
  successRate?: number;
  progress?: number;
}

export class AnalyticsService {
  private static async getAuthHeaders() {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

      return {
      'Content-Type': 'application/json',
      'x-user-id': user.id
    };
  }

  static async getOverview(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsOverview> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/analytics/overview`, {
        headers,
        params: { timeRange }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erro ao obter overview');
      }
    } catch (error) {

      throw error;
    }
  }

  static async getLeadsOverTime(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<LeadsOverTime[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/analytics/leads-over-time`, {
        headers,
        params: { timeRange }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erro ao obter leads over time');
      }
    } catch (error) {

      throw error;
    }
  }

  static async getCategories(): Promise<{ topCategories: CategoryData[]; categoryDistribution: CategoryDistribution[] }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/analytics/categories`, {
        headers
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erro ao obter categorias');
      }
  } catch (error) {

      throw error;
    }
  }

  static async getCampaigns(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<CampaignData[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/analytics/campaigns`, {
        headers,
        params: { timeRange }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erro ao obter campanhas');
      }
    } catch (error) {

      throw error;
    }
  }

  static async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/analytics/recent-activity`, {
        headers
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erro ao obter atividade recente');
    }
  } catch (error) {

      throw error;
    }
  }

  static async getAllAnalytics(timeRange: '7d' | '30d' | '90d' = '30d') {
    try {
      const [overview, leadsOverTime, categories, campaigns, recentActivity] = await Promise.all([
        this.getOverview(timeRange),
        this.getLeadsOverTime(timeRange),
        this.getCategories(),
        this.getCampaigns(timeRange),
        this.getRecentActivity()
      ]);

    return {
        overview,
        leadsOverTime,
        categories: categories.topCategories,
        categoryDistribution: categories.categoryDistribution,
        campaigns,
        recentActivity
      };
    } catch (error) {

      throw error;
    }
  }
}

export default AnalyticsService;