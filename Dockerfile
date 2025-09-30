# Dockerfile para LeadFlow
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --production=false

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build:prod

# Estágio de produção
FROM nginx:alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx-servla.conf /etc/nginx/conf.d/default.conf

# Criar diretórios necessários
RUN mkdir -p /var/log/nginx /var/cache/nginx

# Expor porta
EXPOSE 80 443

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]
















































