/**
 * Utility para lidar com erros de extensões do navegador
 * Previne erros de extensões de poluírem o console da aplicação
 */

// Declarações de tipos para Chrome Extensions
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        lastError?: {
          message?: string;
        };
      };
    };
  }
}

// Interceptar erros de extensões do navegador
export const setupExtensionErrorHandler = () => {
  if (typeof window === 'undefined') return;

  // Interceptar erros não capturados
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    // Verificar se o erro é de uma extensão do navegador
    if (isExtensionError(message, source)) {
      // Silenciosamente ignorar erros de extensões
      return true;
    }
    
    // Chamar o handler original para outros erros
    if (originalError) {
      return originalError.call(window, message, source, lineno, colno, error);
    }
    
    return false;
  };

  // Interceptar promises rejeitadas
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    // Verificar se o erro é de uma extensão
    if (isExtensionError(event.reason?.message || event.reason, event.reason?.stack)) {
      // Silenciosamente ignorar erros de extensões
      event.preventDefault();
      return;
    }
    
    // Chamar o handler original para outros erros
    if (originalUnhandledRejection) {
      originalUnhandledRejection.call(window, event);
    }
  };

  // Interceptar runtime.lastError do Chrome
  if (typeof window !== 'undefined' && window.chrome?.runtime) {
    const originalLastError = window.chrome.runtime.lastError;
    Object.defineProperty(window.chrome.runtime, 'lastError', {
      get: function() {
        const error = originalLastError;
        // Limpar o erro após ler para evitar acúmulo
        if (error) {
          delete window.chrome!.runtime!.lastError;
        }
        return error;
      },
      configurable: true
    });
  }
};

// Verificar se um erro é de uma extensão do navegador
const isExtensionError = (message: any, source?: any): boolean => {
  if (!message) return false;
  
  const messageStr = String(message);
  const sourceStr = String(source || '');
  
  // Padrões comuns de erros de extensões
  const extensionPatterns = [
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'UltraWide',
    'uBlock',
    'AdBlock',
    'Ghostery',
    'Privacy Badger',
    'LastPass',
    '1Password',
    'Bitwarden',
    'Dashlane',
    'Grammarly',
    'Honey',
    'Honeybee',
    'Capital One',
    'PayPal',
    'Amazon Assistant',
    'Evernote',
    'Pocket',
    'Pinterest',
    'LinkedIn',
    'Facebook',
    'Twitter',
    'Instagram',
    'WhatsApp',
    'Telegram',
    'Discord',
    'Slack',
    'Zoom',
    'Microsoft Teams',
    'Google Meet',
    'Cisco Webex',
    'Skype',
    'Spotify',
    'Netflix',
    'YouTube',
    'Twitch',
    'Steam',
    'Epic Games',
    'Origin',
    'Battle.net',
    'Ubisoft',
    'EA Desktop',
    'GOG Galaxy',
    'Xbox Game Bar',
    'PlayStation',
    'NVIDIA',
    'AMD',
    'Intel',
    'Realtek',
    'Creative',
    'Logitech',
    'Razer',
    'Corsair',
    'SteelSeries',
    'HyperX',
    'ASUS',
    'MSI',
    'Gigabyte',
    'EVGA',
    'Thermaltake',
    'Cooler Master',
    'Noctua',
    'Arctic',
    'be quiet!',
    'Fractal Design',
    'Lian Li',
    'Phanteks',
    'NZXT',
    'Corsair',
    'Thermaltake',
    'Cooler Master',
    'Noctua',
    'Arctic',
    'be quiet!',
    'Fractal Design',
    'Lian Li',
    'Phanteks',
    'NZXT'
  ];

  return extensionPatterns.some(pattern => 
    messageStr.includes(pattern) || sourceStr.includes(pattern)
  );
};

// Função para verificar se uma extensão específica está causando problemas
export const isExtensionActive = (extensionName: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Verificar se a extensão está presente no DOM
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.src.includes(extensionName.toLowerCase())) {
        return true;
      }
    }
    
    // Verificar se há elementos da extensão no DOM
    const elements = document.querySelectorAll(`[data-extension="${extensionName}"]`);
    if (elements.length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

// Função para detectar se o usuário está usando um bloqueador de anúncios
export const isAdBlockerActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Verificar se scripts de analytics foram bloqueados
    const gaScript = document.querySelector('script[src*="googletagmanager"]');
    const fbScript = document.querySelector('script[src*="connect.facebook.net"]');
    
    if (!gaScript && !fbScript) {
      return true;
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
    return false;
  }
};

export default setupExtensionErrorHandler;
