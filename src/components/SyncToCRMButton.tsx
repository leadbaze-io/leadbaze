import { useState } from 'react';
import { useCRMIntegration } from '../hooks/useCRMIntegration';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Loader2, Upload, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SyncToCRMButtonProps {
    leadListId: string;
    leadListName?: string;
    totalLeads?: number;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export function SyncToCRMButton({
    leadListId,
    leadListName = 'Lista',
    totalLeads = 0,
    variant = 'default',
    size = 'default',
    className = ''
}: SyncToCRMButtonProps) {
    const { isConnected, syncLeads } = useCRMIntegration('kommo');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{
        success: number;
        failed: number;
        errors: Array<{ lead_name: string; error_message: string }>;
    } | null>(null);
    const { toast } = useToast();

    const handleSync = async () => {
        console.log('🎯 [SyncButton] handleSync triggered for leadListId:', leadListId);
        try {
            setIsSyncing(true);
            setSyncResult(null);

            console.log('📞 [SyncButton] Calling syncLeads...');
            const result = await syncLeads(leadListId);
            console.log('✅ [SyncButton] syncLeads returned:', result);

            setSyncResult({
                success: result.success_count,
                failed: result.failed_count,
                errors: result.errors
            });

            if (result.failed_count === 0) {
                toast({
                    title: '🎉 Sincronização concluída!',
                    description: `${result.success_count} leads enviados para o Kommo com sucesso.`,
                    variant: 'success'
                });

                // Close dialog after 2 seconds on full success
                setTimeout(() => setIsDialogOpen(false), 2000);
            } else {
                toast({
                    title: '⚠️ Sincronização parcial',
                    description: `${result.success_count} sucessos, ${result.failed_count} falhas.`,
                    variant: 'default'
                });
            }
        } catch (error) {
            console.error('❌ [SyncButton] Error in handleSync:', error);
            toast({
                title: '❌ Erro na sincronização',
                description: error instanceof Error ? error.message : 'Falha ao sincronizar leads',
                variant: 'destructive'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    // Se não estiver conectado, mostrar botão que redireciona para configurações
    if (!isConnected) {
        return (
            <Button
                variant="outline"
                size={size}
                className={`${className} opacity-75 hover:opacity-100 bg-white dark:bg-transparent border-dashed`}
                onClick={() => window.open('/settings/crm', '_blank')}
                title="Clique para configurar a integração CRM"
            >
                <Upload className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-500">Conectar CRM</span>
            </Button>
        );
    }

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={() => setIsDialogOpen(true)}
                disabled={isSyncing}
            >
                <Upload className="h-4 w-4 mr-2" />
                Enviar para CRM
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar leads para Kommo CRM</DialogTitle>
                        <DialogDescription>
                            {syncResult ? (
                                'Resultado da sincronização'
                            ) : (
                                `Sincronizar ${totalLeads} lead${totalLeads !== 1 ? 's' : ''} de "${leadListName}" para o Kommo?`
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {!syncResult ? (
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Os leads serão criados como novos contatos no Kommo CRM. Contatos duplicados serão evitados.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <p className="text-sm text-blue-900">
                                    Esta ação enviará {totalLeads} lead{totalLeads !== 1 ? 's' : ''} para sua conta Kommo conectada.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-3">
                            {/* Success Count */}
                            {syncResult.success > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <p className="text-sm text-green-900">
                                        <strong>{syncResult.success}</strong> lead{syncResult.success !== 1 ? 's' : ''} sincronizado{syncResult.success !== 1 ? 's' : ''} com sucesso
                                    </p>
                                </div>
                            )}

                            {/* Failed Count */}
                            {syncResult.failed > 0 && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-red-900 mb-2">
                                            <strong>{syncResult.failed}</strong> lead{syncResult.failed !== 1 ? 's' : ''} falhou{syncResult.failed !== 1 ? 'ram' : 'u'}
                                        </p>
                                        {syncResult.errors.length > 0 && (
                                            <div className="text-xs text-red-800 space-y-1">
                                                {syncResult.errors.slice(0, 3).map((err, idx) => (
                                                    <div key={idx}>
                                                        • {err.lead_name}: {err.error_message}
                                                    </div>
                                                ))}
                                                {syncResult.errors.length > 3 && (
                                                    <div className="italic">
                                                        + {syncResult.errors.length - 3} erros adicionais
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {!syncResult ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSyncing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                >
                                    {isSyncing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sincronizando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Confirmar Envio
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsDialogOpen(false)}>
                                Fechar
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
