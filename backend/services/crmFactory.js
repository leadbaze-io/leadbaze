/**
 * CRM Factory
 * Factory pattern to instantiate the correct CRM service based on provider
 */

const KommoCRMService = require('./crm/KommoCRMService');

/**
 * Get CRM service instance for a given integration
 * @param {Object} integration - Integration object from database
 * @returns {CRMService} Instance of specific CRM service
 */
function getCRMService(integration) {
    if (!integration || !integration.crm_provider) {
        throw new Error('Invalid integration: missing crm_provider');
    }

    switch (integration.crm_provider.toLowerCase()) {
        case 'kommo':
            return new KommoCRMService(integration);

        // Future CRM integrations
        // case 'hubspot':
        //   return new HubSpotCRMService(integration);
        // case 'rdstation':
        //   return new RDStationCRMService(integration);
        // case 'pipedrive':
        //   return new PipedriveCRMService(integration);

        default:
            throw new Error(`CRM provider "${integration.crm_provider}" is not supported`);
    }
}

/**
 * Get list of supported CRM providers
 * @returns {Array} List of provider objects
 */
function getSupportedProviders() {
    return [
        {
            id: 'kommo',
            name: 'Kommo',
            description: 'CRM para vendas e atendimento',
            logo: '/assets/crm/kommo-logo.png',
            status: 'active'
        }
        // Future providers
        // {
        //   id: 'hubspot',
        //   name: 'HubSpot',
        //   description: 'Plataforma completa de CRM',
        //   logo: '/assets/crm/hubspot-logo.png',
        //   status: 'coming-soon'
        // }
    ];
}

module.exports = {
    getCRMService,
    getSupportedProviders
};
