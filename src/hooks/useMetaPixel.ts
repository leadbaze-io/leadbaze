import { useCallback } from 'react';

// Declaração global do fbq para TypeScript
declare global {
  interface Window {
    fbq: (command: string, event: string, data?: any) => void;
  }
}

/**
 * Hook personalizado para gerenciar eventos do Meta Pixel
 * 
 * @example
 * const { trackEvent, trackPurchase, trackLead } = useMetaPixel();
 * 
 * // Rastrear evento personalizado
 * trackEvent('CustomEvent', { value: 100, currency: 'BRL' });
 * 
 * // Rastrear compra
 * trackPurchase(197.00, 'BRL', 'start-plan');
 * 
 * // Rastrear lead
 * trackLead('contact-form');
 */
export const useMetaPixel = () => {
  // Verificar se o Meta Pixel está carregado
  const isPixelLoaded = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.fbq === 'function';
  }, []);

  // Rastrear evento personalizado
  const trackEvent = useCallback((eventName: string, data?: any) => {
    if (isPixelLoaded()) {
      try {
        window.fbq('track', eventName, data);
        console.log(`📊 [Meta Pixel] Evento rastreado: ${eventName}`, data);
      } catch (error) {
        console.error('❌ [Meta Pixel] Erro ao rastrear evento:', error);
      }
    } else {
      console.warn('⚠️ [Meta Pixel] Pixel não carregado ainda');
    }
  }, [isPixelLoaded]);

  // Rastrear visualização de página
  const trackPageView = useCallback(() => {
    if (isPixelLoaded()) {
      try {
        window.fbq('track', 'PageView');
        console.log('📊 [Meta Pixel] PageView rastreado');
      } catch (error) {
        console.error('❌ [Meta Pixel] Erro ao rastrear PageView:', error);
      }
    }
  }, [isPixelLoaded]);

  // Rastrear compra
  const trackPurchase = useCallback((value: number, currency: string = 'BRL', planId?: string) => {
    const purchaseData = {
      value,
      currency,
      content_type: 'product',
      content_ids: planId ? [planId] : undefined,
      content_name: planId ? `Plano ${planId}` : 'Assinatura LeadBaze'
    };

    trackEvent('Purchase', purchaseData);
  }, [trackEvent]);

  // Rastrear início de checkout
  const trackInitiateCheckout = useCallback((value: number, currency: string = 'BRL', planId?: string) => {
    const checkoutData = {
      value,
      currency,
      content_type: 'product',
      content_ids: planId ? [planId] : undefined,
      content_name: planId ? `Plano ${planId}` : 'Assinatura LeadBaze'
    };

    trackEvent('InitiateCheckout', checkoutData);
  }, [trackEvent]);

  // Rastrear lead (formulário preenchido)
  const trackLead = useCallback((source: string = 'website') => {
    trackEvent('Lead', {
      content_name: 'Lead Gerado',
      content_category: 'lead_generation',
      source
    });
  }, [trackEvent]);

  // Rastrear registro de usuário
  const trackCompleteRegistration = useCallback((method: string = 'email') => {
    trackEvent('CompleteRegistration', {
      content_name: 'Cadastro de Usuário',
      content_category: 'user_registration',
      registration_method: method
    });
  }, [trackEvent]);

  // Rastrear visualização de conteúdo
  const trackViewContent = useCallback((contentName: string, contentType: string = 'page') => {
    trackEvent('ViewContent', {
      content_name: contentName,
      content_type: contentType
    });
  }, [trackEvent]);

  // Rastrear adição ao carrinho (para pacotes de leads)
  const trackAddToCart = useCallback((value: number, currency: string = 'BRL', packageId?: string) => {
    const cartData = {
      value,
      currency,
      content_type: 'product',
      content_ids: packageId ? [packageId] : undefined,
      content_name: packageId ? `Pacote ${packageId}` : 'Pacote de Leads'
    };

    trackEvent('AddToCart', cartData);
  }, [trackEvent]);

  // Rastrear evento de campanha criada
  const trackCampaignCreated = useCallback((campaignType: string, leadsCount: number) => {
    trackEvent('CustomEvent', {
      event_name: 'CampaignCreated',
      campaign_type: campaignType,
      leads_count: leadsCount,
      content_name: 'Campanha Criada',
      content_category: 'campaign_management'
    });
  }, [trackEvent]);

  // Rastrear evento de leads gerados
  const trackLeadsGenerated = useCallback((leadsCount: number, campaignType: string) => {
    trackEvent('CustomEvent', {
      event_name: 'LeadsGenerated',
      leads_count: leadsCount,
      campaign_type: campaignType,
      content_name: 'Leads Gerados',
      content_category: 'lead_generation'
    });
  }, [trackEvent]);

  // Rastrear evento de upgrade de plano
  const trackPlanUpgrade = useCallback((fromPlan: string, toPlan: string, value: number) => {
    trackEvent('CustomEvent', {
      event_name: 'PlanUpgrade',
      from_plan: fromPlan,
      to_plan: toPlan,
      value,
      currency: 'BRL',
      content_name: 'Upgrade de Plano',
      content_category: 'subscription'
    });
  }, [trackEvent]);

  // Rastrear evento de cancelamento
  const trackCancellation = useCallback((planName: string, reason?: string) => {
    trackEvent('CustomEvent', {
      event_name: 'SubscriptionCancelled',
      plan_name: planName,
      cancellation_reason: reason,
      content_name: 'Cancelamento de Assinatura',
      content_category: 'subscription'
    });
  }, [trackEvent]);

  // Rastrear evento de login
  const trackLogin = useCallback((method: string = 'email') => {
    trackEvent('Login', {
      login_method: method,
      content_name: 'Login de Usuário',
      content_category: 'authentication'
    });
  }, [trackEvent]);

  // Rastrear evento de logout
  const trackLogout = useCallback(() => {
    trackEvent('CustomEvent', {
      event_name: 'Logout',
      content_name: 'Logout de Usuário',
      content_category: 'authentication'
    });
  }, [trackEvent]);

  // Rastrear tempo de sessão
  const trackSessionDuration = useCallback((duration: number) => {
    trackEvent('CustomEvent', {
      event_name: 'SessionDuration',
      session_duration: duration,
      content_name: 'Duração da Sessão',
      content_category: 'engagement'
    });
  }, [trackEvent]);

  return {
    // Funções básicas
    trackEvent,
    trackPageView,
    isPixelLoaded,
    
    // Funções de e-commerce
    trackPurchase,
    trackInitiateCheckout,
    trackAddToCart,
    
    // Funções de conversão
    trackLead,
    trackCompleteRegistration,
    trackLogin,
    trackLogout,
    
    // Funções de conteúdo
    trackViewContent,
    
    // Funções específicas do LeadBaze
    trackCampaignCreated,
    trackLeadsGenerated,
    trackPlanUpgrade,
    trackCancellation,
    trackSessionDuration
  };
};

export default useMetaPixel;
