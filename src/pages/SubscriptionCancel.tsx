import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  const handleTryAgain = () => {
    navigate('/pricing'); // Vai para a página de planos
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Ícone de Cancelamento */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Pagamento Cancelado
          </h1>

          {/* Mensagem */}
          <p className="text-gray-600 mb-8">
            Seu pagamento foi cancelado. Não se preocupe, nenhuma cobrança foi realizada.
          </p>

          {/* Informações */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              O que aconteceu?
            </h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Você cancelou o pagamento</li>
              <li>• Sua conta permanece inalterada</li>
              <li>• Você pode tentar novamente a qualquer momento</li>
              <li>• Seus leads bônus continuam disponíveis</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </button>

            <button
              onClick={handleGoBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>

          {/* Informação de Suporte */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">
              Precisa de Ajuda?
            </h4>
            <p className="text-sm text-blue-600">
              Se você teve algum problema durante o pagamento, entre em contato conosco. 
              Estamos aqui para ajudar!
            </p>
            <button className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm">
              Falar com Suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;










