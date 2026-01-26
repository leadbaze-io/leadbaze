/**
 * CRM API Service
 * Frontend service for CRM integration endpoints
 */

import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://leadbaze.io';

export interface CRMProvider {
    id: string;
    name: string;
    description: string;
    logo: string;
    status: 'active' | 'coming-soon';
}

export interface CRMIntegration {
    id: string;
    crm_provider: string;
    is_active: boolean;
    last_sync_at: string | null;
    created_at: string;
}

export interface SyncResult {
    total: number;
    success_count: number;
    failed_count: number;
    errors: Array<{ lead_name: string; error_message: string }>;
}

class CRMService {
    /**
     * Get authentication headers with Supabase token
     */
    private async getAuthHeaders(): Promise<HeadersInit> {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('User not authenticated');
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        };
    }

    /**
     * Get list of supported CRM providers
     */
    async getProviders(): Promise<CRMProvider[]> {
        const response = await fetch(`${API_BASE_URL}/api/crm/providers`);
        const data = await response.json();
        return data.providers;
    }

    /**
   * Get user's CRM integrations
   */
    async getIntegrations(): Promise<CRMIntegration[]> {
        try {
            const headers = await this.getAuthHeaders();

            const response = await fetch(`${API_BASE_URL}/api/crm/integrations`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.integrations || [];
        } catch (error) {
            console.error('Failed to fetch CRM integrations:', error);
            throw error;
        }
    }

    /**
   * Handle OAuth callback
   */
    async callback(provider: string, code: string, subdomain?: string): Promise<any> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/crm/callback`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ provider, code, subdomain })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to process callback');
        }

        return response.json();
    }

    /**
     * Connect CRM using auth code (Legacy/Manual)
     */
    async connect(provider: string, authCode: string, config: any): Promise<any> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/crm/connect`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ provider, authCode, config })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to connect CRM');
        }

        return response.json();
    }

    /**
     * Test CRM connection
     */
    async testConnection(provider: string): Promise<boolean> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/crm/test`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ provider })
        });

        const data = await response.json();
        return data.connected;
    }

    /**
     * Sync leads to CRM
     */
    async syncLeads(leadListId: string, provider: string = 'kommo'): Promise<SyncResult> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/crm/sync-leads`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ leadListId, provider })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to sync leads');
        }

        const data = await response.json();
        return data.results;
    }

    /**
     * Disconnect CRM
     */
    async disconnect(provider: string): Promise<void> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/crm/disconnect`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
            body: JSON.stringify({ provider })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to disconnect CRM');
        }
    }

    /**
     * Get sync history
     */
    async getSyncHistory(limit: number = 20): Promise<any[]> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(
            `${API_BASE_URL}/api/crm/sync-history?limit=${limit}`,
            {
                headers,
                credentials: 'include'
            }
        );
        const data = await response.json();
        return data.history;
    }
}

export const crmService = new CRMService();
