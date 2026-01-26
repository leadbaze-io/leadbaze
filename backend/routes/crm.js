/**
 * CRM Integration Routes
 * API endpoints for managing CRM connections and syncing leads
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { getCRMService, getSupportedProviders } = require('../services/crmFactory');
const { authenticateToken } = require('../middleware/auth');

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/crm/providers
 * Get list of supported CRM providers (public - no auth required)
 */
router.get('/providers', (req, res) => {
    const providers = getSupportedProviders();
    res.json({ success: true, providers });
});

/**
 * GET /api/crm/integrations
 * Get user's CRM integrations (protected)
 */
router.get('/integrations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('crm_integrations')
            .select('id, crm_provider, is_active, last_sync_at, created_at, crm_config')
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true, integrations: data });
    } catch (error) {
        console.error('Error fetching integrations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/crm/auth-url
 * Get OAuth authorization URL for provider
 * Query: { provider }
 */
router.get('/auth-url', authenticateToken, (req, res) => {
    try {
        const { provider } = req.query;

        if (provider !== 'kommo') {
            return res.status(400).json({ success: false, error: 'Provider not supported' });
        }

        const clientId = process.env.KOMMO_CLIENT_ID;
        const redirectUri = process.env.KOMMO_REDIRECT_URI;
        const subdomain = process.env.KOMMO_SUBDOMAIN || 'www'; // Fallback to www if specific subdomain not needed for initial auth

        if (!clientId || !redirectUri) {
            return res.status(500).json({ success: false, error: 'Kommo credentials not configured' });
        }

        // Kommo 
        const authUrl = `https://www.kommo.com/oauth?client_id=${clientId}&mode=popup`;

        // Note: For Kommo, the user might need to input their subdomain manually in the popup
        // or we can redirect to a specific subdomain if known: https://{subdomain}.kommo.com/oauth...

        res.json({ success: true, url: authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/crm/callback
 * Handle OAuth redirect from Kommo validation
 * This page is loaded in the popup after user authorizes
 */
router.get('/callback', (req, res) => {
    const { code, referer } = req.query;

    if (code) {
        // Return HTML that posts the code back to the opener
        res.send(`
            <html>
                <body>
                    <script>
                        // Send code to parent window
                        // Tenta comunicação via postMessage (padrão)
                        if (window.opener) {
                            try {
                                window.opener.postMessage({ 
                                    code: "${code}", 
                                    referer: "${referer || ''}",
                                    source: 'kommo-oauth' 
                                }, "*");
                            } catch (e) {
                                console.log('PostMessage falhou:', e);
                            }
                        }

                        // Fallback robusto via LocalStorage (funciona mesmo se o opener for perdido)
                        try {
                            localStorage.setItem('kommo_oauth_result', JSON.stringify({
                                code: "${code}",
                                referer: "${referer || ''}",
                                timestamp: Date.now()
                            }));
                        } catch (e) {
                            console.log('LocalStorage falhou:', e);
                        }

                        // Tenta fechar a janela
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    </script>
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2>Conectando ao LeadBaze...</h2>
                        <p>Por favor, aguarde...</p>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.status(400).send('Código de autorização não encontrado.');
    }
});

/**
 * POST /api/crm/callback
 * Handle OAuth callback and exchange code for tokens
 * Body: { provider, code, subdomain }
 */
router.post('/callback', authenticateToken, async (req, res) => {
    try {
        const { provider, code, subdomain } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
        if (!code) return res.status(400).json({ success: false, error: 'Authorization code is required' });

        console.log(`🔗 [CRM] User ${userId} connecting to ${provider} via OAuth callback...`);

        // Create temporary integration context
        const tempIntegration = {
            crm_provider: provider,
            crm_config: { subdomain: subdomain } // Pass subdomain if available
        };

        // Get CRM service and exchange code
        const crmService = getCRMService(tempIntegration);
        const tokens = await crmService.connect(code);

        // Save integration to database
        const { data, error } = await supabase
            .from('crm_integrations')
            .upsert({
                user_id: userId,
                crm_provider: provider,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: tokens.expires_at,
                crm_config: {
                    subdomain: subdomain || process.env.KOMMO_SUBDOMAIN, // Save subdomain
                    account_id: tokens.account_id
                },
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,crm_provider'
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ [CRM] Successfully connected ${provider} for user ${userId}`);

        res.json({
            success: true,
            message: `${provider} connected successfully`,
            integration: {
                id: data.id,
                provider: data.crm_provider,
                is_active: data.is_active
            }
        });
    } catch (error) {
        console.error('❌ [CRM] OAuth callback error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/crm/connect
 * Manual connection endpoint (deprecated for OAuth flow but kept for direct token usage)
 * Body: { provider, authCode, config }
 */
router.post('/connect', authenticateToken, async (req, res) => {
    try {
        const { provider, authCode, config } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!provider || !authCode) {
            return res.status(400).json({
                success: false,
                error: 'Provider and authCode are required'
            });
        }

        console.log(`🔗 [CRM] User ${userId} connecting to ${provider}...`);

        // Create temporary integration to get tokens
        const tempIntegration = {
            crm_provider: provider,
            crm_config: config || {}
        };

        // Get CRM service and connect
        const crmService = getCRMService(tempIntegration);
        const tokens = await crmService.connect(authCode);

        // Save integration to database
        const { data, error } = await supabase
            .from('crm_integrations')
            .upsert({
                user_id: userId,
                crm_provider: provider,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: tokens.expires_at,
                crm_config: config || {},
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,crm_provider'
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ [CRM] Successfully connected ${provider} for user ${userId}`);

        res.json({
            success: true,
            message: `${provider} connected successfully`,
            integration: {
                id: data.id,
                provider: data.crm_provider,
                is_active: data.is_active
            }
        });
    } catch (error) {
        console.error('❌ [CRM] Error connecting:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/crm/test
 * Test CRM connection (protected)
 * Body: { provider }
 */
router.post('/test', authenticateToken, async (req, res) => {
    try {
        const { provider } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Get integration from database
        const { data: integration, error } = await supabase
            .from('crm_integrations')
            .select('*')
            .eq('user_id', userId)
            .eq('crm_provider', provider)
            .single();

        if (error || !integration) {
            return res.status(404).json({
                success: false,
                error: 'CRM integration not found'
            });
        }

        // Test connection
        const crmService = getCRMService(integration);
        const isConnected = await crmService.testConnection();

        res.json({
            success: true,
            connected: isConnected
        });
    } catch (error) {
        console.error('❌ [CRM] Test connection failed:', error);
        res.json({
            success: false,
            connected: false,
            error: error.message
        });
    }
});

/**
 * POST /api/crm/sync-leads
 * Sync leads from a list to CRM (protected)
 * Body: { leadListId, provider }
 */
router.post('/sync-leads', authenticateToken, async (req, res) => {
    try {
        const { leadListId, provider } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!leadListId) {
            return res.status(400).json({
                success: false,
                error: 'leadListId is required'
            });
        }

        console.log(`📤 [CRM] Syncing leads from list ${leadListId} for user ${userId}...`);

        // Get integration
        const { data: integration, error: intError } = await supabase
            .from('crm_integrations')
            .select('*')
            .eq('user_id', userId)
            .eq('crm_provider', provider || 'kommo')
            .eq('is_active', true)
            .single();

        if (intError || !integration) {
            return res.status(404).json({
                success: false,
                error: 'No active CRM integration found. Please connect your CRM first.'
            });
        }

        // Get lead list
        const { data: leadList, error: listError } = await supabase
            .from('lead_lists')
            .select('leads')
            .eq('id', leadListId)
            .eq('user_id', userId)
            .single();

        if (listError || !leadList) {
            return res.status(404).json({
                success: false,
                error: 'Lead list not found'
            });
        }

        const leads = leadList.leads || [];

        if (leads.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Lead list is empty'
            });
        }

        // Sync leads to CRM
        const crmService = getCRMService(integration);
        const results = await crmService.syncLeads(leads);

        // Log sync results
        await supabase.from('crm_sync_logs').insert({
            integration_id: integration.id,
            user_id: userId,
            lead_list_id: leadListId,
            total_leads: leads.length,
            success_count: results.success,
            failed_count: results.failed,
            status: results.failed === 0 ? 'success' : (results.success > 0 ? 'partial' : 'failed'),
            error_details: results.errors
        });

        // Update last_sync_at
        await supabase
            .from('crm_integrations')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', integration.id);

        console.log(`✅ [CRM] Sync completed: ${results.success} success, ${results.failed} failed`);

        res.json({
            success: true,
            results: {
                total: leads.length,
                success_count: results.success,
                failed_count: results.failed,
                errors: results.errors
            }
        });
    } catch (error) {
        console.error('❌ [CRM] Sync failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/crm/disconnect
 * Disconnect CRM integration (protected)
 * Body: { provider }
 */
router.delete('/disconnect', authenticateToken, async (req, res) => {
    try {
        const { provider } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { error } = await supabase
            .from('crm_integrations')
            .delete()
            .eq('user_id', userId)
            .eq('crm_provider', provider);

        if (error) throw error;

        console.log(`🔌 [CRM] Disconnected ${provider} for user ${userId}`);

        res.json({
            success: true,
            message: `${provider} disconnected successfully`
        });
    } catch (error) {
        console.error('❌ [CRM] Disconnect failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crm/sync-history
 * Get sync history for user (protected)
 */
router.get('/sync-history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const limit = parseInt(req.query.limit) || 20;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('crm_sync_logs')
            .select(`
        *,
        crm_integrations (crm_provider),
        lead_lists (name)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({ success: true, history: data });
    } catch (error) {
        console.error('❌ [CRM] Error fetching sync history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
