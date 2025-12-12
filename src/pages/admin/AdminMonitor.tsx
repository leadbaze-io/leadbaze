import { useState, useEffect } from 'react';
import { Activity, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

interface MonitorLog {
    id: string;
    timestamp: Date;
    service: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    details?: string;
}

export default function AdminMonitor() {
    const [logs, setLogs] = useState<MonitorLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { apiClient } = await import('../../lib/apiClient');
            const data = await apiClient.get('/api/admin/logs');
            if (data.logs) {
                // Converter strings de data para objetos Date
                const processedLogs = data.logs.map((log: any) => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
                setLogs(processedLogs);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(log => log.status === filter);

    const getStatusColor = (status: MonitorLog['status']) => {
        if (status === 'success') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (status === 'error') return 'text-red-400 bg-red-400/10 border-red-400/20';
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    };

    const getStatusIcon = (status: MonitorLog['status']) => {
        if (status === 'success') return '✅';
        if (status === 'error') return '❌';
        return '⚠️';
    };

    return (
        <div className="space-y-6 p-6 bg-gray-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Logs de Monitoramento
                    </h1>
                    <p className="text-gray-400 mt-1">Histórico completo de verificações do sistema</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-900 rounded-lg p-1 border border-gray-700">
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'default' : 'ghost'}
                            onClick={() => setFilter('all')}
                            className={filter === 'all' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                        >
                            Todos
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'success' ? 'default' : 'ghost'}
                            onClick={() => setFilter('success')}
                            className={filter === 'success' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}
                        >
                            Sucesso
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'error' ? 'default' : 'ghost'}
                            onClick={() => setFilter('error')}
                            className={filter === 'error' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}
                        >
                            Erros
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'warning' ? 'default' : 'ghost'}
                            onClick={() => setFilter('warning')}
                            className={filter === 'warning' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'}
                        >
                            Avisos
                        </Button>
                    </div>
                    <Button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Total de Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{logs.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Verificações OK</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-400">
                            {logs.filter(l => l.status === 'success').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">Problemas Detectados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-400">
                            {logs.filter(l => l.status === 'error' || l.status === 'warning').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Registro de Atividades</CardTitle>
                    <CardDescription className="text-gray-400">
                        {filteredLogs.length} {filteredLogs.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredLogs.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhum log recente encontrado.</p>
                            </div>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg border ${getStatusColor(log.status)} hover:shadow-lg transition-all duration-200`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-2xl">{getStatusIcon(log.status)}</span>
                                                <div>
                                                    <h3 className="font-semibold text-white">{log.service}</h3>
                                                    <p className="text-sm text-gray-400 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {log.timestamp.toLocaleString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 ml-11">{log.message}</p>
                                            {log.details && (
                                                <p className="text-sm text-gray-500 ml-11 mt-1">{log.details}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
