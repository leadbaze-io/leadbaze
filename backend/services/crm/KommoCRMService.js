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

        // Cache for custom field IDs
        this.fieldIdsCache = null;
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
     * Get custom field IDs from account
     * Cache the results to avoid repeated API calls
     */
    async getCustomFieldIds() {
        if (this.fieldIdsCache) {
            return this.fieldIdsCache;
        }

        try {
            const token = await this.getValidToken();

            const response = await axios.get(`${this.baseURL}${this.apiVersion}/contacts/custom_fields`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const fields = response.data._embedded.custom_fields || [];

            console.log(`📋 [Kommo] Found ${fields.length} custom fields in account`);

            // Map field types to their IDs
            const fieldIds = {};
            fields.forEach(field => {
                console.log(`   - Field: "${field.name}" | Type: ${field.type} | Code: ${field.code || 'N/A'} | ID: ${field.id}`);

                const name = field.name?.toLowerCase() || '';
                const code = field.code?.toLowerCase() || '';

                // Field type multitext can be phone or email
                if (field.type === 'multitext') {
                    if (code.includes('phone') || name.includes('phone') || name.includes('telefone')) {
                        fieldIds.phone = field.id;
                    } else if (code.includes('email') || name.includes('email')) {
                        fieldIds.email = field.id;
                    }
                }
                // Field type url or text for website/social
                else if (field.type === 'url' || field.type === 'text') {
                    if (name.includes('website') || name.includes('site') || code.includes('web')) {
                        fieldIds.website = field.id;
                    } else if (name.includes('instagram') || code.includes('insta')) {
                        fieldIds.instagram = field.id;
                    } else if (name.includes('google maps') || name.includes('maps') || code.includes('maps')) {
                        fieldIds.google_maps = field.id;
                    } else if (name.includes('endereço') || name.includes('address') || code.includes('addr')) {
                        fieldIds.address = field.id;
                    } else if (name.includes('nota') || name.includes('rating') || code.includes('rating')) {
                        fieldIds.rating = field.id;
                    }
                }
                // Numeric fields
                else if (field.type === 'numeric') {
                    if (name.includes('nota') || name.includes('rating') || code.includes('rating')) {
                        fieldIds.rating = field.id;
                    } else if (name.includes('avaliações') || name.includes('reviews') || code.includes('reviews')) {
                        fieldIds.reviews = field.id;
                    }
                }
            });

            console.log('📋 [Kommo] Custom field IDs found:', fieldIds);

            // Cache the results
            this.fieldIdsCache = fieldIds;

            return fieldIds;
        } catch (error) {
            console.error('❌ [Kommo] Failed to fetch custom fields:', error.message);
            return {};
        }
    }

    /**
     * Create a custom field in Kommo
     */
    async createCustomField(name, type, code) {
        try {
            const token = await this.getValidToken();

            console.log(`🔨 [Kommo] Creating custom field: ${name} (${type})...`);

            const payload = {
                name: name,
                type: type,
                code: code,
                is_api_only: false
            };

            const response = await axios.post(
                `${this.baseURL}${this.apiVersion}/contacts/custom_fields`,
                [payload], // API expects an array
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data && response.data._embedded && response.data._embedded.custom_fields) {
                const newField = response.data._embedded.custom_fields[0];
                console.log(`✅ [Kommo] Custom field created: ${newField.name} (ID: ${newField.id})`);
                return newField.id;
            }

            return null;
        } catch (error) {
            console.error(`❌ [Kommo] Failed to create custom field ${name}:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Update a custom field in Kommo (e.g. to change sorting)
     */
    async updateCustomField(id, data) {
        try {
            const token = await this.getValidToken();

            console.log(`🔄 [Kommo] Updating custom field ${id}...`);

            // Use PATCH for updating
            const response = await axios.patch(
                `${this.baseURL}${this.apiVersion}/contacts/custom_fields/${id}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log(`✅ [Kommo] Custom field updated: ${response.data.name} (Sort: ${response.data.sort || 'N/A'})`);
            return response.data;
        } catch (error) {
            console.error(`❌ [Kommo] Failed to update custom field ${id}:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Setup all required custom fields
     * Checks if fields exist, if not creates them
     */
    async setupRequiredFields() {
        console.log('🚀 [Kommo] Starting setup of required custom fields...');
        const token = await this.getValidToken();

        // Force refresh cache
        this.fieldIdsCache = null;
        const currentFields = await this.getCustomFieldIds();

        const fieldsToEnsure = [
            { key: 'reviews', name: 'Total de Avaliações', type: 'numeric', code: 'TOTAL_REVIEWS' },
            { key: 'rating', name: 'Nota Google', type: 'text', code: 'GOOGLE_RATING' },
            { key: 'website', name: 'Website', type: 'url', code: 'WEBSITE' },
            { key: 'instagram', name: 'Instagram', type: 'url', code: 'INSTAGRAM' },
            { key: 'address', name: 'Endereço Completo', type: 'text', code: 'FULL_ADDRESS' },
            { key: 'google_maps', name: 'Google Maps Link', type: 'url', code: 'GOOGLE_MAPS' }
        ];

        const results = {
            existing: [],
            created: [],
            failed: []
        };

        for (const field of fieldsToEnsure) {
            if (currentFields[field.key]) {
                console.log(`✅ [Kommo] Field "${field.name}" already exists (ID: ${currentFields[field.key]})`);
                results.existing.push({ name: field.name, id: currentFields[field.key] });
            } else {
                console.log(`⚠️ [Kommo] Field "${field.name}" missing. Creating...`);
                // Short wait to avoid rate limits
                await new Promise(r => setTimeout(r, 500));

                const newId = await this.createCustomField(field.name, field.type, field.code);
                if (newId) {
                    currentFields[field.key] = newId;
                    results.created.push({ name: field.name, id: newId });
                } else {
                    results.failed.push({ name: field.name });
                }
            }
        }

        // Update cache
        this.fieldIdsCache = currentFields;

        console.log('🏁 [Kommo] Field setup complete:', results);
        return results;
    }

    /**
   * Create contact in Kommo
   */
    async createContact(leadData) {
        try {
            const token = await this.getValidToken();

            console.log(`👤 [Kommo] Creating contact for: ${leadData.name}`);
            console.log(`📞 [Kommo] Phone: ${leadData.phone || 'N/A'}`);
            console.log(`📧 [Kommo] Email: ${leadData.email || 'N/A'}`);
            console.log(`🌐 [Kommo] Website: ${leadData.website || 'N/A'}`);

            // Get custom field IDs from account
            const fieldIds = await this.getCustomFieldIds();

            // Ensure website field exists if we have website data
            if (leadData.website && !fieldIds.website) {
                console.log('⚠️ [Kommo] Website field not found, creating it...');
                const newFieldId = await this.createCustomField('Website', 'url', 'WEB');
                if (newFieldId) {
                    fieldIds.website = newFieldId;
                    // Update cache
                    if (this.fieldIdsCache) {
                        this.fieldIdsCache.website = newFieldId;
                    }
                }
            }

            // Kommo standard contact structure with custom fields
            const contactData = [{
                name: leadData.name || 'Lead sem nome',
                custom_fields_values: []
            }];

            // Add phone if available and field ID exists
            if (leadData.phone && fieldIds.phone) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.phone,
                    values: [{
                        value: leadData.phone,
                        enum_code: 'WORK'
                    }]
                });
            }

            // Add email if available and field ID exists
            if (leadData.email && fieldIds.email) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.email,
                    values: [{
                        value: leadData.email,
                        enum_code: 'WORK'
                    }]
                });
            }

            // Add website if available and field ID exists
            if (leadData.website && fieldIds.website) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.website,
                    values: [{ value: leadData.website }]
                });
            }

            // Add Instagram if available
            const instagram = leadData.instagram || (leadData.website && leadData.website.includes('instagram.com') ? leadData.website : null);
            if (instagram && fieldIds.instagram) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.instagram,
                    values: [{ value: instagram }]
                });
            }

            // Add Google Maps Link
            if (leadData.google_maps_url && fieldIds.google_maps) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.google_maps,
                    values: [{ value: leadData.google_maps_url }]
                });
            }

            // Add Address
            if (leadData.address && fieldIds.address) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.address,
                    values: [{ value: leadData.address }]
                });
            }

            // Add Rating
            const rating = leadData.rating || leadData.totalScore;
            if (rating && fieldIds.rating) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.rating,
                    values: [{ value: String(rating) }]
                });
            }

            // Add Reviews Count
            if (leadData.reviews_count && fieldIds.reviews) {
                contactData[0].custom_fields_values.push({
                    field_id: fieldIds.reviews,
                    values: [{ value: leadData.reviews_count }] // Numeric field expects number
                });
            }

            console.log(`📤 [Kommo] Contact payload:`, JSON.stringify(contactData, null, 2));

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

            return createdContact;
        } catch (error) {
            console.error('❌ [Kommo] Failed to create contact:', error.response?.data || error.message);
            if (error.response?.data) {
                console.error('❌ [Kommo] Error details:', JSON.stringify(error.response.data, null, 2));
            }
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
