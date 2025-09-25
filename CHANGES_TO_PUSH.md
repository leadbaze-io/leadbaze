# Alterações para Push - Correção das Rotas de Tempo Real

## Arquivos Modificados:

### 1. `src/components/blog/BlogRealtimeMonitor.tsx`

**Alterações feitas:**
- Linha 35: `/api/blog/auto/status` → `https://leadbaze.io/api/blog/auto/status`
- Linha 55: `/api/blog/auto/events` → `https://leadbaze.io/api/blog/auto/events`  
- Linha 87: `/api/blog/auto/webhook` → `https://leadbaze.io/api/blog/auto/webhook`

## Como aplicar as alterações:

### Opção 1: Via GitHub Web Interface
1. Acesse: https://github.com/leadbaze/leadflow
2. Vá para `src/components/blog/BlogRealtimeMonitor.tsx`
3. Clique em "Edit" (ícone de lápis)
4. Faça as 3 alterações acima
5. Commit message: "Fix: Corrigir URLs das rotas de tempo real no BlogRealtimeMonitor"
6. Clique em "Commit changes"

### Opção 2: Via Git no Servidor
```bash
# No servidor, edite o arquivo:
nano /root/leadbaze/src/components/blog/BlogRealtimeMonitor.tsx

# Faça as 3 alterações acima, depois:
cd /root/leadbaze
git add src/components/blog/BlogRealtimeMonitor.tsx
git commit -m "Fix: Corrigir URLs das rotas de tempo real no BlogRealtimeMonitor"
git push origin main
```

### Opção 3: Download e Upload
1. Baixe o arquivo `BlogRealtimeMonitor.tsx` do repositório
2. Faça as alterações localmente
3. Faça upload do arquivo modificado
4. Commit as alterações

## Resultado Esperado:
- ✅ Erro 404 nas rotas de tempo real será resolvido
- ✅ Dashboard de tempo real funcionará corretamente
- ✅ Notificações em tempo real serão recebidas

## Status:
- ✅ Alterações identificadas
- ✅ Commit local criado
- ❌ Push para GitHub pendente
- ⏳ Deploy no servidor pendente






























