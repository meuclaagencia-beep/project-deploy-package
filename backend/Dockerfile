# Dockerfile para Backend RegistraSom
# Imagem base Python otimizada
FROM python:3.11-slim

# Metadados
LABEL maintainer="RegistraSom Team"
LABEL description="Backend Flask para análise de áudio e transcrição"

# Variáveis de ambiente para otimização Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependências do sistema necessárias para processamento de áudio
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Criar diretório de trabalho
WORKDIR /app

# Copiar e instalar dependências Python primeiro (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código do backend
COPY src/ ./src/

# Criar diretórios necessários com permissões adequadas
RUN mkdir -p uploads instance && \
    chmod 755 uploads instance

# Expor porta do Flask
EXPOSE 5000

# Variáveis de ambiente padrão
ENV FLASK_APP=src/main.py \
    FLASK_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Comando de inicialização com Gunicorn otimizado
CMD ["gunicorn", \
    "--bind", "0.0.0.0:5000", \
    "--workers", "2", \
    "--threads", "2", \
    "--timeout", "600", \
    "--graceful-timeout", "30", \
    "--keep-alive", "5", \
    "--max-requests", "100", \
    "--max-requests-jitter", "10", \
    "--worker-class", "sync", \
    "--worker-tmp-dir", "/dev/shm", \
    "--access-logfile", "-", \
    "--error-logfile", "-", \
    "--log-level", "info", \
    "src.main:app"]
