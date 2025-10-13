import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import RecurringSubscriptionButton from './RecurringSubscriptionButton';
import type { PlanCardProps } from '../types/subscription';

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentPlan,
  isPopular = false
}) => {
  const isCurrentPlan = currentPlan?.plan_id === plan.id && currentPlan?.status === 'active';
  
  // Usar sempre o preço mensal
  const price = plan.price;

  // Função para determinar hierarquia dos planos
  const getPlanHierarchy = (planName: string): number => {
    const hierarchy = {
      'start': 1,
      'scale': 2,
      'enterprise': 3
    };
    return hierarchy[planName.toLowerCase() as keyof typeof hierarchy] || 0;
  };

  // Verificar se o plano é inferior ao atual
  const isInferiorPlan = currentPlan && 
    currentPlan.status === 'active' && 
    !currentPlan.is_free_trial &&
    getPlanHierarchy(plan.name) < getPlanHierarchy(currentPlan.plan_name || '');

  // Verificar se o usuário tem assinatura ativa (para mostrar mensagem de suporte)
  const hasActiveSubscription = currentPlan && 
    currentPlan.status === 'active' && 
    !currentPlan.is_free_trial;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatLeads = (count: number) => {
    return new Intl.NumberFormat('pt-BR').format(count);
  };

  return (
    <div className={`
      relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl
      flex flex-col h-full
      ${isCurrentPlan 
        ? 'border-blue-500 shadow-blue-200 dark:shadow-blue-900' 
        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      }
      ${isPopular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
    `}>
      {/* Badge Popular */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="w-4 h-4" />
            Mais Popular
          </div>
        </div>
      )}

      {/* Badge Plano Atual */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Plano Atual
          </div>
        </div>
      )}

      <div className="p-8 flex flex-col h-full">
        {/* Header do Plano */}
        <div className="text-center mb-8 flex-shrink-0">
          <div className="flex items-center justify-center mb-4">
            {plan.name === 'start' && <Zap className="w-8 h-8 text-blue-500" />}
            {plan.name === 'scale' && <Star className="w-8 h-8 text-purple-500" />}
            {plan.name === 'enterprise' && <Check className="w-8 h-8 text-green-500" />}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.display_name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            {plan.description}
          </p>

          {/* Preço */}
          <div className="mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {formatPrice(price)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                por mês
              </div>
            </div>
          </div>

          {/* Limite de Leads */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatLeads(plan.leads)}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              leads por mês
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            O que está incluído:
          </h4>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botão de Ação */}
        <div className="text-center flex-shrink-0">
          {isCurrentPlan ? (
            <button
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
            >
              Plano Atual
            </button>
          ) : isInferiorPlan ? (
            <button
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
            >
              Plano Inferior
            </button>
          ) : hasActiveSubscription ? (
            <button
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
            >
              Contatar Suporte
            </button>
          ) : (
            <RecurringSubscriptionButton
              planId={plan.id}
              planName={plan.display_name}
              amount={price}
              leadsLimit={plan.leads}
              userId={plan.userId || "temp-user-id"}
              userEmail={plan.userEmail || "temp@example.com"}
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};
