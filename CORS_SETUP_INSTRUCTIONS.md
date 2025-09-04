# 🔧 Configuração de CORS para LeadBaze

## 🚨 Problema Atual

O backend está retornando erro de CORS ao tentar conectar do domínio `https://leadbaze.io`:

```
Access to fetch at 'https://leadbaze-backend.onrender.com/api/create-instance-and-qrcode' 
from origin 'https://leadbaze.io' has been blocked by CORS policy
```

## ✅ Solução

### 1. Atualizar Variável de Ambiente no Render

No painel do Render, para o serviço `leadbaze-backend`:

1. Acesse: https://dashboard.render.com/
2. Selecione o serviço `leadbaze-backend`
3. Vá em **Environment**
4. Atualize a variável `CORS_ORIGIN`:

```
CORS_ORIGIN=https://leadbaze.io,https://leadflow-indol.vercel.app,http://localhost:5173,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:3000
```

### 2. Reiniciar o Serviço

Após atualizar a variável de ambiente:

1. Clique em **Manual Deploy**
2. Selecione **Clear build cache & deploy**
3. Aguarde o deploy completar

### 3. Verificar Configuração

O backend deve aceitar requisições dos seguintes domínios:

- ✅ `https://leadbaze.io` (DOMÍNIO PRINCIPAL)
- ✅ `https://leadflow-indol.vercel.app` (VERCEL)
- ✅ `http://localhost:5173` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:5177` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:5178` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:5179` (DESENVOLVIMENTO LOCAL)
- ✅ `http://localhost:3000` (DESENVOLVIMENTO LOCAL)

## 🔍 Verificação

Após a configuração, teste a conexão do WhatsApp:

1. Acesse: https://leadbaze.io/disparador
2. Clique em "Conectar WhatsApp"
3. Verifique se não há mais erros de CORS

## 📝 Notas Importantes

- **Segurança**: O CORS está configurado para permitir apenas origens específicas
- **Desenvolvimento**: Localhost está incluído para desenvolvimento local
- **Produção**: Apenas domínios autorizados podem acessar o backend
- **Cache**: O navegador pode cachear erros de CORS, teste em aba anônima

## 🆘 Suporte

Se o problema persistir:

1. Verifique se a variável foi salva corretamente
2. Confirme se o serviço foi reiniciado
3. Teste em navegador anônimo
4. Verifique os logs do backend no Render





