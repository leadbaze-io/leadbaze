import axios from 'axios';
import { getCurrentUser } from './supabaseClient';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://leadbaze.io' 
  : 'http://localhost:3001';

export interface AnalyticsOverview {
  totalLeads: number;
  totalLists: number;
  totalCampaigns: number;
  messagesSent: number;
  conversionRate: number;
  growthRate: number;
  averageRating: number;
  timeRange: string;
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
}

export interface RecentActivity {
  id: string;
  type: 'lead_generated' | 'list_created' | 'campaign_sent' | 'campaign_completed';
  description: string;
  timestamp: string;
  count?: number;
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
      console.error('❌ [AnalyticsService] Erro ao obter overview:', error);
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
      console.error('❌ [AnalyticsService] Erro ao obter leads over time:', error);
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
      console.error('❌ [AnalyticsService] Erro ao obter categorias:', error);
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
      console.error('❌ [AnalyticsService] Erro ao obter campanhas:', error);
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
      console.error('❌ [AnalyticsService] Erro ao obter atividade recente:', error);
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
      console.error('❌ [AnalyticsService] Erro ao obter todos os dados:', error);
      throw error;
    }
  }
}

export default AnalyticsService;