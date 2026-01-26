import { useState, useEffect } from 'react';
import { crmService, type CRMIntegration } from '../services/crmService';

/**
 * Hook to manage CRM integration state
 */
export function useCRMIntegration(provider: string = 'kommo') {
    const [integration, setIntegration] = useState<CRMIntegration | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load integration status
    useEffect(() => {
        loadIntegration();
    }, [provider]);

    const loadIntegration = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const integrations = await crmService.getIntegrations();

            // Handle undefined or null response
            if (!integrations || !Array.isArray(integrations)) {
                console.warn('CRM integrations response is invalid:', integrations);
                setIntegration(null);
                setIsConnected(false);
                return;
            }

            const currentIntegration = integrations.find(i => i.crm_provider === provider);

            if (currentIntegration) {
                setIntegration(currentIntegration);
                setIsConnected(currentIntegration.is_active);

                // Test connection to verify it's still working
                try {
                    const connected = await crmService.testConnection(provider);
                    setIsConnected(connected);
                } catch (testError) {
                    console.warn('Failed to test connection, assuming disconnected:', testError);
                    setIsConnected(false);
                }
            } else {
                setIntegration(null);
                setIsConnected(false);
            }
        } catch (err) {
            console.error('Error loading CRM integration:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load integration';

            // Check if it's a network error (backend not running)
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                setError('Backend não está rodando. Inicie o servidor backend primeiro.');
            } else {
                setError(errorMessage);
            }

            setIsConnected(false);
            setIntegration(null);
        } finally {
            setIsLoading(false);
        }
    };

    const connect = async (authCode: string, config?: any) => {
        try {
            setIsLoading(true);
            setError(null);

            // Use callback endpoint instead of legacy connect
            await crmService.callback(provider, authCode, config?.subdomain);

            await loadIntegration(); // Reload integration status

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const disconnect = async () => {
        try {
            setIsLoading(true);
            setError(null);

            await crmService.disconnect(provider);
            setIntegration(null);
            setIsConnected(false);

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to disconnect');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const syncLeads = async (leadListId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await crmService.syncLeads(leadListId, provider);
            await loadIntegration(); // Update last_sync_at

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync leads');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        integration,
        isConnected,
        isLoading,
        error,
        connect,
        disconnect,
        syncLeads,
        reload: loadIntegration
    };
}
