import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

interface MetaPixelProviderProps {
  children: React.ReactNode;
}

/**
 * Provider de Analytics que automaticamente rastreia mudanças de rota
 * e outros eventos globais da aplicação usando todos os sistemas de analytics
 */
const MetaPixelProvider: React.FC<MetaPixelProviderProps> = ({ children }) => {
  const location = useLocation();
  const { trackPageView, trackEvent } = useAnalytics();

  // Rastrear mudanças de rota automaticamente
  useEffect(() => {
    // Pequeno delay para garantir que a página carregou completamente
    const timer = setTimeout(() => {
      trackPageView();
      
      // Rastrear visualização de conteúdo específico baseado na rota
      const path = location.pathname;
      let contentName = 'Página Principal';
      
      switch (path) {
        case '/plans':
          contentName = 'Página de Planos';
          break;
        case '/dashboard':
          contentName = 'Dashboard';
          break;
        case '/campaigns':
          contentName = 'Campanhas';
          break;
        case '/profile':
          contentName = 'Perfil do Usuário';
          break;
        case '/login':
          contentName = 'Login';
          break;
        case '/signup':
          contentName = 'Cadastro';
          break;
        case '/leads':
          contentName = 'Leads';
          break;
        case '/analytics':
          contentName = 'Analytics';
          break;
        default:
          if (path.startsWith('/campaigns/')) {
            contentName = 'Detalhes da Campanha';
          } else if (path.startsWith('/leads/')) {
            contentName = 'Detalhes do Lead';
          }
      }
      
      trackEvent('page_view', {
        page_title: contentName,
        page_location: window.location.href,
        page_path: path
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, trackPageView, trackEvent]);

  return <>{children}</>;
};

export default MetaPixelProvider;
