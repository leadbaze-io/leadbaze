/**
 * Configuração de Analytics para Produção
 * 
 * Este arquivo contém configurações específicas para diferentes ambientes
 * e otimizações para produção.
 */

export const ANALYTICS_CONFIG = {
  // IDs dos serviços de analytics
  GOOGLE_ANALYTICS_ID: 'G-9CN9TF7GHG',
  GOOGLE_ADS_ID: 'AW-17598053351',
  GOOGLE_TAG_MANAGER_ID: 'GTM-PRP8DKW9',
  META_PIXEL_ID: '1494096711901020',
  MICROSOFT_CLARITY_ID: 'thhq3efjo4',
  
  // Configurações de ambiente
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Configurações de debug
  DEBUG_ANALYTICS: process.env.NODE_ENV === 'development',
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Configurações de performance
  SAMPLE_RATE: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% em produção
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  
  // Configurações de privacidade
  RESPECT_DNT: true, // Respeitar Do Not Track
  ANONYMIZE_IP: true, // Anonimizar IPs
  
  // Configurações de bloqueadores
  DETECT_AD_BLOCKER: true,
  GRACEFUL_DEGRADATION: true, // Falhar silenciosamente se bloqueado
};

/**
 * Verificar se analytics deve ser executado
 */
export const shouldRunAnalytics = (): boolean => {
  // Não executar em desenvolvimento a menos que explicitamente habilitado
  if (ANALYTICS_CONFIG.IS_DEVELOPMENT && !ANALYTICS_CONFIG.DEBUG_ANALYTICS) {
    return false;
  }
  
  // Verificar Do Not Track
  if (ANALYTICS_CONFIG.RESPECT_DNT && navigator.doNotTrack === '1') {
    return false;
  }
  
  // Verificar se está em modo privado/incógnito
  if (typeof window !== 'undefined') {
    try {
      // Teste simples para detectar modo privado
      const testKey = 'analytics_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      // Modo privado detectado
      return false;
    }
  }
  
  return true;
};

/**
 * Configurações específicas do Google Analytics
 */
export const getGoogleAnalyticsConfig = () => ({
  measurement_id: ANALYTICS_CONFIG.GOOGLE_ANALYTICS_ID,
  config: {
    // Configurações de privacidade
    anonymize_ip: ANALYTICS_CONFIG.ANONYMIZE_IP,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    
    // Configurações de performance
    sample_rate: ANALYTICS_CONFIG.SAMPLE_RATE,
    session_timeout: ANALYTICS_CONFIG.SESSION_TIMEOUT,
    
    // Configurações de debug
    debug_mode: ANALYTICS_CONFIG.DEBUG_ANALYTICS,
    
    // Configurações específicas do LeadBaze
    custom_map: {
      'custom_parameter_1': 'user_plan',
      'custom_parameter_2': 'campaign_count',
      'custom_parameter_3': 'lead_count',
    },
  },
});

/**
 * Configurações específicas do Meta Pixel
 */
export const getMetaPixelConfig = () => ({
  pixel_id: ANALYTICS_CONFIG.META_PIXEL_ID,
  config: {
    // Configurações de privacidade
    auto_config: true,
    debug: ANALYTICS_CONFIG.DEBUG_ANALYTICS,
    
    // Configurações específicas do LeadBaze
    data_processing_options: ['LDU'],
    data_processing_country: 'BR',
    data_processing_state: 'SP',
  },
});

/**
 * Configurações específicas do Microsoft Clarity
 */
export const getClarityConfig = () => ({
  project_id: ANALYTICS_CONFIG.MICROSOFT_CLARITY_ID,
  config: {
    // Configurações de privacidade
    respect_dnt: ANALYTICS_CONFIG.RESPECT_DNT,
    
    // Configurações de performance
    sample_rate: ANALYTICS_CONFIG.SAMPLE_RATE,
    
    // Configurações específicas do LeadBaze
    custom_tags: ['leadbaze', 'lead-generation', 'marketing-automation'],
  },
});

/**
 * Eventos personalizados do LeadBaze
 */
export const LEADBAZE_EVENTS = {
  // Eventos de conversão
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_SENT: 'campaign_sent',
  LEAD_GENERATED: 'lead_generated',
  PLAN_UPGRADED: 'plan_upgraded',
  PAYMENT_COMPLETED: 'payment_completed',
  
  // Eventos de engajamento
  DASHBOARD_VIEWED: 'dashboard_viewed',
  LEAD_LIST_VIEWED: 'lead_list_viewed',
  CAMPAIGN_LIST_VIEWED: 'campaign_list_viewed',
  PROFILE_VIEWED: 'profile_viewed',
  
  // Eventos de erro
  CAMPAIGN_ERROR: 'campaign_error',
  PAYMENT_ERROR: 'payment_error',
  API_ERROR: 'api_error',
  
  // Eventos de funcionalidade
  FEATURE_USED: 'feature_used',
  INTEGRATION_CONNECTED: 'integration_connected',
  EXPORT_COMPLETED: 'export_completed',
};

/**
 * Parâmetros padrão para eventos
 */
export const getDefaultEventParameters = () => ({
  app_name: 'LeadBaze',
  app_version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: ANALYTICS_CONFIG.ENVIRONMENT,
  timestamp: new Date().toISOString(),
});

export default ANALYTICS_CONFIG;
