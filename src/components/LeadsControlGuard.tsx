import React, { useState, useEffect, useRef } from 'react';
import { Zap, CreditCard, TrendingUp, Settings } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../hooks/use-toast';
import type { LeadsAvailabilityResponse } from '../types/subscription';

interface LeadsControlGuardProps {
  children: React.ReactNode;
  leadsToGenerate?: number;
  onLeadsExhausted?: () => void;
  onAdjustQuantity?: () => void; // Callback para ajustar quantidade
  showWarningAt?: number; // Porcentagem para mostrar aviso (padrão: 80%)
  forceShowForm?: boolean; // Força a exibição do formulário mesmo com limite atingido
}

export const LeadsControlGuard: React.FC<LeadsControlGuardProps> = ({
  children,
  leadsToGenerate = 1,
  onLeadsExhausted,
  onAdjustQuantity,
  showWarningAt = 80,
  forceShowForm = false
}) => {
  const { subscription, checkLeadsAvailability } = useSubscription();
  const { toast } = useToast();
  const [availability, setAvailability] = useState<LeadsAvailabilityResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const hasShownErrorToast = useRef(false);


  // Verificar disponibilidade de leads
  const checkAvailability = async () => {
    try {
      setIsChecking(true);
      const result = await checkLeadsAvailability(leadsToGenerate);
      setAvailability(result);
      
      // Se não pode gerar leads, mostrar toast de erro (apenas uma vez)
      if (!result.can_generate && !hasShownErrorToast.current) {
        hasShownErrorToast.current = true;
        toast({
          title: "🚫 Limite de Leads Atingido",
          description: result.message,
          variant: "destructive",
          className: "toast-modern toast-error-validation"
        });
        
        // Chamar callback se fornecido
        if (onLeadsExhausted) {
          onLeadsExhausted();
        }
      }
      
      // Verificar se deve mostrar aviso de limite próximo
      if (result.can_generate && subscription) {
        const usagePercentage = (subscription.leads_used / (subscription.leads_limit || 1)) * 100;
        
        if (usagePercentage >= showWarningAt && !hasShownWarning) {
          toast({
            title: "⚠️ Limite Próximo",
            description: `Você já utilizou ${Math.round(usagePercentage)}% do seu limite mensal. Considere atualizar seu plano.`,
            variant: "default",
            className: "toast-modern toast-warning"
          });
          setHasShownWarning(true);
        }
      }
      
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de leads:', error);
      toast({
        title: "❌ Erro de Verificação",
        description: "Não foi possível verificar a disponibilidade de leads. Tente novamente.",
        variant: "destructive",
        className: "toast-modern toast-error-network"
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar disponibilidade quando o componente monta ou quando leadsToGenerate muda
  useEffect(() => {
    // Resetar flag quando leadsToGenerate muda
    hasShownErrorToast.current = false;
    checkAvailability();
  }, [leadsToGenerate]);


  // Se está verificando, mostrar loading
  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verificando disponibilidade de leads...
          </p>
        </div>
      </div>
    );
  }

  // Se não tem assinatura ativa E não tem leads bônus disponíveis
  if (!subscription && (!availability || !availability.can_generate)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Assinatura Necessária
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Você precisa de uma assinatura ativa para gerar leads. Escolha um plano que atenda às suas necessidades.
        </p>
        <button
          onClick={() => window.location.href = '/plans'}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <CreditCard className="w-5 h-5" />
          Ver Planos
        </button>
      </div>
    );
  }


  // Se não pode gerar leads E não está forçando a exibição do formulário, mostrar mensagem
  if (availability && !availability.can_generate && !forceShowForm) {
    const isInsufficient = availability.reason === 'insufficient_leads';
    
    
    return (
      <div>
        {/* Mensagem de limite atingido */}
        <div className="test-generation-limit-reached-card rounded-2xl p-8 text-center mb-6">
          <div className="text-6xl mb-4">
            {isInsufficient ? '🚫' : 
             (!subscription && availability && availability.leads_remaining > 0) ? '🎁' : 
             '💳'}
          </div>
          
          <h3 className="test-generation-limit-reached-title text-xl font-bold mb-2">
            {isInsufficient ? 'Limite de Leads Atingido' : 
             (availability && availability.leads_remaining > 0) ? 'Quantidade Maior que Leads Disponíveis' : 
             'Assinatura Necessária'}
          </h3>
          
          <p className="test-generation-limit-reached-description mb-6">
            {(availability && availability.leads_remaining > 0) ? 
              `Você tem ${availability.leads_remaining} leads restantes. Ajuste a quantidade para ${availability.leads_remaining} ou menos.` :
              availability.message}
          </p>
          
          {isInsufficient && (
            <div className="test-generation-limit-reached-progress-card rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="test-generation-limit-reached-progress-label">Leads utilizados</span>
                <span className="test-generation-limit-reached-progress-value font-semibold">
                  {subscription?.leads_remaining && subscription?.leads_limit && subscription.leads_remaining > subscription.leads_limit ? (
                    <span className="text-gray-800 dark:text-green-400">
                      🎁 {new Intl.NumberFormat('pt-BR').format(subscription.leads_remaining - subscription.leads_limit)} leads bônus
                    </span>
                  ) : (
                    `${new Intl.NumberFormat('pt-BR').format(subscription?.leads_used || 0)} / ${new Intl.NumberFormat('pt-BR').format(subscription?.leads_limit || 0)}`
                  )}
                </span>
              </div>
              <div className="test-generation-limit-reached-progress-bg w-full rounded-full h-2">
                <div 
                  className="test-generation-limit-reached-progress-bar h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(((subscription?.leads_used || 0) / (subscription?.leads_limit || 1)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Botão para ajustar quantidade - sempre aparece se tem leads bônus */}
            {!subscription && availability && availability.leads_remaining > 0 && onAdjustQuantity && (
              <button
                onClick={onAdjustQuantity}
                className="test-generation-limit-reached-button-adjust px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Settings className="w-5 h-5" />
                Ajustar Quantidade
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/plans'}
              className="test-generation-limit-reached-button-primary px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              {isInsufficient ? 'Atualizar Plano' : 'Ver Planos'}
            </button>
            
            {isInsufficient && (
              <button
                onClick={() => window.location.href = '/profile'}
                className="test-generation-limit-reached-button-secondary px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Ver Perfil
              </button>
            )}
          </div>
        </div>
        
        {/* Não mostrar o formulário quando limite é atingido */}
      </div>
    );
  }

  // Se pode gerar leads, mostrar o conteúdo
  return (
    <div>
      {/* Indicador de leads restantes */}
      {availability && availability.can_generate && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              {!subscription ? (
                <>🎁 {new Intl.NumberFormat('pt-BR').format(availability.leads_remaining)} leads bônus restantes</>
              ) : (
                <>{new Intl.NumberFormat('pt-BR').format(availability.leads_remaining)} leads restantes este mês</>
              )}
            </span>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
  
  
};
