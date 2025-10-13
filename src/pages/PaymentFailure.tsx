import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, Home, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<any>(null);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    // Simular dados do pagamento (em produção, buscar do backend)
    if (paymentId) {
      setPaymentData({
        id: paymentId,
        status: status || 'rejected',
        external_reference: externalReference
      });
    }
  }, [paymentId, status, externalReference]);

  const handleGoToPlans = () => {
    navigate('/plans');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRetryPayment = () => {
    navigate('/plans');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Ícone de erro */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Pagamento Não Processado 😔
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-400 mb-6"
        >
          Não foi possível processar seu pagamento. Tente novamente ou entre em contato conosco.
        </motion.p>

        {/* Detalhes do pagamento */}
        {paymentData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">ID do Pagamento:</span>
              <span className="font-mono text-gray-900 dark:text-white">
                {paymentData.id}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {paymentData.status === 'rejected' ? 'Rejeitado' : paymentData.status}
              </span>
            </div>
            {paymentData.external_reference && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Referência:</span>
                <span className="font-mono text-gray-900 dark:text-white text-xs">
                  {paymentData.external_reference}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={handleRetryPayment}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleGoToPlans}
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Ver Planos
          </Button>

          <Button
            onClick={handleGoToDashboard}
            variant="ghost"
            className="w-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Ir para Dashboard
          </Button>
        </motion.div>

        {/* Informações de suporte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Precisa de ajuda?</strong>
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
            <li>• Verifique os dados do cartão</li>
            <li>• Confirme se há saldo suficiente</li>
            <li>• Entre em contato: creaty12345@gmail.com</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
