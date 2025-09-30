import { useCallback } from 'react';
import { ANALYTICS_CONFIG, shouldRunAnalytics, getDefaultEventParameters } from '../config/analytics';

// Declarações globais para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    clarity: (...args: any[]) => void;
    fbq: (command: string, event: string, data?: any) => void;
  }
}

/**
 * Hook personalizado para gerenciar todos os sistemas de analytics
 * 
 * Inclui:
 * - Google Analytics (GA4)
 * - Google Ads
 * - Google Tag Manager
 * - Microsoft Clarity
 * - Meta Pixel (Facebook)
 * 
 * @example
 * const { trackEvent, trackPurchase, trackPageView } = useAnalytics();
 * 
 * // Rastrear evento personalizado
 * trackEvent('button_click', { button_name: 'signup' });
 * 
 * // Rastrear compra
 * trackPurchase(197.00, 'BRL', 'start-plan');
 * 
 * // Rastrear visualização de página
 * trackPageView('/dashboard');
 */
export const useAnalytics = () => {
  
  // Verificar se os scripts estão carregados
  const isGALoaded = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }, []);

  const isClarityLoaded = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.clarity === 'function';
  }, []);

  const isPixelLoaded = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.fbq === 'function';
  }, []);

  // Verificar se analytics deve ser executado
  const canRunAnalytics = useCallback(() => {
    return shouldRunAnalytics() && !isAnalyticsBlocked();
  }, []);

  // Verificar se analytics está sendo bloqueado
  const isAnalyticsBlocked = useCallback(() => {
    if (!ANALYTICS_CONFIG.DETECT_AD_BLOCKER) return false;
    
    try {
      // Verificar se os scripts do Google Analytics foram bloqueados
      const gaScript = document.querySelector('script[src*="googletagmanager"]');
      const gaConfig = document.querySelector('script[src*="gtag"]');
      
      // Se não há scripts do GA carregados, provavelmente está bloqueado
      if (!gaScript && !gaConfig) {
        return true;
      }
      
      // Verificar se o objeto gtag existe mas não funciona
      if (typeof window.gtag === 'function') {
        try {
          // Tentar fazer uma chamada de teste
          window.gtag('config', 'test');
        } catch (error) {
          return true;
        }
      }
      
      // Verificar se há elementos de teste de bloqueador
      const testElement = document.createElement('div');
      testElement.className = 'adsbox';
      testElement.style.display = 'none';
      document.body.appendChild(testElement);
      
      const isBlocked = testElement.offsetHeight === 0;
      document.body.removeChild(testElement);
      
      return isBlocked;
    } catch (error) {
      // Se houver erro na verificação, assumir que está bloqueado
      return true;
    }
  }, []);

  // Rastrear visualização de página
  const trackPageView = useCallback((path?: string) => {
    if (!canRunAnalytics()) return;
    
    const currentPath = path || window.location.pathname;
    
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('config', ANALYTICS_CONFIG.GOOGLE_ANALYTICS_ID, {
          page_path: currentPath,
          page_title: document.title,
          ...getDefaultEventParameters()
        });
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Google Analytics] PageView: ${currentPath}`);
        }
      }

      // Google Ads
      if (isGALoaded()) {
        window.gtag('config', ANALYTICS_CONFIG.GOOGLE_ADS_ID, {
          page_path: currentPath,
          page_title: document.title
        });
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Google Ads] PageView: ${currentPath}`);
        }
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'PageView');
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Meta Pixel] PageView: ${currentPath}`);
        }
      }

      // Microsoft Clarity
      if (isClarityLoaded()) {
        window.clarity('set', 'page', currentPath);
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Clarity] PageView: ${currentPath}`);
        }
      }

    } catch (error) {
      if (ANALYTICS_CONFIG.DEBUG_ANALYTICS) {
        console.error('❌ [Analytics] Erro ao rastrear PageView:', error);
      }
    }
  }, [isGALoaded, isPixelLoaded, isClarityLoaded, canRunAnalytics]);

  // Rastrear evento personalizado
  const trackEvent = useCallback((eventName: string, parameters?: any) => {
    if (!canRunAnalytics()) return;
    
    const eventData = {
      ...getDefaultEventParameters(),
      ...parameters
    };
    
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', eventName, eventData);
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Google Analytics] Event: ${eventName}`, eventData);
        }
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', eventName, eventData);
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Meta Pixel] Event: ${eventName}`, eventData);
        }
      }

      // Microsoft Clarity
      if (isClarityLoaded()) {
        window.clarity('event', eventName);
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Clarity] Event: ${eventName}`);
        }
      }

    } catch (error) {
      if (ANALYTICS_CONFIG.DEBUG_ANALYTICS) {
        console.error('❌ [Analytics] Erro ao rastrear evento:', error);
      }
    }
  }, [isGALoaded, isPixelLoaded, isClarityLoaded, canRunAnalytics]);

  // Rastrear compra
  const trackPurchase = useCallback((value: number, currency: string = 'BRL', transactionId?: string, items?: any[]) => {
    if (!canRunAnalytics()) return;
    
    const purchaseData = {
      transaction_id: transactionId || `txn_${Date.now()}`,
      value,
      currency,
      items: items || [],
      ...getDefaultEventParameters()
    };

    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'purchase', purchaseData);
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Google Analytics] Purchase:`, purchaseData);
        }
      }

      // Google Ads
      if (isGALoaded()) {
        window.gtag('event', 'conversion', {
          send_to: ANALYTICS_CONFIG.GOOGLE_ADS_ID,
          value: value,
          currency: currency,
          transaction_id: purchaseData.transaction_id
        });
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Google Ads] Conversion:`, purchaseData);
        }
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'Purchase', purchaseData);
        
        if (ANALYTICS_CONFIG.VERBOSE_LOGGING) {
          console.log(`📊 [Meta Pixel] Purchase:`, purchaseData);
        }
      }

    } catch (error) {
      if (ANALYTICS_CONFIG.DEBUG_ANALYTICS) {
        console.error('❌ [Analytics] Erro ao rastrear compra:', error);
      }
    }
  }, [isGALoaded, isPixelLoaded, canRunAnalytics]);

  // Rastrear início de checkout
  const trackInitiateCheckout = useCallback((value: number, currency: string = 'BRL', items?: any[]) => {
    const checkoutData = {
      value,
      currency,
      items: items || []
    };

    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'begin_checkout', checkoutData);
        console.log(`📊 [Google Analytics] Begin Checkout:`, checkoutData);
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'InitiateCheckout', checkoutData);
        console.log(`📊 [Meta Pixel] InitiateCheckout:`, checkoutData);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear checkout:', error);
    }
  }, [isGALoaded, isPixelLoaded]);

  // Rastrear login
  const trackLogin = useCallback((method: string = 'email') => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'login', { method });
        console.log(`📊 [Google Analytics] Login: ${method}`);
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'Login', { method });
        console.log(`📊 [Meta Pixel] Login: ${method}`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear login:', error);
    }
  }, [isGALoaded, isPixelLoaded]);

  // Rastrear cadastro
  const trackSignUp = useCallback((method: string = 'email') => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'sign_up', { method });
        console.log(`📊 [Google Analytics] Sign Up: ${method}`);
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'CompleteRegistration', { method });
        console.log(`📊 [Meta Pixel] CompleteRegistration: ${method}`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear cadastro:', error);
    }
  }, [isGALoaded, isPixelLoaded]);

  // Rastrear lead gerado
  const trackLead = useCallback((source: string = 'website', value?: number) => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'generate_lead', { 
          source,
          value: value || 0,
          currency: 'BRL'
        });
        console.log(`📊 [Google Analytics] Lead Generated: ${source}`);
      }

      // Google Ads
      if (isGALoaded() && value) {
        window.gtag('event', 'conversion', {
          send_to: 'AW-17598053351',
          value: value,
          currency: 'BRL'
        });
        console.log(`📊 [Google Ads] Lead Conversion: ${value}`);
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'Lead', { source });
        console.log(`📊 [Meta Pixel] Lead: ${source}`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear lead:', error);
    }
  }, [isGALoaded, isPixelLoaded]);

  // Rastrear campanha criada
  const trackCampaignCreated = useCallback((campaignType: string, leadsCount: number) => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'campaign_created', {
          campaign_type: campaignType,
          leads_count: leadsCount
        });
        console.log(`📊 [Google Analytics] Campaign Created: ${campaignType}`);
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'CustomEvent', {
          event_name: 'CampaignCreated',
          campaign_type: campaignType,
          leads_count: leadsCount
        });
        console.log(`📊 [Meta Pixel] Campaign Created: ${campaignType}`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear campanha:', error);
    }
  }, [isGALoaded, isPixelLoaded]);

  // Rastrear upgrade de plano
  const trackPlanUpgrade = useCallback((fromPlan: string, toPlan: string, value: number) => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'plan_upgrade', {
          from_plan: fromPlan,
          to_plan: toPlan,
          value: value,
          currency: 'BRL'
        });
        console.log(`📊 [Google Analytics] Plan Upgrade: ${fromPlan} → ${toPlan}`);
      }

      // Meta Pixel
      if (isPixelLoaded()) {
        window.fbq('track', 'CustomEvent', {
          event_name: 'PlanUpgrade',
          from_plan: fromPlan,
          to_plan: toPlan,
          value: value,
          currency: 'BRL'
        });
        console.log(`📊 [Meta Pixel] Plan Upgrade: ${fromPlan} → ${toPlan}`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear upgrade:', error);
    }
  }, [isGALoaded, isPixelLoaded]);

  // Rastrear tempo de sessão
  const trackSessionDuration = useCallback((duration: number) => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'session_duration', {
          duration: duration
        });
        console.log(`📊 [Google Analytics] Session Duration: ${duration}s`);
      }

      // Microsoft Clarity
      if (isClarityLoaded()) {
        window.clarity('event', 'session_duration');
        console.log(`📊 [Clarity] Session Duration: ${duration}s`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear duração:', error);
    }
  }, [isGALoaded, isClarityLoaded]);

  // Rastrear erro
  const trackError = useCallback((errorType: string, errorMessage: string) => {
    try {
      // Google Analytics
      if (isGALoaded()) {
        window.gtag('event', 'exception', {
          description: errorMessage,
          fatal: false
        });
        console.log(`📊 [Google Analytics] Error: ${errorType}`);
      }

      // Microsoft Clarity
      if (isClarityLoaded()) {
        window.clarity('event', 'error');
        console.log(`📊 [Clarity] Error: ${errorType}`);
      }

    } catch (error) {
      console.error('❌ [Analytics] Erro ao rastrear erro:', error);
    }
  }, [isGALoaded, isClarityLoaded]);

  return {
    // Funções básicas
    trackPageView,
    trackEvent,
    
    // Funções de e-commerce
    trackPurchase,
    trackInitiateCheckout,
    
    // Funções de conversão
    trackLogin,
    trackSignUp,
    trackLead,
    
    // Funções específicas do LeadBaze
    trackCampaignCreated,
    trackPlanUpgrade,
    trackSessionDuration,
    trackError,
    
    // Verificações de carregamento
    isGALoaded,
    isClarityLoaded,
    isPixelLoaded,
    isAnalyticsBlocked,
    canRunAnalytics
  };
};

export default useAnalytics;





