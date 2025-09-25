import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { LeadsControlGuard } from './LeadsControlGuard';
import { useToast } from '../hooks/use-toast';
import { LeadsControlService } from '../services/leadsControlService';

interface LeadGeneratorWithControlProps {
  children: React.ReactNode;
  leadsToGenerate?: number;
  onLeadsGenerated?: (count: number) => void;
  onLeadsExhausted?: () => void;
  onAdjustQuantity?: () => void; // Callback para ajustar quantidade
}

export const LeadGeneratorWithControl: React.FC<LeadGeneratorWithControlProps> = ({
  children,
  leadsToGenerate = 1,
  onLeadsGenerated,
  onLeadsExhausted,
  onAdjustQuantity
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Função para processar geração de leads
  const handleLeadGeneration = async (action: () => Promise<any>) => {
    try {
      setIsGenerating(true);

      // Usar o serviço de controle de leads para executar a ação
      const result = await LeadsControlService.executeWithLeadsConsumption(
        action,
        leadsToGenerate,
        'lead_generation'
      );

      if (result.success && result.leadsConsumed) {
        // Sucesso - leads foram gerados e consumidos
        toast({
          title: "🎯 Leads Gerados com Sucesso!",
          description: `${leadsToGenerate} lead${leadsToGenerate > 1 ? 's' : ''} gerado${leadsToGenerate > 1 ? 's' : ''} e consumido${leadsToGenerate > 1 ? 's' : ''} do seu saldo. Saldo atualizado automaticamente!`,
          variant: "default",
          className: "toast-modern toast-success"
        });

        // Chamar callback de sucesso
        if (onLeadsGenerated) {
          onLeadsGenerated(leadsToGenerate);
        }

        // Disparar evento customizado para atualizar a interface
        setTimeout(() => {
          console.log('🔄 Disparando evento de atualização...');
          window.dispatchEvent(new CustomEvent('leadsUpdated', { 
            detail: { leadsConsumed: leadsToGenerate } 
          }));
        }, 1000);
      } else if (result.success && !result.leadsConsumed) {
        // Ação executada mas leads não foram consumidos (erro no consumo)
        toast({
          title: "⚠️ Ação Executada",
          description: "A ação foi executada, mas houve um problema ao registrar o consumo de leads.",
          variant: "default",
          className: "toast-modern toast-warning"
        });

        if (onLeadsGenerated) {
          onLeadsGenerated(leadsToGenerate);
        }
      } else {
        // Falha na execução
        toast({
          title: "❌ Erro ao Gerar Leads",
          description: result.error || "Não foi possível gerar os leads. Verifique sua assinatura.",
          variant: "destructive",
          className: "toast-modern toast-error-validation"
        });

        // Chamar callback de falha
        if (onLeadsExhausted) {
          onLeadsExhausted();
        }
      }
    } catch (error) {
      console.error('Erro inesperado ao gerar leads:', error);
      toast({
        title: "❌ Erro Inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
        className: "toast-modern toast-error-network"
      });

      if (onLeadsExhausted) {
        onLeadsExhausted();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Wrapper para componentes filhos que precisam de controle de leads
  const WrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Adicionar props para controle de leads
      return React.cloneElement(child as React.ReactElement<any>, {
        onExecute: handleLeadGeneration,
        isGenerating,
        leadsToGenerate
      });
    }
    return child;
  });

  return (
    <LeadsControlGuard
      leadsToGenerate={leadsToGenerate}
      onLeadsExhausted={onLeadsExhausted}
      onAdjustQuantity={onAdjustQuantity}
      showWarningAt={80}
    >
      <div className="relative">
        {/* Indicador de carregamento */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gerando leads...
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        {WrappedChildren}
      </div>
    </LeadsControlGuard>
  );
};

// =====================================================
// COMPONENTE DE EXEMPLO PARA GERAR LEADS
// =====================================================

interface LeadGeneratorButtonProps {
  onExecute?: (action: () => Promise<any>) => Promise<void>;
  isGenerating?: boolean;
  leadsToGenerate?: number;
  className?: string;
}

export const LeadGeneratorButton: React.FC<LeadGeneratorButtonProps> = ({
  onExecute,
  isGenerating = false,
  leadsToGenerate = 1,
  className = ''
}) => {
  // Função simulada de geração de leads
  const generateLeads = async () => {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular geração de leads
    console.log(`Gerando ${leadsToGenerate} lead(s)...`);
    
    // Retornar dados simulados
    return {
      success: true,
      leads: Array.from({ length: leadsToGenerate }, (_, i) => ({
        id: `lead_${Date.now()}_${i}`,
        name: `Lead ${i + 1}`,
        email: `lead${i + 1}@example.com`,
        phone: `1199999999${i}`,
        company: `Empresa ${i + 1}`,
        created_at: new Date().toISOString()
      }))
    };
  };

  const handleClick = async () => {
    if (onExecute) {
      await onExecute(generateLeads);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isGenerating}
      className={`
        bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
        text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
        ${className}
      `}
    >
      <Zap className="w-5 h-5" />
      {isGenerating ? 'Gerando...' : `Gerar ${leadsToGenerate} Lead${leadsToGenerate > 1 ? 's' : ''}`}
    </button>
  );
};

// =====================================================
// COMPONENTE DE EXEMPLO PARA USO
// =====================================================

export const ExampleLeadGenerator: React.FC = () => {

  const handleLeadsGenerated = (count: number) => {
    console.log(`${count} leads gerados com sucesso!`);
  };

  const handleLeadsExhausted = () => {
    console.log('Limite de leads atingido!');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Gerador de Leads com Controle
      </h2>

      <LeadGeneratorWithControl
        leadsToGenerate={5}
        onLeadsGenerated={handleLeadsGenerated}
        onLeadsExhausted={handleLeadsExhausted}
      >
        <div className="space-y-4">
          <LeadGeneratorButton leadsToGenerate={1} />
          <LeadGeneratorButton leadsToGenerate={5} />
          <LeadGeneratorButton leadsToGenerate={10} />
        </div>
      </LeadGeneratorWithControl>
    </div>
  );
};
