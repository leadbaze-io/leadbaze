/**
 * Abstract CRM Service
 * Base interface that all CRM implementations must extend
 */

class CRMService {
    constructor(integration) {
        if (!integration) {
            throw new Error('Integration configuration is required');
        }
        this.integration = integration;
        this.provider = integration.crm_provider;
    }

    /**
     * Connect to CRM using OAuth authorization code
     * @param {string} authCode - Authorization code from OAuth flow
     * @returns {Promise<{access_token, refresh_token, expires_at}>}
     */
    async connect(authCode) {
        throw new Error('connect() must be implemented by CRM service');
    }

    /**
     * Refresh expired access token
     * @returns {Promise<{access_token, refresh_token, expires_at}>}
     */
    async refreshToken() {
        throw new Error('refreshToken() must be implemented by CRM service');
    }

    /**
     * Test if connection to CRM is working
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        throw new Error('testConnection() must be implemented by CRM service');
    }

    /**
     * Create a contact in the CRM
     * @param {Object} leadData - Lead data to create
     * @returns {Promise<Object>} Created contact
     */
    async createContact(leadData) {
        throw new Error('createContact() must be implemented by CRM service');
    }

    /**
     * Create a deal/lead in the CRM
     * @param {Object} leadData - Lead data to create deal
     * @returns {Promise<Object>} Created deal
     */
    async createDeal(leadData) {
        throw new Error('createDeal() must be implemented by CRM service');
    }

    /**
     * Sync multiple leads to CRM
     * @param {Array} leads - Array of leads to sync
     * @returns {Promise<{success: number, failed: number, errors: Array}>}
     */
    async syncLeads(leads) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const lead of leads) {
            try {
                await this.createContact(lead);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    lead_name: lead.name,
                    lead_phone: lead.phone,
                    error_message: error.message
                });
            }
        }

        return results;
    }

    /**
     * Check if token is expired
     * @returns {boolean}
     */
    isTokenExpired() {
        if (!this.integration.token_expires_at) {
            return false;
        }
        return new Date(this.integration.token_expires_at) <= new Date();
    }

    /**
     * Get valid access token (refresh if needed)
     * @returns {Promise<string>}
     */
    async getValidToken() {
        if (this.isTokenExpired()) {
            const tokens = await this.refreshToken();
            this.integration.access_token = tokens.access_token;
            this.integration.token_expires_at = tokens.expires_at;
            return tokens.access_token;
        }
        return this.integration.access_token;
    }
}

module.exports = CRMService;
