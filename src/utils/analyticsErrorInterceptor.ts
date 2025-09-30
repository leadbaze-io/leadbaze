/**
 * Sistema de Interceptação de Erros de Analytics
 * 
 * Este arquivo intercepta erros de rede relacionados a analytics
 * e os trata silenciosamente para evitar poluição do console.
 */

// Interceptar fetch requests para analytics
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  
  // Verificar se é uma URL de analytics que deve ser bloqueada
  if (typeof url === 'string' && isAnalyticsUrl(url)) {
    // Interceptar e falhar silenciosamente
    return Promise.reject(new Error('Analytics blocked by ad blocker'));
  }
  
  return originalFetch.apply(this, args);
};

// Interceptar XMLHttpRequest para analytics
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
  (this as any)._url = url;
  return originalXHROpen.call(this, method, url, async ?? true, username, password);
};

const originalXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(...args) {
  if ((this as any)._url && isAnalyticsUrl((this as any)._url)) {
    // Interceptar e falhar silenciosamente
    return Promise.reject(new Error('Analytics blocked by ad blocker'));
  }
  
  return originalXHRSend.apply(this, args);
};

// Verificar se uma URL é de analytics
function isAnalyticsUrl(url: string): boolean {
  const analyticsDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'googleadservices.com',
    'doubleclick.net',
    'googlesyndication.com',
    'facebook.com',
    'connect.facebook.net',
    'clarity.ms',
    'microsoft.com'
  ];
  
  return analyticsDomains.some(domain => url.includes(domain));
}

// Interceptar erros de console relacionados a analytics
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args[0];
  
  // Verificar se é um erro de analytics bloqueado
  if (typeof message === 'string' && (
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('net::ERR_BLOCKED_BY_CLIENT') ||
    message.includes('google-analytics') ||
    message.includes('googleadservices') ||
    message.includes('doubleclick')
  )) {
    // Silenciosamente ignorar erros de analytics bloqueados
    return;
  }
  
  // Chamar o console.error original para outros erros
  return originalConsoleError.apply(console, args);
};

// Interceptar warnings de console relacionados a analytics
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args[0];
  
  // Verificar se é um warning de analytics bloqueado
  if (typeof message === 'string' && (
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('net::ERR_BLOCKED_BY_CLIENT') ||
    message.includes('google-analytics') ||
    message.includes('googleadservices') ||
    message.includes('doubleclick')
  )) {
    // Silenciosamente ignorar warnings de analytics bloqueados
    return;
  }
  
  // Chamar o console.warn original para outros warnings
  return originalConsoleWarn.apply(console, args);
};

// Interceptar erros não capturados relacionados a analytics
window.addEventListener('error', (event) => {
  const message = event.message || '';
  const source = event.filename || '';
  
  // Verificar se é um erro de analytics bloqueado
  if (
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('net::ERR_BLOCKED_BY_CLIENT') ||
    source.includes('google-analytics') ||
    source.includes('googleadservices') ||
    source.includes('doubleclick')
  ) {
    // Prevenir que o erro apareça no console
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Interceptar promises rejeitadas relacionadas a analytics
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || '';
  
  // Verificar se é um erro de analytics bloqueado
  if (
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('net::ERR_BLOCKED_BY_CLIENT') ||
    message.includes('Analytics blocked by ad blocker')
  ) {
    // Prevenir que o erro apareça no console
    event.preventDefault();
    return false;
  }
});

export default function setupAnalyticsErrorInterceptor() {
  // Função já executada no carregamento do módulo
  console.log('🛡️ Analytics Error Interceptor ativado');
}
