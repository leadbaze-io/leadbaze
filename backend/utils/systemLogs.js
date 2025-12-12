// Armazenamento em memória dos últimos 100 logs do sistema
class SystemLogs {
    constructor() {
        this.logs = [];
        this.MAX_LOGS = 100;
    }

    add(log) {
        // Log structure: { id, timestamp, service, status, message, details }
        const now = new Date();

        // Verifica se o último log é do mesmo serviço e tem o mesmo status
        const lastLogIndex = this.logs.findIndex(l => l.service === log.service);

        // Se encontrou um log anterior do mesmo serviço e é o mais recente (top of the list or close to it)
        // Simplificação: apenas verifica se o log no topo (indice 0 ou próximo) é do mesmo serviço e status
        // Para garantir que a lista representa o estado atual, vamos procurar o registro mais recente deste serviço

        if (lastLogIndex !== -1) {
            const lastLog = this.logs[lastLogIndex];

            // Só atualiza se for o mesmo status (ex: success -> success)
            // Se mudou de status (success -> error), cria novo log para histórico
            if (lastLog.status === log.status) {
                // Atualiza o log existente
                this.logs[lastLogIndex] = {
                    ...lastLog,
                    timestamp: now,
                    message: log.message,
                    details: log.details
                };

                // Move para o topo da lista se não estiver lá
                if (lastLogIndex > 0) {
                    const updatedLog = this.logs.splice(lastLogIndex, 1)[0];
                    this.logs.unshift(updatedLog);
                }
                return;
            }
        }

        const newLog = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: now,
            ...log
        };

        this.logs.unshift(newLog); // Adiciona no início

        // Manter apenas os últimos N logs
        if (this.logs.length > this.MAX_LOGS) {
            this.logs = this.logs.slice(0, this.MAX_LOGS);
        }
    }

    get() {
        return this.logs;
    }
}

// Singleton instance
const systemLogs = new SystemLogs();
module.exports = systemLogs;
