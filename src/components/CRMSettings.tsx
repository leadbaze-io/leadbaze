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
            const authWindow = window.open(
                `https://www.kommo.com/oauth?client_id=${clientId}&mode=popup`,
                'Kommo Connect',
                `width=${width},height=${height},top=${top},left=${left}`
            );

            // Listen for messages from the popup (Kommo postMessage)
            const messageHandler = async (event: MessageEvent) => {
                // Verify origin if possible

                console.log('PostMessage received:', event.data);

                // Kommo sends data: { code: "...", client_id: "...", ... }
                if (event.data && event.data.code) {
                    // We got the code!
                    authWindow?.close();
                    window.removeEventListener('message', messageHandler);

                    // 2. Send code to backend to exchange for tokens
                    try {
                        // Ask user for subdomain if it's not in the event data (Kommo usually doesn't send subdomain in popup mode callback unless redirect)
                        // For now, we assume the user's config env has it, OR we prompt.
                        // But let's try to connect just with the code.

                        // Prompt for subdomain (optional but good for specific accounts)
                        const subdomain = prompt("Por favor, digite seu subdomínio Kommo (ex: nomedasuaempresa):");
                        if (!subdomain) {
                            alert("Subdomínio é obrigatório para conectar.");
                            setIsConnecting(false);
                            authWindow?.close();
                            return;
                        }

                        await connect(event.data.code, { subdomain });
                        alert('Conectado com sucesso!');
                        reload();
                    } catch (connErr) {
                        console.error('Backend connection error:', connErr);
                        alert('Erro ao conectar com o backend: ' + (connErr instanceof Error ? connErr.message : String(connErr)));
                    } finally {
                        setIsConnecting(false);
                    }
                }
            };

            window.addEventListener('message', messageHandler);

            // Check if window closed without auth
            const timer = setInterval(() => {
                if (authWindow?.closed) {
                    clearInterval(timer);
                    window.removeEventListener('message', messageHandler);
                    setIsConnecting(false);
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
