import { useState } from 'react';
import { useCRMIntegration } from '../hooks/useCRMIntegration';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

export function CRMSettings() {
    const { integration, isConnected, isLoading, error, disconnect, reload, connect } = useCRMIntegration('kommo');
    const [isTesting, setIsTesting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        let authWindow: Window | null = null;
        let timer: NodeJS.Timeout | null = null;

        // Listener robusto para LocalStorage (caso o postMessage falhe)
        const storageHandler = (event: StorageEvent) => {
            console.log('🔍 [Kommo] Storage event disparado:', event.key, event.newValue ? 'com dados' : 'sem dados');

            if (event.key === 'kommo_oauth_result' && event.newValue) {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('📦 [Kommo] Dados recebidos via LocalStorage:', data);

                    if (data && data.code) {
                        console.log('✅ [Kommo] Código encontrado! Iniciando conexão...');

                        // Limpa o storage para não disparar dnv
                        localStorage.removeItem('kommo_oauth_result');

                        // Chama o mesmo handler de sucesso
                        authWindow?.close();
                        cleanupListeners();

                        // Simula o evento de mensagem para reaproveitar lógica
                        handleAuthSuccess(data.code, data.referer);
                    }
                } catch (e) {
                    console.error('❌ [Kommo] Erro ao processar dados do storage:', e);
                }
            }
        };

        const cleanupListeners = () => {
            console.log('🧹 [Kommo] Limpando listeners...');
            window.removeEventListener('message', customMessageHandler);
            window.removeEventListener('storage', storageHandler);
            if (timer) clearInterval(timer);
        };

        // Função centralizada de sucesso
        const handleAuthSuccess = async (code: string, referer: string) => {
            console.log('🚀 [Kommo] Sucesso! Código:', code, 'Referer:', referer);
            try {
                // Extract subdomain from referer (e.g., "dvemarketingadm.kommo.com" -> "dvemarketingadm")
                let subdomain = null;
                if (referer) {
                    subdomain = referer.split('.')[0];
                    console.log('🔗 [Kommo] Subdomínio detectado:', subdomain);
                }

                // Connect without prompting
                console.log('🔌 [Kommo] Chamando API de conexão...');
                await connect(code, { subdomain });
                console.log('✅ [Kommo] Conexão finalizada!');

                setTimeout(() => {
                    reload();
                    alert('Conectado com sucesso!');
                }, 1000);

            } catch (connErr) {
                console.error('❌ [Kommo] Erro de conexão no backend:', connErr);
                alert('Erro ao conectar: ' + (connErr instanceof Error ? connErr.message : String(connErr)));
            } finally {
                setIsConnecting(false);
            }
        };

        // Atualiza o messageHandler original para usar a função authSuccess
        // (Reescrevendo a lógica do messageHandler anterior para integrar)
        const customMessageHandler = (event: MessageEvent) => {
            console.log('📨 [Kommo] PostMessage recebido:', event.data);
            if (event.data && event.data.code && event.data.source === 'kommo-oauth') {
                console.log('✅ [Kommo] Mensagem válida! Processando...');
                cleanupListeners();
                handleAuthSuccess(event.data.code, event.data.referer);
            }
        };

        try {
            setIsConnecting(true);

            // 1. Get Authentication URL from backend (or construct it)
            // For Kommo: https://www.kommo.com/oauth?client_id={ID}&mode=popup
            // We'll use a hardcoded URL construction here for simplicity, but backend could provide it

            // NOTE: In a real app, these should come from env or backend
            const clientId = '65441bcb-fbd5-4369-8d85-0d5b43d64b22';

            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            // Open Popup
            authWindow = window.open(
                `https://www.kommo.com/oauth?client_id=${clientId}&mode=popup`,
                'Kommo Connect',
                `width=${width},height=${height},top=${top},left=${left}`
            );

            // Listen for messages from the popup (Kommo postMessage)
            window.addEventListener('message', customMessageHandler);
            window.addEventListener('storage', storageHandler);

            // Check if window closed without auth
            timer = setInterval(() => {
                if (authWindow?.closed) {
                    if (timer) clearInterval(timer);
                    // Removemos apenas os eventos de mensagem, pois pode ser que storage venha depois
                    // Mas para segurança, se fechou, cancelamos o estado de "conectando"
                    // Mas damos um delay para garantir
                    setTimeout(() => {
                        window.removeEventListener('message', customMessageHandler);
                        window.removeEventListener('storage', storageHandler);
                        setIsConnecting(false);
                    }, 2000);
                }
            }, 1000);

        } catch (err) {
            console.error('Error initiating auth:', err);
            setIsConnecting(false);
        }
    };
    const handleDisconnect = async () => {
        if (confirm('Tem certeza que deseja desconectar o Kommo CRM?')) {
            const success = await disconnect();
            if (success) {
                alert('Kommo CRM desconectado com sucesso!');
            }
        }
    };

    const handleTest = async () => {
        setIsTesting(true);
        await reload();
        setIsTesting(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Integração com CRM</h2>
                <p className="text-muted-foreground">
                    Conecte seu CRM para sincronizar leads automaticamente
                </p>
            </div>

            {/* Kommo Integration Card */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Kommo Logo Placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            K
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-1">Kommo CRM</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Sincronize seus leads automaticamente para o Kommo
                            </p>

                            {/* Connection Status */}
                            <div className="flex items-center gap-2">
                                {isConnected ? (
                                    <>
                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Conectado
                                        </Badge>
                                        {integration?.last_sync_at && (
                                            <span className="text-xs text-muted-foreground">
                                                Última sinc: {new Date(integration.last_sync_at).toLocaleString('pt-BR')}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <Badge variant="secondary" className="bg-gray-200">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Não conectado
                                    </Badge>
                                )}
                            </div>

                            {error && (
                                <div className="mt-2 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {isConnected ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTest}
                                    disabled={isTesting}
                                >
                                    {isTesting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Testar Conexão
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDisconnect}
                                >
                                    Desconectar
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleConnect}
                                disabled={isConnecting}
                            >
                                {isConnecting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                )}
                                {isConnecting ? 'Conectando...' : 'Conectar Kommo'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Box */}
                {!isConnected && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-900">
                            <strong>📋 Como conectar:</strong>
                            <ol className="mt-2 ml-4 space-y-1 list-decimal">
                                <li>Clique no botão "Conectar Kommo" acima</li>
                                <li>Faça login na sua conta Kommo e autorize o acesso</li>
                                <li>Após a conexão, os leads serão sincronizados automaticamente</li>
                            </ol>
                        </div>
                    </div>
                )}

                {/* Connection Details */}
                {isConnected && integration && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-900">
                            <strong>✅ Integração ativa</strong>
                            <br />
                            <span className="text-xs text-green-700 mt-1 block">
                                Conectado desde: {new Date(integration.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </p>
                    </div>
                )}
            </Card>

            {/* Coming Soon Integrations */}
            <Card className="p-6 opacity-60">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        H
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">HubSpot CRM</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Integração com HubSpot (Em breve)
                        </p>
                        <Badge variant="secondary">Em breve</Badge>
                    </div>
                </div>
            </Card>

            <Card className="p-6 opacity-60">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        RD
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">RD Station</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Integração com RD Station (Em breve)
                        </p>
                        <Badge variant="secondary">Em breve</Badge>
                    </div>
                </div>
            </Card>
        </div>
    );
}
