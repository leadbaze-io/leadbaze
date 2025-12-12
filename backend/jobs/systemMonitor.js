const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const systemLogs = require('../utils/systemLogs');

class SystemMonitor {
    constructor() {
        this.lastAlertSent = {};
        this.alertCooldown = 30 * 60 * 1000; // 30 minutos entre alertas do mesmo serviço

        // Configuração de email (usa as mesmas configs do SMTP do projeto)
        this.emailConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        };

        this.adminEmail = 'creaty12345@gmail.com';
        this.adminPhone = '5531983323121'; // Formato para WhatsApp
    }

    async checkWebsite() {
        const start = Date.now();
        try {
            const response = await axios.get('https://leadbaze.io', {
                timeout: 10000,
                validateStatus: (status) => status < 500
            });
            const latency = Date.now() - start;

            return {
                service: 'Website',
                status: response.status < 400 ? 'success' : 'warning',
                message: response.status < 400
                    ? `Website Operacional (Status ${response.status}) - Latência: ${latency}ms`
                    : `Website com instabilidade (Status ${response.status})`,
            };
        } catch (error) {
            return {
                service: 'Website',
                status: 'error', // Changed from offline to error to match frontend
                message: `Website inacessível: ${error.message}`,
            };
        }
    }

    async checkEvolutionAPI() {
        try {
            const evolutionUrl = process.env.EVOLUTION_API_URL;
            const evolutionKey = process.env.EVOLUTION_API_KEY;

            if (!evolutionUrl || !evolutionKey) {
                return {
                    service: 'Evolution API',
                    status: 'warning',
                    message: 'API não configurada nas variáveis de ambiente',
                };
            }

            const response = await axios.get(`${evolutionUrl}/instance/fetchInstances`, {
                headers: { 'apikey': evolutionKey },
                timeout: 5000
            });

            const instanceCount = response.data?.length || 0;
            return {
                service: 'Evolution API',
                status: 'success',
                message: `Evolution API Online`,
                details: `${instanceCount} instâncias do WhatsApp ativas e monitoradas`
            };
        } catch (error) {
            return {
                service: 'Evolution API',
                status: 'error',
                message: `Evolution API indisponível: ${error.message}`,
            };
        }
    }

    async sendEmailAlert(service, message) {
        try {
            if (!this.emailConfig.host || !this.emailConfig.auth.user) {
                console.warn('⚠️ Configuração de email não disponível para enviar alerta');
                return;
            }

            const transporter = nodemailer.createTransport(this.emailConfig);

            await transporter.sendMail({
                from: this.emailConfig.auth.user,
                to: this.adminEmail,
                subject: `🚨 ALERTA: ${service} está offline!`,
                html: `
          <h2>Alerta do Sistema LeadFlow</h2>
          <p><strong>Serviço:</strong> ${service}</p>
          <p><strong>Status:</strong> OFFLINE</p>
          <p><strong>Mensagem:</strong> ${message}</p>
          <p><strong>Horário:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <hr>
          <p>Por favor, verifique o sistema imediatamente.</p>
        `,
            });

            console.log(`✅ Email de alerta enviado para ${this.adminEmail}`);
        } catch (error) {
            console.error('❌ Erro ao enviar email de alerta:', error.message);
        }
    }

    canSendAlert(service) {
        const lastAlert = this.lastAlertSent[service];
        if (!lastAlert) return true;

        const timeSinceLastAlert = Date.now() - lastAlert;
        return timeSinceLastAlert > this.alertCooldown;
    }

    async performCheck() {
        console.log('🔍 [System Monitor] Iniciando verificação do sistema...');

        const checks = await Promise.all([
            this.checkWebsite(),
            this.checkEvolutionAPI(),
        ]);

        for (const check of checks) {
            // Save to memory logs
            systemLogs.add(check);

            if (check.status === 'error') {
                console.error(`❌ [System Monitor] ${check.service}: ${check.message}`);

                if (this.canSendAlert(check.service)) {
                    await this.sendEmailAlert(check.service, check.message);
                    this.lastAlertSent[check.service] = Date.now();
                } else {
                    console.log(`⏳ [System Monitor] Cooldown ativo para ${check.service}, alerta não enviado`);
                }
            } else {
                console.log(`✅ [System Monitor] ${check.service}: ${check.message}`);
            }
        }
    }

    start() {
        console.log('🚀 [System Monitor] Iniciando monitoramento do sistema...');
        console.log('📧 [System Monitor] Alertas serão enviados para:', this.adminEmail);

        // Executar verificação imediatamente
        this.performCheck();

        // Agendar verificações a cada 5 minutos
        cron.schedule('*/5 * * * *', () => {
            this.performCheck();
        });

        console.log('✅ [System Monitor] Monitoramento ativo (verificação a cada 5 minutos)');
    }
}

module.exports = SystemMonitor;
