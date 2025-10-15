#!/bin/bash

# ContentFlow AI - Script de Deploy
# Este script automatiza o deploy da aplicação

set -e

echo "🚀 Iniciando deploy do ContentFlow AI..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
fi

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado. Copiando env.production para .env..."
    cp env.production .env
    warn "IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!"
    read -p "Pressione Enter para continuar após editar o .env..."
fi

# Parar containers existentes
log "Parando containers existentes..."
docker-compose -f docker-compose.basic.yml down 2>/dev/null || true

# Remover imagens antigas (opcional)
log "Removendo imagens antigas..."
docker image prune -f

# Construir e iniciar containers
log "Construindo e iniciando containers..."
docker-compose -f docker-compose.basic.yml up --build -d

# Aguardar containers iniciarem
log "Aguardando containers iniciarem..."
sleep 30

# Verificar se aplicação está rodando
log "Verificando status da aplicação..."
if curl -f http://localhost:3000/api/test > /dev/null 2>&1; then
    log "✅ Aplicação está rodando em http://localhost:3000"
else
    error "❌ Aplicação não está respondendo. Verifique os logs com: docker-compose -f docker-compose.basic.yml logs"
fi

# Mostrar status dos containers
log "Status dos containers:"
docker-compose -f docker-compose.basic.yml ps

# Mostrar logs da aplicação
log "Logs da aplicação (últimas 20 linhas):"
docker-compose -f docker-compose.basic.yml logs --tail=20 app

echo ""
log "🎉 Deploy concluído com sucesso!"
log "📱 Acesse: http://localhost:3000"
log "🔧 Para ver logs: docker-compose -f docker-compose.basic.yml logs -f"
log "🛑 Para parar: docker-compose -f docker-compose.basic.yml down"
