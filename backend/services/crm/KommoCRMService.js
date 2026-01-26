/**
 * Kommo CRM Service
 * Implementation of CRM service for Kommo (formerly amoCRM)
 * API Documentation: https://www.kommo.com/developers/
 */

const CRMService = require('./CRMService');
const axios = require('axios');

class KommoCRMService extends CRMService {
    constructor(integration) {
        super(integration);

        // Kommo base URL (uses subdomain from config)
        const subdomain = integration.crm_config?.subdomain || 'api';
        this.baseURL = `https://${subdomain}.kommo.com`;
        this.apiVersion = '/api/v4';

        // OAuth credentials from environment
        this.clientId = process.env.KOMMO_CLIENT_ID;
        this.clientSecret = process.env.KOMMO_CLIENT_SECRET;
        this.redirectUri = process.env.KOMMO_REDIRECT_URI || 'https://leadbaze.io/api/crm/callback';
    }

    /**
     * Connect to Kommo using OAuth authorization code
     */
    async connect(authCode) {
        try {
            console.log('🔗 [Kommo] Connecting with auth code...');

            const response = await axios.post(`${this.baseURL}/oauth2/access_token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: this.redirectUri
            });

            console.log('✅ [Kommo] Successfully obtained tokens');

            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_at: new Date(Date.now() + response.data.expires_in * 1000)
            };
        } catch (error) {
            console.error('❌ [Kommo] Failed to connect:', error.response?.data || error.message);
            throw new Error(`Kommo connection failed: ${error.response?.data?.hint || error.message}`);
        }
    }

    /**
     * Refresh expired access token
     */
    async refreshToken() {
        try {
            console.log('🔄 [Kommo] Refreshing access token...');

            const response = await axios.post(`${this.baseURL}/oauth2/access_token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: this.integration.refresh_token,
                redirect_uri: this.redirectUri
            });

            console.log('✅ [Kommo] Token refreshed successfully');

            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_at: new Date(Date.now() + response.data.expires_in * 1000)
            };
        } catch (error) {
            console.error('❌ [Kommo] Failed to refresh token:', error.response?.data || error.message);
            throw new Error(`Kommo token refresh failed: ${error.response?.data?.hint || error.message}`);
        }
    }

    /**
     * Test connection to Kommo API
     */
    async testConnection() {
        try {
            const token = await this.getValidToken();

            const response = await axios.get(`${this.baseURL}${this.apiVersion}/account`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ [Kommo] Connection test successful:', response.data.name);
            return true;
        } catch (error) {
            console.error('❌ [Kommo] Connection test failed:', error.response?.data || error.message);
            return false;
        }
    }

    /**
   * Create contact in Kommo
   */
    async createContact(leadData) {
        try {
            const token = await this.getValidToken();

            // Kommo standard contact structure
            // Phone and email are standard fields, not custom fields
            const contactData = [{
                name: leadData.name || 'Lead sem nome',
                // Note: phone and email are not added here by default
                // They require custom field configuration in Kommo
                // For now, we'll just create the contact with name
            }];

            const response = await axios.post(
                `${this.baseURL}${this.apiVersion}/contacts`,
                contactData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const createdContact = response.data._embedded.contacts[0];
            console.log(`✅ [Kommo] Contact created: ${createdContact.name} (ID: ${createdContact.id})`);

            // After creating, update with phone if provided
            if (leadData.phone) {
                await this.updateContactPhone(createdContact.id, leadData.phone, token);
            }

            return createdContact;
        } catch (error) {
            console.error('❌ [Kommo] Failed to create contact:', error.response?.data || error.message);
            throw new Error(`Failed to create contact in Kommo: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Update contact phone number
     */
    async updateContactPhone(contactId, phone, token) {
        try {
            // Get account custom fields to find phone field ID
            const accountResponse = await axios.get(`${this.baseURL}${this.apiVersion}/account`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Find phone field (type 9 = phone)
            const phoneField = accountResponse.data._embedded?.custom_fields?.contacts?.find(f => f.field_type === 9);

            if (phoneField) {
                await axios.patch(
                    `${this.baseURL}${this.apiVersion}/contacts/${contactId}`,
                    {
                        custom_fields_values: [{
                            field_id: phoneField.id,
                            values: [{ value: phone, enum_code: 'WORK' }]
                        }]
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`✅ [Kommo] Phone number added to contact ${contactId}`);
            } else {
                console.log('⚠️  [Kommo] Phone field not found in account, skipping phone update');
            }
        } catch (error) {
            console.error('⚠️ [Kommo] Failed to update phone:', error.message);
            // Don't throw - contact was created successfully
        }
    }

    /**
     * Get available pipelines and their statuses
     */
    async getPipelines() {
        try {
            const token = await this.getValidToken();

            const response = await axios.get(`${this.baseURL}${this.apiVersion}/leads/pipelines`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const pipelines = response.data._embedded.pipelines;
            console.log(`📋 [Kommo] Found ${pipelines.length} pipeline(s):`);

            pipelines.forEach(pipeline => {
                console.log(`  - ${pipeline.name} (ID: ${pipeline.id})`);
                if (pipeline._embedded?.statuses) {
                    pipeline._embedded.statuses.forEach(status => {
                        console.log(`    └─ ${status.name} (ID: ${status.id})`);
                    });
                }
            });

            return pipelines;
        } catch (error) {
            console.error('❌ [Kommo] Failed to fetch pipelines:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create lead/deal in Kommo
     */
    async createDeal(leadData) {
        try {
            console.log(`🔨 [Kommo] Creating deal for: ${leadData.name}`);
            const token = await this.getValidToken();

            // First create contact
            const contact = await this.createContact(leadData);
            console.log(`👤 [Kommo] Contact created: ID ${contact.id}`);

            // Get configured pipeline/status or use defaults
            const pipelineId = this.integration.crm_config?.pipeline_id;
            const statusId = this.integration.crm_config?.status_id;

            // Build lead payload
            const leadPayload = [{
                name: `Lead - ${leadData.name || 'Sem nome'}`,
                price: leadData.budget || 0,
                _embedded: {
                    contacts: [{ id: contact.id }]
                }
            }];

            // Add pipeline/status if configured
            if (pipelineId) {
                leadPayload[0].pipeline_id = parseInt(pipelineId);
                console.log(`🎯 [Kommo] Using configured pipeline ID: ${pipelineId}`);
            }
            if (statusId) {
                leadPayload[0].status_id = parseInt(statusId);
                console.log(`📍 [Kommo] Using configured status ID: ${statusId}`);
            }

            console.log(`📤 [Kommo] Sending lead payload:`, JSON.stringify(leadPayload, null, 2));

            const response = await axios.post(
                `${this.baseURL}${this.apiVersion}/leads`,
                leadPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const createdLead = response.data._embedded.leads[0];
            console.log(`✅ [Kommo] Lead created successfully!`);
            console.log(`   - Name: ${createdLead.name}`);
            console.log(`   - ID: ${createdLead.id}`);
            console.log(`   - Pipeline ID: ${createdLead.pipeline_id}`);
            console.log(`   - Status ID: ${createdLead.status_id}`);

            return createdLead;
        } catch (error) {
            console.error('❌ [Kommo] Failed to create lead:');
            console.error('   Error:', error.response?.data || error.message);
            if (error.response?.data) {
                console.error('   Response:', JSON.stringify(error.response.data, null, 2));
            }
            throw new Error(`Failed to create lead in Kommo: ${error.response?.data?.detail || error.message}`);
        }
    }
}

module.exports = KommoCRMService;
