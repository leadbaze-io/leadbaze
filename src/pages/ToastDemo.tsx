import { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Sun, Moon, TestTube, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import '../styles/toast-modern.css';

export default function ToastDemo() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar o estado inicial do tema
    return document.documentElement.classList.contains('dark');
  });

  // Sincronizar estado inicial do tema
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Testar CSS diretamente
  const testCSS = () => {

    // Verificar se o CSS está carregado
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.find(sheet => {
      try {
        return sheet.href && sheet.href.includes('toast-modern');
      } catch (e) {
        return false;
      }
    });
    // Testar seletor específico
    const testElement = document.createElement('div');
    testElement.className = 'toast-modern toast-success';
    testElement.innerHTML = '<div class="grid gap-1"><div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Teste</div><div class="text-sm opacity-90 text-gray-800 dark:text-gray-200">Descrição</div></div>';
    testElement.style.position = 'fixed';
    testElement.style.top = '50px';
    testElement.style.right = '50px';
    testElement.style.zIndex = '9999';
    document.body.appendChild(testElement);

    const gridElement = testElement.querySelector('.grid div:first-child');
    if (!gridElement) {

      return;
    }
    window.getComputedStyle(gridElement);
    window.getComputedStyle(testElement);
    // Remover após 5 segundos
    setTimeout(() => {
      if (document.body.contains(testElement)) {
        document.body.removeChild(testElement);
      }
    }, 5000);
  };

  // Toast Success
  const showSuccessToast = () => {
    toast({
      title: "🎉 Sucesso!",
      description: "Operação realizada com sucesso.",
      variant: "default",
      className: "toast-modern toast-success"
    });

    // Verificar se o toast foi criado após um delay
    setTimeout(() => {
      const toastElement = document.querySelector('.toast-modern.toast-success');
      if (toastElement) {
        console.log("🔍 [ToastDemo] Estilos computados:", window.getComputedStyle(toastElement));

        const textElements = toastElement.querySelectorAll('.grid div');
        textElements.forEach((el, index) => {
          console.log(`🔍 [ToastDemo] Cor computada do texto ${index + 1}:`, window.getComputedStyle(el).color);
        });
      } else {

      }
    }, 100);
  };

  // Toast Success com duração maior
  const showLongSuccessToast = () => {

    toast({
      title: "🎉 Sucesso Longo!",
      description: "Este toast fica aberto por mais tempo para testar a cor.",
      variant: "default",
      className: "toast-modern toast-success",
      duration: 10000 // 10 segundos
    });
  };

  // Toast Error
  const showErrorToast = () => {
    toast({
      title: "❌ Erro!",
      description: "Ocorreu um erro inesperado.",
      variant: "destructive",
      className: "toast-modern toast-error"
    });
  };

  // Toast Error Validation
  const showErrorValidationToast = () => {
    toast({
      title: "🚫 Limite de Leads Atingido",
      description: "Leads insuficientes. Restam 0 leads.",
      variant: "destructive",
      className: "toast-modern toast-error-validation"
    });
  };

  // Toast Error CPF
  const showErrorCpfToast = () => {
    toast({
      title: "⚠️ CPF Inválido",
      description: "O CPF informado não é válido.",
      variant: "destructive",
      className: "toast-modern toast-error-cpf"
    });
  };

  // Toast Error CNPJ
  const showErrorCnpjToast = () => {
    toast({
      title: "⚠️ CNPJ Inválido",
      description: "O CNPJ informado não é válido.",
      variant: "destructive",
      className: "toast-modern toast-error-cnpj"
    });
  };

  // Toast Error Email
  const showErrorEmailToast = () => {
    toast({
      title: "📧 Email Inválido",
      description: "O email informado não é válido.",
      variant: "destructive",
      className: "toast-modern toast-error-email"
    });
  };

  // Toast Error Network
  const showErrorNetworkToast = () => {
    toast({
      title: "🌐 Erro de Conexão",
      description: "Problema de conectividade detectado.",
      variant: "destructive",
      className: "toast-modern toast-error-network"
    });
  };

  // Toast Warning
  const showWarningToast = () => {
    toast({
      title: "⚠️ Atenção!",
      description: "Esta é uma mensagem de aviso importante.",
      variant: "default",
      className: "toast-modern toast-warning"
    });
  };

  // Toast Info
  const showInfoToast = () => {
    toast({
      title: "ℹ️ Informação",
      description: "Esta é uma mensagem informativa.",
      variant: "default",
      className: "toast-modern toast-info"
    });
  };

  // Toast Default
  const showDefaultToast = () => {
    toast({
      title: "📝 Mensagem Padrão",
      description: "Esta é uma mensagem padrão do sistema.",
      variant: "default",
      className: "toast-modern toast-default"
    });
  };
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <TestTube className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Toast Demo
              </h1>
              <Badge variant={isDarkMode ? "secondary" : "outline"}>
                {isDarkMode ? "Modo Escuro" : "Modo Claro"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDarkMode ? "Claro" : "Escuro"}</span>
              </Button>
              <Button
                onClick={testCSS}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>Testar CSS</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Success Toasts */}
          <Card className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Success Toasts</span>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Toasts de sucesso com gradiente verde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={showSuccessToast} className="w-full">
                🎉 Mostrar Toast de Sucesso
              </Button>
              <Button onClick={showLongSuccessToast} variant="outline" className="w-full">
                ⏰ Toast de Sucesso Longo (10s)
              </Button>
            </CardContent>
          </Card>

          {/* Error Toasts */}
          <Card className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <XCircle className="w-5 h-5 text-red-500" />
                <span>Error Toasts</span>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Toasts de erro com diferentes estilos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={showErrorToast} variant="destructive" className="w-full">
                ❌ Erro Geral
              </Button>
              <Button onClick={showErrorValidationToast} variant="destructive" className="w-full">
                🚫 Validação (Leads)
              </Button>
              <Button onClick={showErrorCpfToast} variant="destructive" className="w-full">
                ⚠️ Erro CPF
              </Button>
              <Button onClick={showErrorCnpjToast} variant="destructive" className="w-full">
                ⚠️ Erro CNPJ
              </Button>
              <Button onClick={showErrorEmailToast} variant="destructive" className="w-full">
                📧 Erro Email
              </Button>
              <Button onClick={showErrorNetworkToast} variant="destructive" className="w-full">
                🌐 Erro Rede
              </Button>
            </CardContent>
          </Card>

          {/* Warning Toasts */}
          <Card className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Warning Toasts</span>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Toasts de aviso com gradiente amarelo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={showWarningToast} variant="outline" className="w-full">
                ⚠️ Mostrar Toast de Aviso
              </Button>
            </CardContent>
          </Card>

          {/* Info Toasts */}
          <Card className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Info className="w-5 h-5 text-blue-500" />
                <span>Info Toasts</span>
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Toasts informativos com gradiente azul
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={showInfoToast} variant="outline" className="w-full">
                ℹ️ Mostrar Toast de Info
              </Button>
              <Button onClick={showDefaultToast} variant="outline" className="w-full">
                📝 Toast Padrão
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Instructions */}
        <Card className={`mt-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <TestTube className="w-5 h-5 text-purple-500" />
              <span>Instruções de Teste</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Modo Claro:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Verifique se o texto está legível</li>
                  <li>• Confirme se as cores estão contrastantes</li>
                  <li>• Teste todos os tipos de toast</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Modo Escuro:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Verifique se o texto está legível</li>
                  <li>• Confirme se as cores estão contrastantes</li>
                  <li>• Teste todos os tipos de toast</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Dica:</strong> Use o botão de alternar tema no canto superior direito para testar ambos os modos.
                Os toasts aparecerão no canto superior direito da tela.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
