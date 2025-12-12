import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, RefreshCw, Server, Smartphone, Globe, TrendingUp, Users, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';

interface SystemStatus {
    service: string;
    status: 'online' | 'offline' | 'checking';
    message: string;
    lastCheck: Date;
}

interface SystemStats {
    totalUsers: number;
    activeSubscriptions: number;
    totalLeadsGenerated: number;
    systemUptime: string;
}

export default function AdminDashboard() {
    const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
        { service: 'Website', status: 'checking', message: 'Verificando...', lastCheck: new Date() },
        { service: 'API Backend', status: 'checking', message: 'Verificando...', lastCheck: new Date() },
        { service: 'Evolution API', status: 'checking', message: 'Verificando...', lastCheck: new Date() },
    ]);
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalLeadsGenerated: 0,
        systemUptime: '99.9%'
    });
    const [loading, setLoading] = useState(false);

    const checkSystemStatus = async () => {
        setLoading(true);
        try {
            const { apiClient } = await import('../../lib/apiClient');

            // Parallel fetch for status and stats
            const [statusRes, statsRes] = await Promise.all([
                apiClient.get('/api/admin/system-status'),
                apiClient.get('/api/admin/stats')
            ]);

            setSystemStatus(statusRes.status || []);
            setStats(statsRes); // API returns exact match for SystemStats interface

        } catch (error) {
            console.error('Failed to check system status/stats', error);
            // Fallback for status
            setSystemStatus(prev => prev.map(s => ({
                ...s,
                status: 'offline' as const,
                message: 'Erro ao conectar @ backend'
            })));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSystemStatus();
    }, []);

    const getStatusIcon = (status: SystemStatus['status']) => {
        if (status === 'online') return <CheckCircle className="w-5 h-5 text-emerald-400" />;
        if (status === 'offline') return <AlertCircle className="w-5 h-5 text-red-400" />;
        return <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />;
    };

    const getServiceIcon = (service: string) => {
        if (service.includes('Website')) return <Globe className="w-6 h-6 text-blue-400" />;
        if (service.includes('API')) return <Server className="w-6 h-6 text-purple-400" />;
        if (service.includes('Evolution')) return <Smartphone className="w-6 h-6 text-green-400" />;
        return <Activity className="w-6 h-6 text-gray-400" />;
    };

    const getStatusBorderColor = (status: SystemStatus['status']) => {
        if (status === 'online') return 'border-l-emerald-500';
        if (status === 'offline') return 'border-l-red-500';
        return 'border-l-yellow-500';
    };

    return (
        <div className="space-y-6 p-6 bg-gray-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Painel Administrativo
                    </h1>
                    <p className="text-gray-400 mt-1">Visão completa do sistema LeadFlow</p>
                </div>
                <Button
                    onClick={checkSystemStatus}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-emerald-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-400">Total de Usuários</CardTitle>
                                <Users className="w-4 h-4 text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                            <p className="text-xs text-emerald-400 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12% este mês
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-400">Assinaturas Ativas</CardTitle>
                                <Activity className="w-4 h-4 text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.activeSubscriptions}</div>
                            <p className="text-xs text-blue-400 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +8% este mês
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-400">Leads Gerados</CardTitle>
                                <Database className="w-4 h-4 text-purple-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalLeadsGenerated.toLocaleString()}</div>
                            <p className="text-xs text-purple-400 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +24% este mês
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-cyan-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-400">Uptime do Sistema</CardTitle>
                                <CheckCircle className="w-4 h-4 text-cyan-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.systemUptime}</div>
                            <p className="text-xs text-cyan-400 mt-1">Últimos 30 dias</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* System Status */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Status dos Serviços</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {systemStatus.map((status, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 border-l-4 ${getStatusBorderColor(status.status)} border-t-0 border-r-0 border-b-0 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getServiceIcon(status.service)}
                                            <CardTitle className="text-lg text-white">{status.service}</CardTitle>
                                        </div>
                                        {getStatusIcon(status.status)}
                                    </div>
                                    <CardDescription className="text-gray-400">
                                        {status.status === 'online' ? '✅ Operando normalmente' :
                                            status.status === 'offline' ? '❌ Offline' : '🔄 Verificando...'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-400">{status.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Última verificação: {new Date(status.lastCheck).toLocaleTimeString('pt-BR')}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Ações Rápidas</CardTitle>
                    <CardDescription className="text-gray-400">Gerenciar usuários e configurações do sistema</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                        variant="outline"
                        onClick={() => window.location.href = '/admin/users'}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Gerenciar Usuários
                    </Button>
                    <Button
                        className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                        variant="outline"
                        onClick={() => window.location.href = '/admin/monitor'}
                    >
                        <Activity className="w-4 h-4 mr-2" />
                        Ver Logs de Monitoramento
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
