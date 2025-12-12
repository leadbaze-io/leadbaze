import { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, Users as UsersIcon, AlertCircle, History, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../lib/apiClient';

interface User {
    id: string; // Profile ID
    user_id: string; // Auth User ID (for history)
    full_name: string;
    email: string;
    subscription_status: string;
    plan_name: string;
    subscription_start: string | null;
    subscription_end: string | null;
    bonus_leads: number;
    bonus_leads_used: number;
    leads_remaining: number;
    leads_used: number;
}

interface HistoryEvent {
    id: string;
    type: 'credit' | 'debit';
    source: string;
    amount: number;
    description: string;
    date: string;
    meta: any;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [loading, setLoading] = useState(false);
    const [isAddLeadsOpen, setIsAddLeadsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [leadsAmount, setLeadsAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Bulk Actions State
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<HistoryEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleAllSelection = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiClient.get('/api/admin/users');
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (userId: string) => {
        setLoadingHistory(true);
        setHistoryData([]);
        try {
            const data = await apiClient.get(`/api/admin/users/${userId}/history`);
            setHistoryData(data.history || []);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const openHistory = (user: User) => {
        setSelectedUser(user);
        setIsHistoryOpen(true);
        fetchHistory(user.user_id);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user => {
            const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'active'
                    ? user.subscription_status === 'active'
                    : user.subscription_status !== 'active';

            return matchesSearch && matchesStatus;
        });
        setFilteredUsers(filtered);
    }, [searchTerm, statusFilter, users]);

    const handleAddLeads = async () => {
        if ((!selectedUser && selectedUsers.length === 0) || !leadsAmount) return;

        setSubmitting(true);
        try {
            if (selectedUsers.length > 0) {
                // Bulk Add
                await apiClient.post('/api/admin/users/bulk-add-leads', {
                    userIds: selectedUsers,
                    amount: parseInt(leadsAmount)
                });
                setSelectedUsers([]);
            } else if (selectedUser) {
                // Single User Add - use user_id (auth ID), not id (profile ID)
                await apiClient.post(`/api/admin/users/${selectedUser.user_id}/add-leads`, {
                    amount: parseInt(leadsAmount)
                });
            }

            // Refresh users
            await fetchUsers();

            // Close dialog and reset
            setIsAddLeadsOpen(false);
            setLeadsAmount('');
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to add leads', error);
            alert('Erro ao adicionar leads. Verifique o console.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ativo
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                Inativo
            </span>
        );
    };

    return (
        <div className="space-y-6 p-6 bg-gray-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Gerenciar Usuários
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
                    </p>
                </div>
                <Button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                    {loading ? 'Carregando...' : 'Atualizar'}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-400">Total de Usuários</CardTitle>
                                <UsersIcon className="w-4 h-4 text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{users.length}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-emerald-500 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-400">Assinaturas Ativas</CardTitle>
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {users.filter(u => u.subscription_status === 'active').length}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters & Search */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-950/50 rounded-lg border border-gray-700">
                                <Checkbox
                                    id="selectAll"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onCheckedChange={toggleAllSelection}
                                    className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label htmlFor="selectAll" className="text-gray-300 text-sm cursor-pointer">
                                    Todos
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 bg-gray-950/50 rounded-lg p-1 border border-gray-700">
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'all' ? 'default' : 'ghost'}
                                    onClick={() => setStatusFilter('all')}
                                    className={statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}
                                >
                                    Todos
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'active' ? 'default' : 'ghost'}
                                    onClick={() => setStatusFilter('active')}
                                    className={statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}
                                >
                                    Ativos
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'inactive' ? 'default' : 'ghost'}
                                    onClick={() => setStatusFilter('inactive')}
                                    className={statusFilter === 'inactive' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}
                                >
                                    Inativos
                                </Button>
                            </div>
                        </div>
                        <div className="relative w-full md:w-auto md:min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-gray-950/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            {
                loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Carregando usuários...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                        <CardContent className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {users.length === 0 ? 'Nenhum usuário encontrado no sistema' : 'Nenhum resultado para esta busca'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id || `user-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 ${selectedUsers.includes(user.id) ? 'ring-2 ring-blue-500 border-transparent' : ''}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 flex items-start gap-4">
                                                <div className="mt-1">
                                                    <Checkbox
                                                        checked={selectedUsers.includes(user.id)}
                                                        onCheckedChange={() => toggleUserSelection(user.id)}
                                                        className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <CardTitle className="text-white text-lg">{user.full_name || 'Sem nome'}</CardTitle>
                                                        {getStatusBadge(user.subscription_status)}
                                                    </div>
                                                    <CardDescription className="text-gray-400 mt-1">{user.email}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openHistory(user)}
                                                    className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                                                >
                                                    <History className="w-4 h-4 mr-1" />
                                                    Histórico
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsAddLeadsOpen(true);
                                                    }}
                                                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Bônus
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Coluna 1: Leads */}
                                            <div className="space-y-4 border-r border-gray-700 pr-6">
                                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Uso de Leads</h4>

                                                {/* Leads de Plano */}
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-blue-400">Leads do Plano ({user.plan_name})</span>
                                                        <span className="text-gray-400">{user.leads_remaining} restantes</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${user.leads_remaining > 0 ? 'bg-blue-500' : 'bg-transparent'}`}
                                                            style={{ width: user.leads_remaining > 0 ? '100%' : '0%' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Leads Bônus */}
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-emerald-400">Leads Bônus</span>
                                                        <span className="text-gray-400">
                                                            {user.bonus_leads - user.bonus_leads_used} de {user.bonus_leads}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${user.bonus_leads > 0 ? 'bg-emerald-500' : 'bg-transparent'}`}
                                                            style={{
                                                                width: `${user.bonus_leads > 0
                                                                    ? ((user.bonus_leads - user.bonus_leads_used) / user.bonus_leads) * 100
                                                                    : 0}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Coluna 2: Detalhes da Assinatura */}
                                            <div className="space-y-4 pl-2">
                                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Detalhes da Assinatura</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Plano Atual</p>
                                                        <p className="text-sm font-bold text-white uppercase tracking-wider">{user.plan_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Status</p>
                                                        <p className="text-sm text-gray-300 capitalize">{user.subscription_status === 'active' ? 'Ativo' : 'Inativo'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Início</p>
                                                        <p className="text-sm text-gray-300">
                                                            {user.subscription_start ? new Date(user.subscription_start).toLocaleDateString('pt-BR') : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Renovação/Fim</p>
                                                        <p className="text-sm text-gray-300">
                                                            {user.subscription_end ? new Date(user.subscription_end).toLocaleDateString('pt-BR') : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )
            }

            {/* Add Leads Dialog */}
            <Dialog open={isAddLeadsOpen} onOpenChange={(open: boolean) => {
                setIsAddLeadsOpen(open);
                if (!open) {
                    setSelectedUser(null);
                    setLeadsAmount('');
                }
            }}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {selectedUsers.length > 0
                                ? `Adicionar Leads em Massa (${selectedUsers.length} usuários)`
                                : 'Adicionar Leads Bônus'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {selectedUsers.length > 0
                                ? 'Os leads serão adicionados para todos os usuários selecionados.'
                                : `Adicione leads bônus para ${selectedUser?.full_name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="leads" className="text-gray-300">Quantidade de Leads</Label>
                            <Input
                                id="leads"
                                type="number"
                                min="1"
                                placeholder="Ex: 100"
                                value={leadsAmount}
                                onChange={(e) => setLeadsAmount(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white mt-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddLeadsOpen(false)}
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddLeads}
                            disabled={!leadsAmount || submitting}
                            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
                        >
                            {submitting ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* History Sheet */}
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetContent className="bg-gray-950 border-gray-800 text-white w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-white">Histórico de Uso</SheetTitle>
                        <SheetDescription className="text-gray-400">
                            Timeline de atividades para {selectedUser?.full_name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-8 space-y-6">
                        {loadingHistory ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Nenhum registro encontrado.</p>
                            </div>
                        ) : (
                            <div className="relative border-l border-gray-800 ml-3 space-y-8">
                                {historyData.map((item, index) => (
                                    <div key={item.id || `history-${index}`} className="relative pl-8">
                                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 ${item.type === 'credit' ? 'border-emerald-500 bg-emerald-900' : 'border-blue-500 bg-blue-900'}`}></div>
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">
                                                    {new Date(item.date).toLocaleDateString('pt-BR')} às {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={`text-sm font-bold ${item.type === 'credit' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                    {item.type === 'credit' ? '+' : '-'}{item.amount} Leads
                                                </span>
                                            </div>
                                            <p className="text-white font-medium">{item.description}</p>
                                            {item.meta?.reason && (
                                                <p className="text-xs text-gray-500 italic mt-1">{item.meta.reason}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Bulk Actions Floating Bar */}
            <AnimatePresence>
                {selectedUsers.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-6 z-50 text-white w-[90%] max-w-2xl"
                    >
                        <div className="flex items-center gap-4 border-r border-gray-700 pr-6">
                            <span className="font-bold text-lg">{selectedUsers.length}</span>
                            <span className="text-gray-400 text-sm">selecionados</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUsers([])}
                                className="text-gray-500 hover:text-white hover:bg-gray-800 rounded-full h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                            <Button
                                onClick={() => setIsAddLeadsOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Leads
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
