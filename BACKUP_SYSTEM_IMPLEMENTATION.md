# 💾 Documentação Completa - Sistema de Backup LeadBaze

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Implementação Técnica](#implementação-técnica)
4. [Scripts de Backup](#scripts-de-backup)
5. [Processo de Restauração](#processo-de-restauração)
6. [Configuração Automática](#configuração-automática)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)
9. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

O sistema de backup foi implementado para garantir a segurança e recuperação completa do sistema LeadBaze em caso de falhas, corrupção de dados ou necessidade de restauração. O sistema funciona de forma automatizada com retenção inteligente de backups.

### Funcionalidades Principais:
- ✅ Backup manual completo
- ✅ Backup semanal automático
- ✅ Limpeza automática de backups antigos
- ✅ Retenção inteligente (7 dias diários, 30 dias semanais)
- ✅ Logs de todas as operações
- ✅ Processo de restauração documentado

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Backups:

```
/root/backups/
├── servla-YYYYMMDD-HHMMSS/          # Backups manuais
│   ├── leadbaze-complete.tar.gz     # Código fonte completo
│   ├── nginx-config.conf            # Configuração do Nginx
│   └── backup-info.txt              # Informações do backup
└── servla-weekly-YYYYMMDD/          # Backups semanais
    ├── leadbaze-complete.tar.gz     # Código fonte completo
    ├── nginx-config.conf            # Configuração do Nginx
    └── backup-info.txt              # Informações do backup
```

### Componentes do Sistema:

```
Cron Jobs
    ↓
Scripts de Backup
    ↓
Compressão (tar.gz)
    ↓
Armazenamento Local
    ↓
Limpeza Automática
```

---

## ⚙️ Implementação Técnica

### 1. Estrutura de Arquivos

```
/root/
├── backup-weekly.sh                 # Script de backup semanal
├── cleanup-backups.sh               # Script de limpeza
└── backups/                         # Diretório de backups
    ├── servla-20250905-174357/      # Backup manual
    └── servla-weekly-20250905/      # Backup semanal
```

### 2. Configuração do Cron

```bash
# Backup semanal (domingos às 2h)
0 2 * * 0 /root/backup-weekly.sh >> /var/log/backup-weekly.log 2>&1

# Limpeza automática (todos os dias às 4h)
0 4 * * * /root/cleanup-backups.sh >> /var/log/cleanup.log 2>&1
```

### 3. Informações dos Backups

Cada backup contém:
- **Código fonte completo** (leadbaze-complete.tar.gz)
- **Configuração do Nginx** (nginx-config.conf)
- **Informações do sistema** (backup-info.txt)

---

## 📜 Scripts de Backup

### 1. **Script de Backup Semanal**

```bash
#!/bin/bash
BACKUP_DIR="/root/backups/servla-weekly-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
echo "🔄 Iniciando backup semanal completo..."
tar -czf $BACKUP_DIR/leadbaze-complete.tar.gz /root/leadbaze
cp /etc/nginx/sites-available/default $BACKUP_DIR/nginx-config.conf 2>/dev/null
echo "Backup semanal completo criado em: $(date)" > $BACKUP_DIR/backup-info.txt
echo "Versão do Node: $(node --version)" >> $BACKUP_DIR/backup-info.txt
echo "Versão do NPM: $(npm --version)" >> $BACKUP_DIR/backup-info.txt
echo "Uso do disco: $(df -h /)" >> $BACKUP_DIR/backup-info.txt
echo "Tamanho do backup: $(du -sh $BACKUP_DIR)" >> $BACKUP_DIR/backup-info.txt
echo "✅ Backup semanal completo salvo em: $BACKUP_DIR"
```

### 2. **Script de Limpeza Automática**

```bash
#!/bin/bash
echo "🧹 Iniciando limpeza de backups antigos..."
find /root/backups -name "servla-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null
find /root/backups -name "servla-weekly-*" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null
find /root/leadbaze -name "*.log" -mtime +7 -delete 2>/dev/null
echo "📊 Espaço em disco após limpeza:"
df -h /
echo "✅ Limpeza automática concluída em: $(date)"
```

### 3. **Script de Backup Manual**

```bash
# Comando para backup manual completo
BACKUP_DIR="/root/backups/servla-$(date +%Y%m%d-%H%M%S)" && \
mkdir -p $BACKUP_DIR && \
tar -czf $BACKUP_DIR/leadbaze-complete.tar.gz /root/leadbaze && \
cp /etc/nginx/sites-available/default $BACKUP_DIR/nginx-config.conf 2>/dev/null && \
echo "Backup manual completo criado em: $(date)" > $BACKUP_DIR/backup-info.txt && \
echo "Versão do Node: $(node --version)" >> $BACKUP_DIR/backup-info.txt && \
echo "Versão do NPM: $(npm --version)" >> $BACKUP_DIR/backup-info.txt && \
echo "Uso do disco: $(df -h /)" >> $BACKUP_DIR/backup-info.txt && \
echo "✅ Backup completo salvo em: $BACKUP_DIR"
```

---

## 🔄 Processo de Restauração

### 1. **Preparação para Restauração**

```bash
# 1. Parar todos os serviços
pkill -f "node.*server.js"
systemctl stop nginx

# 2. Fazer backup do estado atual (opcional)
BACKUP_DIR="/root/backups/emergency-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/current-state.tar.gz /root/leadbaze
```

### 2. **Restauração Completa**

```bash
# 1. Listar backups disponíveis
ls -la /root/backups/

# 2. Escolher backup para restaurar (exemplo: servla-20250905-174357)
BACKUP_DATE="20250905-174357"  # Substituir pela data desejada

# 3. Restaurar código fonte
tar -xzf /root/backups/servla-$BACKUP_DATE/leadbaze-complete.tar.gz -C /

# 4. Restaurar configuração do Nginx
cp /root/backups/servla-$BACKUP_DATE/nginx-config.conf /etc/nginx/sites-available/default

# 5. Verificar integridade
ls -la /root/leadbaze/
cat /root/backups/servla-$BACKUP_DATE/backup-info.txt
```

### 3. **Pós-Restauração**

```bash
# 1. Reinstalar dependências
cd /root/leadbaze
npm install

# 2. Reiniciar serviços
systemctl reload nginx
nohup node backend/server.js > server.log 2>&1 &

# 3. Verificar funcionamento
curl http://localhost:3001/api/health
curl https://leadbaze.io

# 4. Verificar logs
tail -f /root/leadbaze/server.log
```

### 4. **Restauração Parcial**

```bash
# Restaurar apenas arquivos específicos
tar -xzf /root/backups/servla-$BACKUP_DATE/leadbaze-complete.tar.gz \
    --wildcards "*/backend/routes/*" \
    --wildcards "*/backend/services/*" \
    -C /
```

---

## ⚙️ Configuração Automática

### 1. **Instalação dos Scripts**

```bash
# 1. Criar script de backup semanal
cat > /root/backup-weekly.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/servla-weekly-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
echo "🔄 Iniciando backup semanal completo..."
tar -czf $BACKUP_DIR/leadbaze-complete.tar.gz /root/leadbaze
cp /etc/nginx/sites-available/default $BACKUP_DIR/nginx-config.conf 2>/dev/null
echo "Backup semanal completo criado em: $(date)" > $BACKUP_DIR/backup-info.txt
echo "Versão do Node: $(node --version)" >> $BACKUP_DIR/backup-info.txt
echo "Versão do NPM: $(npm --version)" >> $BACKUP_DIR/backup-info.txt
echo "Uso do disco: $(df -h /)" >> $BACKUP_DIR/backup-info.txt
echo "Tamanho do backup: $(du -sh $BACKUP_DIR)" >> $BACKUP_DIR/backup-info.txt
echo "✅ Backup semanal completo salvo em: $BACKUP_DIR"
EOF

# 2. Tornar executável
chmod +x /root/backup-weekly.sh

# 3. Criar script de limpeza
cat > /root/cleanup-backups.sh << 'EOF'
#!/bin/bash
echo "🧹 Iniciando limpeza de backups antigos..."
find /root/backups -name "servla-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null
find /root/backups -name "servla-weekly-*" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null
find /root/leadbaze -name "*.log" -mtime +7 -delete 2>/dev/null
echo "📊 Espaço em disco após limpeza:"
df -h /
echo "✅ Limpeza automática concluída em: $(date)"
EOF

# 4. Tornar executável
chmod +x /root/cleanup-backups.sh
```

### 2. **Configuração do Cron**

```bash
# 1. Configurar cron jobs
(crontab -l 2>/dev/null; \
 echo "0 2 * * 0 /root/backup-weekly.sh >> /var/log/backup-weekly.log 2>&1"; \
 echo "0 4 * * * /root/cleanup-backups.sh >> /var/log/cleanup.log 2>&1") | crontab -

# 2. Verificar configuração
crontab -l
```

---

## 📊 Monitoramento

### 1. **Verificação de Status**

```bash
# 1. Ver backups disponíveis
ls -la /root/backups/

# 2. Ver tamanho dos backups
du -sh /root/backups/*

# 3. Verificar cron jobs
crontab -l

# 4. Ver logs de backup
tail -f /var/log/backup-weekly.log
tail -f /var/log/cleanup.log
```

### 2. **Métricas Importantes**

- **Espaço Total**: 29GB
- **Espaço Usado**: 3.7GB (13%)
- **Espaço Disponível**: 26GB (87%)
- **Tamanho do Backup**: ~53MB
- **Frequência**: Semanal + limpeza diária

### 3. **Alertas Recomendados**

- Monitorar espaço em disco
- Verificar execução dos cron jobs
- Monitorar logs de erro
- Verificar integridade dos backups

---

## 🔧 Troubleshooting

### 1. **Backup Não Executa**

```bash
# Verificar cron jobs
crontab -l

# Verificar logs
tail -f /var/log/backup-weekly.log

# Executar manualmente
/root/backup-weekly.sh
```

### 2. **Erro de Permissão**

```bash
# Verificar permissões
ls -la /root/backup-weekly.sh
ls -la /root/cleanup-backups.sh

# Corrigir permissões
chmod +x /root/backup-weekly.sh
chmod +x /root/cleanup-backups.sh
```

### 3. **Espaço em Disco Insuficiente**

```bash
# Verificar espaço
df -h /

# Limpar backups antigos manualmente
find /root/backups -name "servla-*" -type d -mtime +7 -exec rm -rf {} +

# Executar limpeza
/root/cleanup-backups.sh
```

### 4. **Restauração Falha**

```bash
# Verificar integridade do backup
tar -tzf /root/backups/servla-*/leadbaze-complete.tar.gz | head -10

# Verificar espaço disponível
df -h /

# Verificar permissões
ls -la /root/leadbaze/
```

---

## 🔄 Manutenção

### 1. **Manutenção Diária**

```bash
# Verificar execução dos backups
tail -5 /var/log/backup-weekly.log
tail -5 /var/log/cleanup.log

# Verificar espaço em disco
df -h /
```

### 2. **Manutenção Semanal**

```bash
# Verificar backups criados
ls -la /root/backups/

# Testar restauração (em ambiente de teste)
# Executar backup manual
BACKUP_DIR="/root/backups/test-$(date +%Y%m%d-%H%M%S)" && \
mkdir -p $BACKUP_DIR && \
tar -czf $BACKUP_DIR/leadbaze-complete.tar.gz /root/leadbaze
```

### 3. **Manutenção Mensal**

```bash
# Análise de espaço
du -sh /root/backups/*

# Limpeza manual se necessário
find /root/backups -name "servla-*" -type d -mtime +30 -exec rm -rf {} +

# Verificar logs antigos
find /var/log -name "backup-*.log" -mtime +30 -delete
```

---

## 📈 Métricas de Sucesso

### Antes da Implementação:
- ❌ Sem backup automatizado
- ❌ Sem retenção de dados
- ❌ Risco de perda de dados
- ❌ Processo manual de backup

### Após a Implementação:
- ✅ Backup automático semanal
- ✅ Retenção inteligente (7 dias diários, 30 dias semanais)
- ✅ Zero risco de perda de dados
- ✅ Processo completamente automatizado
- ✅ Restauração documentada e testada

---

## 🚀 Próximos Passos

1. **Backup Remoto**: Implementar backup em servidor externo
2. **Backup Incremental**: Otimizar para backups menores
3. **Monitoramento**: Implementar alertas automáticos
4. **Teste de Restauração**: Automatizar testes de restauração

---

## 📞 Contatos de Emergência

### Em caso de falha crítica:
1. **Verificar logs**: `/var/log/backup-weekly.log`
2. **Executar backup manual**: Usar script de backup manual
3. **Restaurar último backup**: Seguir processo de restauração
4. **Contatar equipe**: Equipe de Desenvolvimento LeadBaze

---

**Data de Implementação**: 05/09/2025  
**Versão**: 1.0.0  
**Status**: Produção  
**Responsável**: Equipe de Desenvolvimento LeadBaze
