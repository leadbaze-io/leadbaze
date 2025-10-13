import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, CreditCard } from 'lucide-react';
import { PlanCard } from '../components/PlanCard';
import SupportContact from '../components/SupportContact';
import { usePlans } from '../hooks/usePlans';
import { useSubscription } from '../hooks/useSubscription';
import { useAnalytics } from '../hooks/useAnalytics';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../contexts/ThemeContext'

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans, isLoading: plansLoading, error: plansError } = usePlans();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { trackEvent } = useAnalytics();
  const { isDark } = useTheme();
  
  const [userData, setUserData] = useState<{ id: string; email: string } | null>(null);

  // Rastrear visualização da página de planos
  useEffect(() => {
    trackEvent('page_view', {
      page_title: 'Página de Planos',
      page_location: window.location.href,
      page_path: '/plans'
    });
  }, [trackEvent]);

  // Buscar dados do usuário
  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserData({
            id: user.id,
            email: user.email || 'usuario@exemplo.com'
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    getUserData();
  }, []);


  const handleUpgrade = () => {
    // Scroll para a seção de planos
    const plansSection = document.getElementById('plans-section');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4" style={{borderColor: '#b7c7c1'}}></div>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent absolute top-0 left-1/2 transform -translate-x-1/2" style={{borderTopColor: '#00ff00'}}></div>
          </div>
          <p className="font-medium" style={{color: '#2e4842'}}>Carregando planos...</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: '#00ff00'}}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.1s', backgroundColor: '#00ff00' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s', backgroundColor: '#00ff00' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao Carregar Planos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {plansError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0a0f0e 0%, #0f1514 50%, #0a0f0e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)'
      }}
    >
      {/* Header */}
      <div className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #082721 0%, #1A3A3A 50%, #082721 100%)'
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
                opacity: 0.1
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Escolha seu Plano
                </h1>
                
                <div className="w-20" /> {/* Spacer */}
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção de Assinatura Atual */}
        {subscription && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 
                className="text-3xl font-bold mb-4"
                style={{ color: isDark ? '#ffffff' : '#082721' }}
              >
                Sua Assinatura Atual
              </h2>
              <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                Gerencie sua assinatura ou atualize para um plano com mais recursos
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  borderColor: isDark ? '#2a2a2a' : '#e5e7eb'
                }}
              >
                <div className="text-center mb-6">
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: isDark ? '#ffffff' : '#082721' }}
                  >
                    {subscription.plan_display_name || subscription.plan_name || 'Plano'}
                  </h3>
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: '#10b981' }}
                  >
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(subscription.price_monthly || 0)}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    por mês
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm plans-text-muted mb-2">
                    <span>Leads utilizados</span>
                    <span>
                      {subscription.leads_remaining > subscription.leads_limit ? (
                        <span className="text-gray-800 dark:text-green-400">
                          🎁 {new Intl.NumberFormat('pt-BR').format(subscription.leads_remaining - subscription.leads_limit)} leads bônus
                        </span>
                      ) : (
                        `${new Intl.NumberFormat('pt-BR').format(subscription.leads_used)} / ${new Intl.NumberFormat('pt-BR').format(subscription.leads_limit)}`
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((subscription.leads_used / subscription.leads_limit) * 100) || 0, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Informação sobre Upgrade */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 mt-0.5">ℹ️</div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                        Sobre Upgrades
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Exemplo:</strong> Se você tem Plano Start (1000 leads) e faz upgrade para Scale (4000 leads), 
                        receberá apenas 3000 leads adicionais imediatamente. A diferença de preço será cobrada no momento da atualização. 
                        No próximo ciclo de cobrança, você receberá o total de 4000 leads do novo plano.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                >
                  Atualizar Plano
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Planos */}
        <div id="plans-section">
          <div className="text-center mb-12">
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ color: isDark ? '#ffffff' : '#082721' }}
            >
              {subscription ? 'Atualize seu Plano' : 'Escolha o Plano Ideal'}
            </h2>
            <p 
              className="text-xl mb-8"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            >
              {subscription 
                ? 'Desbloqueie mais recursos e aumente sua capacidade de geração de leads'
                : 'Comece a gerar leads de qualidade hoje mesmo'
              }
            </p>
          </div>

          {/* Cards dos Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={{
                  ...plan,
                  userId: userData?.id,
                  userEmail: userData?.email
                }}
                currentPlan={subscription || undefined}
                onSelectPlan={() => {}}
                isPopular={plan.name === 'scale'}
              />
            ))}
          </div>

          {/* Mensagem de Suporte para usuários com assinatura ativa */}
          {subscription && subscription.status === 'active' && !subscription.is_free_trial && (
            <div className="mt-12 max-w-4xl mx-auto">
              <SupportContact />
            </div>
          )}
        </div>

        {/* Seção de Comparação */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold plans-title mb-4">
              Compare os Planos
            </h3>
            <p className="plans-text-muted">
              Veja todos os recursos incluídos em cada plano
            </p>
          </div>

          <div className="plans-comparison-table rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="plans-table-header">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold plans-text sticky left-0 bg-inherit">
                      Recursos
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm font-semibold plans-text min-w-[120px]">
                        {plan.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm plans-text plans-table-cell sticky left-0 bg-inherit font-medium">
                      Leads por mês
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm plans-text plans-table-cell">
                        {new Intl.NumberFormat('pt-BR').format(plan.leads)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm plans-text plans-table-cell sticky left-0 bg-inherit font-medium">
                      Suporte
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-3 sm:px-6 py-4 text-center plans-table-cell">
                        {plan.name === 'start' && <span className="text-xs sm:text-sm plans-text">Email</span>}
                        {plan.name === 'scale' && <span className="text-xs sm:text-sm plans-text">Prioritário</span>}
                        {plan.name === 'enterprise' && <span className="text-xs sm:text-sm plans-text">24/7</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm plans-text plans-table-cell sticky left-0 bg-inherit font-medium">
                      Relatórios
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-3 sm:px-6 py-4 text-center plans-table-cell">
                        {plan.name === 'start' && <span className="text-xs sm:text-sm plans-text">Básicos</span>}
                        {plan.name === 'scale' && <span className="text-xs sm:text-sm plans-text">Avançados</span>}
                        {plan.name === 'enterprise' && <span className="text-xs sm:text-sm plans-text">Customizados</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm plans-text plans-table-cell sticky left-0 bg-inherit font-medium">
                      Integração CRM
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-3 sm:px-6 py-4 text-center plans-table-cell">
                        {plan.name === 'start' && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" />}
                        {plan.name === 'scale' && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" />}
                        {plan.name === 'enterprise' && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seção de Garantia */}
        <div className="mt-16 text-center">
          <div className="plans-guarantee-card rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold plans-title mb-4">
              Política de Cancelamento
            </h3>
            <p className="plans-text-muted mb-4">
              Cancele a qualquer momento e <strong>mantenha acesso aos leads restantes</strong> até o final do período atual.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Importante:</strong> O cancelamento pode ser feito a qualquer momento. Você continuará com acesso aos leads restantes até o final do período atual.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm plans-text-muted">
              <CreditCard className="w-4 h-4" />
              <span>Pagamento seguro e criptografado via Perfect Pay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
