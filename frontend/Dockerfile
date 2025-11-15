# Dockerfile para Frontend RegistraSom
# Multi-stage build para otimização de tamanho

# Stage 1: Build do frontend
FROM node:22-alpine AS builder

# Metadados
LABEL maintainer="RegistraSom Team"
LABEL description="Frontend React para RegistraSom"

# Criar diretório de trabalho
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build de produção
RUN pnpm run build

# Stage 2: Servir com Nginx
FROM nginx:alpine

# Metadados
LABEL maintainer="RegistraSom Team"
LABEL description="Nginx serving RegistraSom frontend"

# Copiar build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta HTTP
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
