#!/bin/bash

###############################################################################
# RegistraSom - Script de Instalação Automatizada
# Este script instala e configura o RegistraSom em um servidor Ubuntu/Debian
###############################################################################

set -e  # Parar em caso de erro

echo "========================================="
echo "  RegistraSom - Instalação Automatizada"
echo "========================================="
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script deve ser executado como root (use sudo)"
    exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt-get update -y
apt-get upgrade -y

# Instalar dependências básicas
echo "📦 Instalando dependências básicas..."
apt-get install -y \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Docker
echo "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Adicionar repositório oficial do Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Iniciar e habilitar Docker
    systemctl start docker
    systemctl enable docker
    
    echo "✅ Docker instalado com sucesso!"
else
    echo "✅ Docker já está instalado"
fi

# Verificar instalação do Docker Compose
echo "🐳 Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    apt-get install -y docker-compose-plugin
fi
echo "✅ Docker Compose está disponível"

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p backend/uploads
mkdir -p backend/instance
chmod 755 backend/uploads
chmod 755 backend/instance

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure suas API keys!"
    else
        echo "❌ Arquivo .env.example não encontrado!"
        exit 1
    fi
fi

# Build e inicialização dos containers
echo "🔨 Construindo imagens Docker..."
docker compose build

echo "🚀 Iniciando containers..."
docker compose up -d

# Aguardar containers ficarem saudáveis
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker compose ps

echo ""
echo "========================================="
echo "  ✅ Instalação concluída com sucesso!"
echo "========================================="
echo ""
echo "🌐 Acesse a aplicação em: http://localhost"
echo "🔧 Backend API: http://localhost:5000/api/health"
echo ""
echo "📝 Comandos úteis:"
echo "  - Ver logs: docker compose logs -f"
echo "  - Parar: docker compose down"
echo "  - Reiniciar: docker compose restart"
echo "  - Reconstruir: docker compose up -d --build"
echo ""
echo "⚠️  Não esqueça de configurar o arquivo .env com suas API keys!"
echo ""
