import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, Trophy, Gift, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoImage from '../components/LogoImage';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../contexts/ThemeContext';

const CadastroConcluido: React.FC = () => {
  const navigate = useNavigate();
  const { forceLightMode } = useTheme();
  const [countdown, setCountdown] = useState(5);
  const [userName, setUserName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Forçar modo claro
  useEffect(() => {
    forceLightMode();
  }, [forceLightMode]);

  // Verificar se o usuário está autenticado e obter dados
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        
        // Buscar nome do perfil
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          // Pegar apenas o primeiro nome
          const firstName = profile.full_name.split(' ')[0];
          setUserName(firstName);
        }
      }
    };
    
    checkUser();
  }, []);

  // Countdown e redirecionamento automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar para o dashboard
          navigate('/dashboard');
          // Scroll para o topo após navegação
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
    // Scroll para o topo após navegação
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative'
      }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse top-10 -left-20"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse bottom-10 -right-20" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-400 to-emerald-600 ring-1 ring-white/40">
              <LogoImage className="h-10 w-auto" />
            </div>
          </div>

          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 200, 
              damping: 10 
            }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <CheckCircle className="relative w-24 h-24 text-green-500" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {userName ? `Parabéns, ${userName}! 🎉` : 'Cadastro Concluído! 🎉'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-600 text-lg mb-8"
          >
            Sua conta foi criada com sucesso!
          </motion.p>

          {/* Benefits Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
              <div className="flex justify-center mb-2">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-purple-900">30 Leads Bônus</p>
              <p className="text-xs text-purple-700 mt-1">Presente de boas-vindas</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-blue-900">Acesso Imediato</p>
              <p className="text-xs text-blue-700 mt-1">Comece agora mesmo</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-900">Todas as Features</p>
              <p className="text-xs text-green-700 mt-1">100% desbloqueadas</p>
            </div>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-gray-700 font-medium">
                Redirecionando em <span className="text-purple-600 font-bold text-xl">{countdown}</span> segundos
              </span>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <button
              onClick={handleGoToDashboard}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Ir para o Dashboard Agora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              {isAuthenticated ? (
                <>✅ Você já está autenticado e pronto para começar!</>
              ) : (
                <>📧 Verifique seu email para confirmar sua conta</>
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Particles Animation */}
      <AnimatePresence>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              y: 100, 
              x: Math.random() * window.innerWidth 
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              y: -100, 
              x: Math.random() * window.innerWidth 
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: Math.random() * 2 
            }}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CadastroConcluido;

