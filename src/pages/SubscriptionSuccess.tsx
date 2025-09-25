import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    // Simular verificação de status da assinatura
    const timer = setTimeout(() => {
      setIsLoading(false);
      // TODO: Buscar dados reais da assinatura quando Perfect Pay estiver integrado
      setSubscriptionData({
        plan: 'Plano Selecionado',
        amount: 49.90,
        leads: 1000,
        status: 'active'
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Processando Pagamento
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto confirmamos sua assinatura...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Ícone de Sucesso */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Pagamento Aprovado!
          </h1>

          {/* Mensagem */}
          <p className="text-gray-600 mb-8">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos do seu plano!
          </p>

          {/* Detalhes da Assinatura */}
          {subscriptionData && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detalhes da Assinatura
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-semibold text-gray-800">{subscriptionData.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold text-gray-800">
                    R$ {subscriptionData.amount.toFixed(2)}/mês
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leads Mensais:</span>
                  <span className="font-semibold text-gray-800">
                    {subscriptionData.leads.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Ativo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botão para Dashboard */}
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            Ir para Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Informação Adicional */}
          <p className="text-sm text-gray-500 mt-6">
            Você receberá um e-mail de confirmação em breve com todos os detalhes da sua assinatura.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
